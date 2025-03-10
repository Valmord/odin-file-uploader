const multer = require("multer");
const upload = multer({ dest: "uploads" });
const query = require("../db/queries");
const fs = require("fs/promises");
const { body, validationResult } = require("express-validator");

function authenticateUser(req, res, next) {
  if (
    req.path === "/login" ||
    req.path === "/signup" ||
    req.path === "/login2"
  ) {
    // Allow these routes to proceed
    return next();
  }
  if (!req.user) {
    // Assuming you store user ID in session
    return res.redirect("/login");
  }
  next();
}

async function getHomepage(req, res) {
  const userId = +req.user.id;

  try {
    const folders = await query.getHomepageFolders(userId);
    console.log(folders);
    const files = await query.getUserFiles(userId);
    res.render("index", {
      title: "Homepage",
      user: req.user.username,
      folders,
      files,
      shares: [],
      activePage: "index",
    });
  } catch (error) {
    console.error("Error rendering home page", error);
    res.status(404).json({ error: error.message });
  }
}

async function getSearchResults(req, res) {
  const userId = +req.user.id;
  const search = req.query.q;

  try {
    const files = await query.getSearchedFiles(userId, search);
    const folders = await query.getSearchedFolders(userId, search);

    res.render("index", {
      title: `Search: ${search}`,
      user: req.user.username,
      folders,
      files,
      shares: [],
      activePage: "index",
    });
  } catch (error) {
    console.error("Error rendering home page", error);
    res.status(404).json({ error: error.message });
  }
}

async function getHomePageFolder(req, res) {
  const userId = +req.user.id;
  const url = req.params[0];

  try {
    const { files, folders, currentFolder } = await query.getUserFolder(
      userId,
      url
    );
    res.render("index", {
      title: currentFolder,
      user: req.user.username,
      folders,
      files,
      shares: [],
      activePage: "index",
    });
  } catch (error) {
    console.error("Error getting folders for home page", error);
    res.status(404).json({ error: error.message });
  }
}

async function getSharedPage(req, res) {
  if (!req.user) {
    return res.redirect("login");
  }

  const shares = await query.getUserSharedFiles(+req.user.id);

  res.render("index", {
    title: "Shared Files",
    user: req.user.username,
    files: [],
    shares,
    activePage: "shares",
  });
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

const postNewFileToFolder = [
  upload.single("file"),
  async (req, res, next) => {
    const folderName = req.params[0];
    try {
      await query.addNewFileToFolder(req.file, req.user.id, folderName);
      console.log("Succesfully added file");
    } catch (err) {
      console.error("Filed to add new file", err);
    } finally {
      console.log(req.file);
      res.redirect(req.originalUrl);
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
    console.error("An error occurred downloading file:", err);
    res.status(500).json({ message: err.message });
  }
}

async function downloadShare(req, res) {
  console.log("Attempting to download shared file");

  const fileId = +req.params.id;

  try {
    const file = await query.downloadSharedFile(fileId, +req.user.id);
    res.download(`./uploads/${file.filename}`, file.originalName);
  } catch (err) {
    console.error("An error occurred downloading file:", err);
    res.status(500).json({ message: err.message });
  }
}

async function deleteFile(req, res) {
  const fileId = +req.params.id;

  console.log("Attempting to delete file", fileId);

  const deleteFile = async (fileName) => {
    const path = `./uploads/${fileName}`;
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

async function getSharedFileInfo(req, res) {
  const fileId = +req.params.id;
  const userId = req.user.id;

  try {
    const sharedInfo = await query.getSharedFileInfo(fileId, userId);
    res.json({ sharedInfo });
  } catch (err) {
    console.error("Error getting file info, or user invalid permissions", err);
    res.status(404).json({ error: "File doesn't exist or invalid user" });
  }
}

async function postShareWithUser(req, res) {
  try {
    await query.postShareWithUser(
      req.body.username,
      req.body.fileId,
      req.user.id
    );
    res.json({ message: `Succesfully shared with ${req.body.username}` });
  } catch (error) {
    console.error(`Error sharing with user ${req.body.username}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function unshareShare(req, res) {
  const fileId = +req.params.id;
  const userId = req.user.id;

  try {
    await query.putUnlinkSharedFile(fileId, userId);
    res.status(200).json({ message: "Successfully unlinked file" });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
}

async function putPublicFileShare(req, res) {
  const fileId = +req.body.fileId;
  const userId = req.user.id;

  try {
    const link = await query.updatePublicLink(fileId, userId);
    res.json({ link });
  } catch (error) {
    console.error(`Error updating file ${fileId}`, error);
    res.status(404).json({ error: error.message });
  }
}

async function getPublicFileshare(req, res) {
  const shareId = req.params.id;
  try {
    const shared = await query.getPublicShare(shareId);
    res.render("public-share", { title: "Download file", ...shared });
  } catch (error) {
    console.error("In error occurred getting Public Fileshare", error);
    res.status(404).json({ error: error.message });
  }
}

async function getPublicFileDownload(req, res) {
  const shareId = req.params.id;

  try {
    const file = await query.getPublicShare(shareId);
    res.download(`./uploads/${file.filename}`, file.originalName);
  } catch (error) {
    console.error("Error downloading file", shareId);
    res.status(404).json({ error: error.message });
  }
}

const postCreateFolder = [
  [
    body("folder-name")
      .notEmpty()
      .withMessage("Field Required")
      .isLength({
        max: 30,
      })
      .withMessage("Folders can only be 30 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap = errors.array().reduce((acc, err) => {
        if (!acc[err.path]) acc[err.path] = [];
        acc[err.path].push(err.msg);
        return acc;
      }, {});

      return res.status(404).json({ errors: errorMap });
    }
    const folderName = req.body["folder-name"];
    const userId = req.user.id;
    const path = req.body.path;

    try {
      const folder = await query.createFolder(userId, folderName, path);
      const newUrl = await query.reconstructPath(folder, userId);
      res.redirect(newUrl);
    } catch (error) {
      console.error("Error creating file", error);
      res.status(404).json({ error: error.message });
    }
  },
];

async function deleteFolder(req, res) {
  const folderId = +req.params.id;
  const userId = req.user.id;

  try {
    await query.deleteFolder(folderId, userId);
    console.log("Successfully deleted folder");
    res.status(200).json({ message: "Successfully deleted folder" });
  } catch (error) {
    console.error("Error deleting folder: ", error);
    res.status(404).json({ error: error.message });
  }
}

module.exports = {
  authenticateUser,
  getHomepage,
  getSharedPage,

  postNewFile,
  postNewFileToFolder,

  downloadFile,
  deleteFile,
  downloadShare,

  getSharedFileInfo,
  postShareWithUser,

  unshareShare,
  putPublicFileShare,
  getPublicFileshare,
  getPublicFileDownload,

  postCreateFolder,
  getHomePageFolder,
  deleteFolder,
  getSearchResults,
};
