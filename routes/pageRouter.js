const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");
const userController = require("../controllers/userController");

router.get("/", pageController.getHomepage);
router.get("/login", pageController.getLoginPage);
router.post("/login", pageController.postLoginUser);
router.post("/login2", pageController.postLoginPassword);

router.get("/signup", userController.getSignupPage);
router.post("/signup", userController.postSignupPage);

router.get("/test", (req, res) => res.send("noo"));

module.exports = router;
