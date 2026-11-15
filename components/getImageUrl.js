const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const getImageUrl = (
  url,
  placeholder = "https://placehold.co/600x400?text=Restaurant"
) => {
  if (!url) return placeholder;
  if (url.startsWith("http")) return url;
  return `${SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default getImageUrl;