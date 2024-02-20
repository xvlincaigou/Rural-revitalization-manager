const express = require("express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();
const auth = require("../controllers/auth.controller");

// POST /api/logout
router.post("/", auth.logout);

module.exports = router;