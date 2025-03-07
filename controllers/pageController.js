const multer = require("multer");
const upload = multer({ dest: "uploads" });
const query = require("../db/queries");

async function getHomepage(req, res) {
  console.log(req.user);
  if (!req.user) {
    return res.redirect("login");
  }

  const files = await query.getUserFiles(req.user.id);

  res.render("index", { title: "Homepage", user: req.user.username, files });
}

const postNewFile = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      await query.addNewFile(req.file, req.user.id);
      console.log("Succesfully added file");
    } catch (err) {
      console.error("Filed to add new file", err);
    } finally {
      console.log(req.file);
      res.redirect("/");
    }
  },
];

module.exports = {
  getHomepage,

  postNewFile,
};
