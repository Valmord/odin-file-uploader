const { prisma } = require("../prisma");

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

async function getUserFiles(id) {
  const files = await prisma.file.findMany({
    where: {
      userId: id,
    },
    select: {
      originalName: true,
      id: true,
    },
  });
  console.log(files);
  return files;
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
          id: true,
        },
      },
    },
  });

  const mappedFiles = files.reduce((acc, cur) => {
    acc.push(cur.file);
    return acc;
  }, []);

  console.log("mapped files");
  console.log(mappedFiles);

  return mappedFiles;
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

  const sharedInfo = await prisma.sharedFile.findMany({
    where: {
      fileId,
    },
    select: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  console.log("shared info", sharedInfo);

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

module.exports = {
  getUserByUsername,
  createUser,
  addNewFile,
  getUserFiles,
  getUserSharedFiles,
  downloadFile,
  downloadSharedFile,
  deleteFile,
  getFilename,

  getSharedFileInfo,
  postShareWithUser,

  putUnlinkSharedFile,
};
