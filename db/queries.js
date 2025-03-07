const { prisma } = require("../prisma");

async function getUserByUsername(value) {
  return await prisma.user.findUnique({
    where: { username: value },
  });
}

module.exports = {
  getUserByUsername,
};
