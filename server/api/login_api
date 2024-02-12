const express = require("express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();
const auth = require("../controllers/auth.controller");

// POST /api/login
router.post("/", auth.login);

module.exports = router;