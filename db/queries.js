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

async function getUserFolders(userId) {
  const folders = await prisma.folder.findMany({
    where: {
      userId,
    },
    select: {
      folderName: true,
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

  console.log(files);
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

  console.log("mapped files");
  console.log(mappedFiles);

  return await appendFileSizeArray(mappedFiles);
}

async function downloadFile(id, userId) {
  const file = await prisma.file.findUnique({
    where: {
      id,
      userId,
    },
  });

  console.log(file);

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

  console.log(sharedFile);

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
  console.log(`fileid: ${id}`, `userId: ${userId}`);

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
  console.log(fileId, userId, "IDS HERE");

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

  console.log(JSON.stringify(sharedInfo));

  return sharedInfo;
}

async function postShareWithUser(sharedUsername, fileId, userId) {
  console.log(" ");
  console.log(sharedUsername, fileId, userId);
  console.log(" ");

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
  console.log("in here with", fileId, userId);

  const fileShared = await prisma.sharedFile.findFirst({
    where: {
      fileId,
      userId,
    },
  });

  console.log(fileShared);

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
  console.log(fileId, userId);
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
  console.log(shareWithSize);

  return shareWithSize;
}

async function createFolder(userId, folderName, parentFolder) {
  const folder = await prisma.folder.create({
    data: {
      folderName,
      userId,
    },
  });

  if (!folder) throw new Error("Couldn't create folder");

  return folder;
}

module.exports = {
  getUserByUsername,
  createUser,
  addNewFile,
  getUserFolders,
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
};
