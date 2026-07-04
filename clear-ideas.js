const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.idea.deleteMany();
  console.log('Deleted all ideas');
}
run().finally(() => prisma.$disconnect());
