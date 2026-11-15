
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const ownerRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "fill all the required fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const owner = await User.create({
      name,
      email,
      password: passwordHash,
      phone,
      role: "owner",
    });

    return res.status(201).json({
      message: "owner registered successfully",
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


const ownerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "fill all the required fields",
      });
    }

    const owner = await User.findOne({ email });

    if (!owner || owner.role !== "owner") {
      return res.status(401).json({
        message: "owner not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      owner.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: owner._id,
        role: owner.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "owner login successful",
      token,
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  ownerRegister,
  ownerLogin,
};
