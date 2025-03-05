function getHomepage(req, res) {
  if (!req.user) {
    return res.redirect("signin");
  }
  res.render("index", { title: "Homepage" });
}

function getLoginPage(req, res) {
  res.render("login", { title: "Sign in" });
}

module.exports = {
  getHomepage,
  getLoginPage,
};
