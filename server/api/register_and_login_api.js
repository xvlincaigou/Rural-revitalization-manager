const express = require("express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();
const auth = require("../controllers/auth.controller");

// POST /api/register
router.post("/", auth.register);

// GET /api/login
router.get("/", auth.login);

module.exports = router;