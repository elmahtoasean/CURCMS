import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPlainPassword = 'admin123';
  const adminHashed = bcrypt.hashSync(adminPlainPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      isMainAdmin: true,
      isVerified: true,
      role: 'ADMIN',
    },
    create: {
      name: 'Main Admin',
      email: adminEmail,
      password: adminHashed,
      role: 'ADMIN',
      isVerified: true,
      isMainAdmin: true,
      profile_image: null,
    },
  });

  await prisma.admin.upsert({
    where: {
  
      admin_id: 1, 
    update: {},
    create: { user_id: adminUser.user_id },
  }).catch(async () => {
    const existingAdmin = await prisma.admin.findFirst({ where: { user_id: adminUser.user_id } });
    if (!existingAdmin) {
      await prisma.admin.create({ data: { user_id: adminUser.user_id } });
    }
  });

  await prisma.department.createMany({
    data: [
      { department_name: 'CSE' },
      { department_name: 'EEE' },
    ],
    skipDuplicates: true,
  });


  const domains = [
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision',
    'Data Science',
    'Robotics',
    'Embedded Systems',
    'Power Electronics',
    'Control Systems',
    'Renewable Energy Systems',
    'Signal Processing',
    'Microelectronics',
    'VLSI Design',
    'Software Engineering',
    'Cybersecurity',
    'Computer Networks',
    'Databases and Information Systems',
    'Human-Computer Interaction',
    'Operating Systems',
    'Distributed Systems',
  ];

  await prisma.domain.createMany({
    data: domains.map((name) => ({ domain_name: name })),
    skipDuplicates: true,
  });

  // ==== 4) userdomain: map admin to a few domains (optional) ====
  // fetch some domains by name
  const wanted = ['Software Engineering', 'Cybersecurity'];
  const domainRows = await prisma.domain.findMany({
    where: { domain_name: { in: wanted } },
    select: { domain_id: true },
  });

  for (const d of domainRows) {
   
    await prisma.userdomain
      .create({ data: { user_id: adminUser.user_id, domain_id: d.domain_id } })
      .catch(() => {});
  }

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error('Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
