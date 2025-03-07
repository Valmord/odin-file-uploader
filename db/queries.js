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
    },
  });
  console.log(files);
  return files;
}

module.exports = {
  getUserByUsername,
  createUser,
  addNewFile,
  getUserFiles,
};
