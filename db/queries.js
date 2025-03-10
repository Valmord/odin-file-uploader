const { prisma } = require("../prisma");
const fs = require("fs/promises");

async function getUserByUsername(value) {
  return await prisma.user.findUnique({
    where: { username: value },
  });
}

async function createUser(username, password) {
  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  });

  return user;
}

async function addNewFile({ originalname, filename }, userId) {
  await prisma.file.create({
    data: {
      originalName: originalname,
      filename,
      userId,
    },
  });
}

async function getFolderFromPath(userId, urlPath) {
  const folders = urlPath.split("/");

  const decodedFolders = folders.reduce((acc, folder, index) => {
    if (folder === "") return acc;
    if (folder === "folder" && index < 2) return acc;
    acc.push(decodeURIComponent(folder));
    return acc;
  }, []);

  // console.log(decodedFolders);

  let parentFolderId = null;
  let curFolder = null;
  for (const folder of decodedFolders) {
    const f = await prisma.folder.findFirst({
      where: {
        userId,
        folderName: folder,
        parentFolderId,
      },
    });

    console.log("F", f);

    if (!f) throw new Error("Invalid folder");

    parentFolderId = f.id;
    curFolder = f;
  }

  return { folderId: curFolder?.id, folderName: curFolder?.folderName };
}

async function addNewFileToFolder({ originalname, filename }, userId, urlPath) {
  const { folderId } = await getFolderFromPath(userId, urlPath);

  await prisma.file.create({
    data: {
      originalName: originalname,
      filename,
      userId,
      folderId,
    },
  });
}

async function appendFileSizeArray(files) {
  const updatedFiles = await Promise.all(
    files.map(async (file) => {
      const fileStats = await fs.stat(`./uploads/${file.filename}`);
      const fileSize =
        fileStats.size > 1_000_000
          ? (fileStats.size / 10000000).toFixed(2) + " mb"
          : (fileStats.size / 1000).toFixed(2) + " kb";
      return {
        ...file,
        fileSize,
      };
    })
  );
  return updatedFiles;
}

async function appendFileSizeSingleObj(file) {
  const fileStats = await fs.stat(`./uploads/${file.filename}`);
  const fileSize =
    fileStats.size > 1_000_000
      ? (fileStats.size / 10000000).toFixed(2) + " mb"
      : (fileStats.size / 1000).toFixed(2) + " kb";
  return {
    ...file,
    fileSize,
  };
}

