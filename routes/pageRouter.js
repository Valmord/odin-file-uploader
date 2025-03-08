const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");
const userController = require("../controllers/userController");

router.get("/", pageController.getHomepage);
router.get("/shares", pageController.getSharedPage);
router.get("/login", userController.getLoginPage);
router.post("/login", userController.postLoginUser);
router.post("/login2", userController.postLoginPassword);

router.get("/signup", userController.getSignupPage);
router.post("/signup", userController.postSignupPage);

router.get("/logout", userController.getLogout);

router.post("/file/new", pageController.postNewFile);
router.get("/file/download/:id", pageController.downloadFile);
router.delete("/file/delete/:id", pageController.deleteFile);
router.get("/share/download/:id", pageController.downloadShare);

router.get("/file/share/:id", pageController.getSharedFileInfo);
router.post("/file/share", pageController.postShareWithUser);

module.exports = router;
