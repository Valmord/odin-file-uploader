const { body, validationResult } = require("express-validator");
const { prisma } = require("../prisma");

function getHomepage(req, res) {
  if (!req.user) {
    return res.redirect("login");
  }
  res.render("index", { title: "Homepage" });
}

function getLoginPage(req, res) {
  res.render("login", { title: "Sign in" });
}

const postLoginUser = [
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("This is a required field")
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

const postLoginPassword = [
  [
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Is a required field")
      .isLength({ min: 8 })
      .withMessage("Required to be 8 or more characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.response(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    if (!username && !password) {
      return res
        .response(400)
        .json({ errors: ["Username or Password not defined"] });
    }

    console.log(req.body);
    console.log(username, password);

    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (user) {
      redirect("/login");
    }

    try {
      await prisma.user.create({
        data: { username: username, password: password },
      });
      console.log("Sucessfully made user");
      res.redirect("/");
    } catch (err) {
      console.log("Error occured making user", err);
    }
  },
];

module.exports = {
  getHomepage,
  getLoginPage,

  postLoginUser,
  postLoginPassword,
};
