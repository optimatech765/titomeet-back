//create a seed for the prisma client

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const categories = [
      {
        name: 'Music',
        description: 'Music events',
      },
      {
        name: 'Food',
        description: 'Food events',
      },
      {
        name: 'Art',
        description: 'Art events',
      },
      {
        name: 'Sports',
        description: 'Sports events',
      },
      {
        name: 'Games',
        description: 'Games events',
      },
      {
        name: 'Dance',
        description: 'Dance events',
      },
      {
        name: 'Fashion',
        description: 'Fashion events',
      },
      {
        name: 'Tech',
        description: 'Technology events',
      },
      {
        name: 'Science',
        description: 'Science events',
      },
    ];

    const categoriesCreated = await prisma.eventCategory.findMany({
      where: {
        name: {
          in: categories.map((category) => category.name),
        },
      },
    });

    const categoriesNotCreated = categories.filter(
      (category) => !categoriesCreated.some((c) => c.name === category.name),
    );

    if (categoriesNotCreated.length > 0) {
      console.log(`Creating ${categoriesNotCreated.length} categories`);
      await prisma.eventCategory.createMany({
        data: categoriesNotCreated,
      });
      console.log(`Created ${categoriesNotCreated.length} categories`);
    }
  } catch (error) {
    console.error(error);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
