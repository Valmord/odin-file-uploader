const { body, validationResult } = require("express-validator");
const { prisma } = require("../prisma");

function getHomepage(req, res) {
  console.log(req.user);
  if (!req.user) {
    return res.redirect("login");
  }
  res.render("index", { title: "Homepage", user: req.user.username });
}

module.exports = {
  getHomepage,
};
