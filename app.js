const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const path = require("node:path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const { PORT, SECRET } = process.env;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use(express.json());

const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(
  expressSession({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
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
        where: {
          username,
        },
      });
      // const so = await queries.getUserByUsername(username);
      console.log(user);
      if (!user) {
        return done(null, false, { message: "Incorrect Username" });
      }
      console.log("User found, verifying password");

      const match = await bcrypt.compare(password, user.password);

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
    const user = await queries.getUserById(id);

    if (user) {
      done(null, user);
    }
  } catch (err) {
    done(err);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
