const { body, validationResult } = require("express-validator");
const { prisma } = require("../prisma");

function getSignupPage(req, res) {
  if (req.user) {
    return res.redirect("/");
  }

  res.render("signup", {
    title: "Signup Page",
    formData: req.body,
    errors: {},
  });
}

const signupValidator = [
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
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Is a required field")
    .isLength({ min: 8 })
    .withMessage("Required to be 8 or more characters"),
];

const postSignupPage = [
  signupValidator,
  async (req, res) => {
    const errors = validationResult(req);
    console.log("errors", errors);
    if (!errors.isEmpty()) {
      const errorMap = errors.array().reduce((acc, err) => {
        if (!acc[err.path]) acc[err.path] = [];
        acc[err.path].push(err.msg);
        return acc;
      }, {});

      console.log(errorMap);

      return res.render("signup", {
        title: "Signup Page",
        formData: req.body,
        errors: errorMap,
      });
    }

    try {
      const { username, password } = req.body;
      const user = await prisma.user.create({
        data: {
          username,
          password,
        },
      });

      console.log(user);

      console.log("Account Sucessfully created");
      return res.redirect("/login");
    } catch (err) {
      console.error("Couldn't create new account", err);
    }
  },
];

module.exports = { getSignupPage, postSignupPage };
