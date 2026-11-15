
const express = require("express");
const router = express.Router();

const {
  ownerRegister,
  ownerLogin,
} = require("../controllers/ownerController");

router.post("/register", ownerRegister);
router.post("/login", ownerLogin);

module.exports = router;
