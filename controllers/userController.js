const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const query = require("../db/queries");

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
      const user = await query.getUserByUsername(value);
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
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });

      console.log("Account Sucessfully created");
      return res.redirect("/login");
    } catch (err) {
      console.error("Couldn't create new account", err);
    }
  },
];

function getLoginPage(req, res) {
  res.render("login", { title: "Sign in", formData: {}, errors: {} });
}

const postLoginUser = [
  [body("username").trim().notEmpty().withMessage("This is a required field")],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      const errorMap = errors.array().reduce((acc, err) => {
        if (!acc[err.path]) acc[err.path] = [];
        acc[err.path] = err.msg;
        return acc;
      }, {});
      return res.render("signup", {
        title: "Login Form",
        formData: req.body,
        errors: errorMap,
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { username: req.body.username },
      });

      if (!user) {
        return res.render("login", {
          title: "Error with non existing user",
          formData: req.body,
          errors: { username: ["Username not registered"] },
        });
      }

      return res.render("login2", {
        title: "Login Password",
        username: req.body.username,
        formData: {},
        errors: {},
      });
    } catch (err) {
      console.error("Error with username", req.body.username);
    }
  },
];

const postLoginPassword = [
  [body("password").trim().notEmpty().withMessage("Is a required field")],
  async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      const errorMap = errors.array().reduce((acc, err) => {
        if (!acc[err.path]) acc[err.path] = [];
        acc[err.path] = err.msg;
        return acc;
      }, {});

      return res.render("signup2", {
        title: "Login password",
        formData: req.body,
        errors: errorMap,
        username: req.body.username,
      });
    }

    const { username, password } = req.body;

    if (!username && !password) {
      return res
        .response(400)
        .json({ errors: ["Username or Password not defined"] });
    }

    next();
  },
  (req, res, next) =>
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.render("login2", {
          title: "Login error",
          formData: req.body,
          errors: { password: ["Username or Password is invalid"] },
          username: req.body.username,
        });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    })(req, res, next),
];

function getLogout(req, res) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

module.exports = {
  getSignupPage,
  postSignupPage,

  getLogout,
  getLoginPage,
  postLoginUser,
  postLoginPassword,
};
