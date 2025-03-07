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

async function downloadFile(id, userId) {
  console.log(`fileid: ${id}`, `userId: ${userId}`);

  const file = await prisma.file.findUnique({
    where: {
      id,
      userId,
    },
  });

  console.log(file);

  if (!file) {
    console.log("in here");
    throw new Error(
      "File doesn't exist or user doesn't have permission to access"
    );
  }

  return file;
}

module.exports = {
  getUserByUsername,
  createUser,
  addNewFile,
  getUserFiles,
  downloadFile,
};