async function getHomepageFolders(userId) {
  const folders = await prisma.folder.findMany({
    where: {
      userId,
      parentFolderId: null,
    },
    select: {
      folderName: true,
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return folders;
}

async function getUserFiles(id) {
  const files = await prisma.file.findMany({
    where: {
      userId: id,
    },
    select: {
      originalName: true,
      filename: true,
      id: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return await appendFileSizeArray(files);
}

async function getUserSharedFiles(id) {
  const files = await prisma.sharedFile.findMany({
    where: {
      userId: id,
    },
    select: {
      file: {
        select: {
          originalName: true,
          filename: true,
          id: true,
        },
      },
    },
    orderBy: {
      fileId: "asc",
    },
  });

  const mappedFiles = files.reduce((acc, cur) => {
    acc.push(cur.file);
    return acc;
  }, []);

  return await appendFileSizeArray(mappedFiles);
}

async function downloadFile(id, userId) {
  const file = await prisma.file.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!file) {
    throw new Error(
      "File doesn't exist or user doesn't have permission to access"
    );
  }

  return file;
}

async function downloadSharedFile(fileId, userId) {
  const sharedFile = await prisma.sharedFile.findFirst({
    where: {
      fileId,
      userId,
    },
    select: {
      file: true,
    },
  });

  if (!sharedFile) {
    throw new Error(
      "File doesn't exist or user doesn't have permission to access"
    );
  }

  return sharedFile.file;
}

async function getFilename(fileId) {
  return await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });
}

async function deleteFile(id, userId) {
  const file = await prisma.file.findUnique({
    where: {
      id,
      userId,
    },
    select: {
      filename: true,
    },
  });

  if (!file) {
    throw new Error(
      "File doesn't exist or user doesn't have permission to delete"
    );
  }

  await prisma.file.delete({
    where: {
      id,
      userId,
    },
  });
}

async function getSharedFileInfo(fileId, userId) {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) throw new Error("File doesn't exist or invalid permissions");

  const sharedInfo = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
    select: {
      isPublic: true,
      shareId: true,
      sharedWith: {
        select: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  return sharedInfo;
}

async function postShareWithUser(sharedUsername, fileId, userId) {
  const validUser = await prisma.user.findUnique({
    where: {
      username: sharedUsername,
    },
    select: {
      id: true,
    },
  });

  if (!validUser) throw new Error("Invalid username, try another");

  const validRequest = await prisma.file.findUnique({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!validRequest)
    throw new Error("Invalid file or user invalid permissions");

  const userAlreadySharedWith = await prisma.sharedFile.findFirst({
    where: {
      fileId,
      userId: validUser.id,
    },
  });

  if (userAlreadySharedWith)
    throw new Error(`File already shared with ${sharedUsername}`);

  if (userId === validUser.id)
    throw new Error("You can't share a file with yourself...");

  await prisma.sharedFile.create({
    data: {
      fileId,
      userId: validUser.id,
    },
  });
}

// From the Shared User
async function putUnlinkSharedFile(fileId, userId) {
  const fileShared = await prisma.sharedFile.findFirst({
    where: {
      fileId,
      userId,
    },
  });

  if (!fileShared) throw new Error("File doesn't exist");

  await prisma.sharedFile.delete({
    where: {
      fileId_userId: {
        fileId,
        userId,
      },
    },
  });
}

async function updatePublicLink(fileId, userId) {
  const validUser = await prisma.file.findUnique({
    where: {
      id: fileId,
      userId,
    },
    select: {
      shareId: true,
      isPublic: true,
    },
  });

  if (!validUser) throw new Error("Invalid File or User");

  await prisma.file.update({
    where: {
      id: fileId,
      userId,
    },
    data: {
      isPublic: !validUser.isPublic,
    },
  });

  return validUser.shareId;
}

async function getPublicShare(shareId) {
  const share = await prisma.file.findUnique({
    where: {
      shareId,
    },
    select: {
      originalName: true,
      filename: true,
      shareId: true,
    },
  });

  if (!share) throw new Error("Invalid share id");

  const shareWithSize = await appendFileSizeSingleObj(share);

  return shareWithSize;
}

async function createFolder(userId, folderName, parentPath) {
  const parentFolder = await getFolderFromPath(userId, parentPath);

  const invalidFolderName = await prisma.folder.findFirst({
    where: {
      folderName,
      userId,
      parentFolderId: parentFolder.folderId,
    },
  });

  if (invalidFolderName)
    throw new Error("Folder of same name and destination exist");

  const folder = await prisma.folder.create({
    data: {
      folderName,
      userId,
      parentFolderId: parentFolder.folderId,
    },
  });

  if (!folder) throw new Error("Couldn't create folder");

  return folder;
}

async function getUserFolder(userId, urlPath) {
  const { folderId, folderName } = await getFolderFromPath(userId, urlPath);

  const folderContents = await prisma.folder.findMany({
    where: {
      userId,
      id: folderId,
    },
    select: {
      files: true,
    },
  });

  const otherFolders = await prisma.folder.findMany({
    where: {
      userId,
      parentFolderId: folderId,
    },
  });

  // console.log(otherFolders);

  const files = await appendFileSizeArray(folderContents[0].files);

  return {
    files,
    folders: otherFolders,
    currentFolder: folderName,
  };
}

async function reconstructPath(folder, userId) {
  const urlArray = [folder.folderName];

  let currentFolder = folder;
  while (true) {
    if (!currentFolder.parentFolderId) break;
    const parentFolder = await prisma.folder.findUnique({
      where: {
        userId,
        id: currentFolder.parentFolderId,
      },
      select: {
        folderName: true,
        parentFolderId: true,
      },
    });

    console.log("Folder..", parentFolder);

    if (!parentFolder) break;

    currentFolder = parentFolder;
    urlArray.unshift(currentFolder.folderName);
  }

  return urlArray.join("/");
}

async function deleteFolder(folderId, userId) {
  const validFolder = await prisma.folder.findUnique({
    where: {
      id: folderId,
      userId,
    },
  });

  if (!validFolder)
    throw new Error("Invalid folder or Invalid user permissions");

  const folder = await prisma.folder.delete({
    where: {
      id: folderId,
      userId,
    },
  });

  console.log(`folder deleted`, folder);
}

async function getSearchedFiles(userId, search) {
  const files = await prisma.file.findMany({
    where: {
      userId,
      originalName: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      filename: true,
      originalName: true,
      id: true,
    },
  });

  let filesWithSizes = [];
  if (files) {
    filesWithSizes = appendFileSizeArray(files);
  }

  return filesWithSizes;
}

async function getSearchedFolders(userId, search) {
  const folders = await prisma.folder.findMany({
    where: {
      userId,
      folderName: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      folderName: true,
      id: true,
    },
  });

  return folders || [];
}

module.exports = {
  getUserByUsername,
  createUser,

  addNewFile,
  addNewFileToFolder,

  getHomepageFolders,
  getUserFiles,
  getUserSharedFiles,
  downloadFile,
  downloadSharedFile,
  deleteFile,
  getFilename,

  getSharedFileInfo,
  postShareWithUser,

  putUnlinkSharedFile,
  updatePublicLink,
  getPublicShare,

  createFolder,
  getUserFolder,

  reconstructPath,
  deleteFolder,

  getSearchedFiles,
  getSearchedFolders,
};
