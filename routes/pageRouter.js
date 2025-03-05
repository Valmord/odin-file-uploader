const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");

router.get("/", pageController.getHomepage);
router.get("/login", pageController.getLoginPage);
router.post("/login", pageController.postLoginPage);

router.get("/test", (req, res) => res.send("noo"));

module.exports = router;
