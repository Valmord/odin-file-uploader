const { body, validationResult } = require("express-validator");
const { prisma } = require("../prisma");

function getHomepage(req, res) {
  if (!req.user) {
    return res.redirect("signin");
  }
  res.render("index", { title: "Homepage" });
}

function getLoginPage(req, res) {
  res.render("login", { title: "Sign in" });
}

const postLoginPage = [
  [
    body("username")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Username must be 8 or more characters")
      .custom(async (value) => {
        const user = await prisma.user.findUnique({
          where: { username: value },
        });
        console.log(user);
        if (user) throw new Error("Username already registered");
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      // To be figured out

      res.response(400).json({ errors: errors.array() });
    }

    return res.render("login2", {
      title: "Login Password",
      username: req.body.username,
    });
  },
];

module.exports = {
  getHomepage,
  getLoginPage,

  postLoginPage,
};
