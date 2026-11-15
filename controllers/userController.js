
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "fill all the required fields",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "user already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: passwordHash,
      phone,
      role: "user",
    });

    return res.status(201).json({
      message: "user created successfully",
      newUser: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "fill all the required fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "user doesn't exist",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "only user can login here",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { register, userLogin };
