const { body, validationResult } = require("express-validator");
const { prisma } = require("../prisma");

function getHomepage(req, res) {
  if (!req.user) {
    return res.redirect("login");
  }
  res.render("index", { title: "Homepage" });
}

module.exports = {
  getHomepage,
};
