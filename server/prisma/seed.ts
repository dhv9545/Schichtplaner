import { prisma } from '../src/prisma.js';
import { seedDatabase } from '../src/services/seedService.js';

seedDatabase()
  .catch((e) => {
    console.error('Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
