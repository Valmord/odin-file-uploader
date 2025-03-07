const multer = require("multer");
const upload = multer({ dest: "uploads" });
const query = require("../db/queries");
const fs = require("fs/promises");

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

async function downloadFile(req, res) {
  console.log("Attempting to download file");

  const fileId = +req.params.id;

  try {
    const file = await query.downloadFile(fileId, req.user.id);
    res.download(`./uploads/${file.filename}`, file.originalName);
  } catch (err) {
    console.error("An error occured downloading file:", err);
    res.status(500).json({ message: err.message });
  }
}

async function deleteFile(req, res) {
  const fileId = +req.params.id;

  console.log("Attempting to delete file", fileId);

  const deleteFile = async (fileName) => {
    const path = `./uploads/${fileName}`;
    console.log(path);
    await fs.rm(path);
  };

  try {
    const filepath = await query.getFilename(fileId);
    await query.deleteFile(+req.params.id, req.user.id);
    await deleteFile(filepath.filename);
    console.log("Successfully deleted file");
    res.status(200).json({ message: "File sucessfully deleted" });
  } catch (err) {
    console.error(`An error occured deleting id ${req.params.id}`, err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getHomepage,

  postNewFile,

  downloadFile,
  deleteFile,
};
