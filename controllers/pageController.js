const { body, validationResult } = require("express-validator");
const { prisma } = require("../prisma");
const multer = require("multer");
const upload = multer({ dest: "uploads" });

function getHomepage(req, res) {
  console.log(req.user);
  if (!req.user) {
    return res.redirect("login");
  }
  res.render("index", { title: "Homepage", user: req.user.username });
}

const postNewFile = [
  upload.single("file"),
  (req, res, next) => {
    console.log(req.file);
    res.redirect("/");
  },
];

module.exports = {
  getHomepage,

  postNewFile,
};
