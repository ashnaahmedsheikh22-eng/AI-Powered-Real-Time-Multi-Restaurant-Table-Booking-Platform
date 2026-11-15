
const { GoogleGenAI } = require("@google/genai");
const Restaurant = require("../models/restaurants");
const Table = require("../models/tables");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// GEMINI RESPONSE
const getGeminiResponse = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 700,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  return response.text;
};

// PARSE GEMINI JSON
const parseGeminiJSON = (text) => {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Invalid Gemini JSON response");
  }

  return JSON.parse(cleaned.substring(start, end + 1));
};

// FALLBACK RECOMMENDATIONS
const buildFallbackRecommendations = (
  restaurants,
  prefs
) => {
  const {
    cuisine,
    location,
    preference,
    partySize,
  } = prefs;

  const cuisineText = (cuisine || "").trim().toLowerCase();
  const locationText = (location || "").trim().toLowerCase();

  const words = (preference || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const hasFilter =
    cuisineText || locationText || words.length > 0;

  const scored = restaurants
    .map((restaurant) => {
      let score = 0;
      const reasons = [];

      // CUISINE
      if (
        cuisineText &&
        restaurant.cuisine?.toLowerCase().includes(cuisineText)
      ) {
        score += 3;
        reasons.push(`Matches your ${restaurant.cuisine} cuisine preference`);
      }

      // LOCATION
      if (
        locationText &&
        restaurant.address?.toLowerCase().includes(locationText)
      ) {
        score += 3;
        reasons.push("Matches your preferred location");
      }

      // PREFERENCE
      const searchableText = `
        ${restaurant.name || ""}
        ${restaurant.description || ""}
        ${restaurant.cuisine || ""}
        ${restaurant.address || ""}
      `.toLowerCase();

      const matchedWords = words.filter((word) =>
        searchableText.includes(word)
      );

      if (matchedWords.length > 0) {
        score += matchedWords.length;
        reasons.push(
          `Matches your preference: ${matchedWords.join(", ")}`
        );
      }

      if (partySize) {
        reasons.push(`Suitable for ${partySize} guests`);
      }

      return {
        restaurant,
        score,
        reasons,
      };
    })
    .filter((item) => !hasFilter || item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map((item) => ({
    ...item.restaurant,
    aiReason:
      item.reasons.join(". ") ||
      "A suitable option from our approved restaurants.",
  }));
};

// MAIN RECOMMENDATION CONTROLLER
const recommendRestaurants = async (req, res) => {
  try {
    const {
      cuisine,
      location,
      partySize,
      preference,
    } = req.body;

    // VALIDATION
    if (!cuisine && !location && !partySize && !preference) {
      return res.status(400).json({
        message: "Please provide your preferences",
      });
    }

    if (
      partySize !== undefined &&
      partySize !== null &&
      partySize !== "" &&
      (!Number.isInteger(Number(partySize)) ||
        Number(partySize) <= 0)
    ) {
      return res.status(400).json({
        message: "Please provide a valid party size",
      });
    }

    // FETCH APPROVED RESTAURANTS
    let restaurants = await Restaurant.find({
      status: "approved",
    })
      .select(
        "name description cuisine address imageUrl openingClosingTime"
      )
      .lean();

    if (!restaurants.length) {
      return res.status(200).json({
        message: "No approved restaurants available",
        source: "database",
        restaurants: [],
      });
    }

    // FILTER BY TABLE CAPACITY
    if (partySize) {
      const size = Number(partySize);

      const restaurantIds = await Table.find({
        isActive: true,
        capacity: { $gte: size },
      }).distinct("restaurantId");

      const allowedIds = restaurantIds.map((id) =>
        id.toString()
      );

      restaurants = restaurants.filter((restaurant) =>
        allowedIds.includes(restaurant._id.toString())
      );
    }

    if (!restaurants.length) {
      return res.status(200).json({
        message: "No restaurants have suitable tables for this party size",
        source: "database",
        restaurants: [],
      });
    }

    // SEND ONLY REAL DATABASE RESTAURANTS TO GEMINI
    const availableRestaurants = restaurants.map((restaurant) => ({
      id: restaurant._id.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      address: restaurant.address,
      description: restaurant.description,
      openingHours: restaurant.openingClosingTime,
    }));

    const prompt = `
You are a restaurant recommendation assistant.

Customer preferences:
Cuisine: ${cuisine || "Any"}
Location: ${location || "Any"}
Party Size: ${partySize || "Not specified"}
Preference: ${preference || "Not specified"}

Available restaurants:
${JSON.stringify(availableRestaurants)}

Instructions:
1. Recommend up to 3 restaurants.
2. Only recommend restaurants from the available list.
3. Use the exact restaurant ID provided.
4. Never invent restaurant IDs or details.
5. Give one short reason for every recommendation.
6. If no restaurants match, return an empty recommendations array.
7. Return ONLY valid JSON in this exact format:

{
  "recommendations": [
    {
      "id": "EXACT_RESTAURANT_ID",
      "reason": "Short recommendation reason"
    }
  ]
}
`;

    // TRY GEMINI
    try {
      console.log("Gemini recommendation started...");
      console.log("Using model:", MODEL);

      const geminiText = await getGeminiResponse(prompt);
      const parsed = parseGeminiJSON(geminiText);

      if (!Array.isArray(parsed.recommendations)) {
        throw new Error("Invalid recommendations format");
      }

      const restaurantMap = new Map(
        restaurants.map((restaurant) => [
          restaurant._id.toString(),
          restaurant,
        ])
      );

      const seenIds = new Set();

      const recommendedRestaurants = parsed.recommendations
        .slice(0, 3)
        .map((item) => {
          const id = String(item.id || "");

          if (seenIds.has(id)) return null;

          const restaurant = restaurantMap.get(id);

          if (!restaurant) return null;

          seenIds.add(id);

          return {
            ...restaurant,
            aiReason:
              typeof item.reason === "string"
                ? item.reason
                : "Recommended based on your preferences.",
          };
        })
        .filter(Boolean);

      // INVALID IDS: USE FALLBACK
      if (
        parsed.recommendations.length > 0 &&
        recommendedRestaurants.length === 0
      ) {
        throw new Error("Gemini returned invalid restaurant IDs");
      }

      console.log("Gemini recommendations successful");

      return res.status(200).json({
        message: "Recommendations generated successfully",
        source: "gemini",
        restaurants: recommendedRestaurants,
      });
    } catch (aiError) {
      console.log("GEMINI ERROR:", aiError.message);
      console.log("Using MongoDB fallback...");
    }

    // MONGODB FALLBACK
    const fallbackRestaurants = buildFallbackRecommendations(
      restaurants,
      {
        cuisine,
        location,
        partySize,
        preference,
      }
    );

    return res.status(200).json({
      message: "Recommendations generated successfully",
      source: "fallback",
      restaurants: fallbackRestaurants,
    });

  } catch (error) {
    console.log("AI CONTROLLER ERROR:", error);

    return res.status(500).json({
      message: "AI recommendations are unavailable right now",
    });
  }
};

module.exports = {
  recommendRestaurants,
};
