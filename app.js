// Core modules
const path = require("node:path");
require("dotenv").config();

// Third-party modules
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const expressSession = require("express-session");
const { PrismaClient, Prisma } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// Local modules
const pageRouter = require("./routes/pageRouter");
const pageController = require("./controllers/pageController");

// Initialize app
const app = express();
const { prisma } = require("./prisma");
const { PORT, SECRET } = process.env;

// Set up views and static files
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use(express.json());

// app.use(
//   expressSession({
//     secret: SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 1000 * 60 * 60,
//     },
//     store: new PrismaSessionStore(new PrismaClient(), {
//       checkPeriod: 2 * 60 * 1000,
//       dbRecordIdIsSessionId: true,
//       dbRecordIdFunction: undefined,
//     }),
//   })
// );

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("inside strategy");

      const user = await prisma.user.findUnique({
        where: { username: username },
      });

      if (!user) {
        return done(null, false, { message: "Incorrect Username" });
      }
      console.log("User found, verifying password");

      const match = await bcrypt.compare(password, user.password);

      console.log(match);

      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      console.error("Error checking user", err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (user) {
      done(null, user);
    }
  } catch (err) {
    done(err);
  }
});

app.use(pageController.authenticateUser);
app.use("/", pageRouter);

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
