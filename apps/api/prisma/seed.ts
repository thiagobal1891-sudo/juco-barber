import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


async function main() {
  console.log('Seeding database...');

  // 1. Create Barber
  const barber = await prisma.barber.upsert({
    where: { id: 'barber-1' },
    update: {},
    create: {
      id: 'barber-1',
      name: 'Juco',
      bio: 'Especialista en cortes premium y estilismo masculino.',
      avatarUrl: 'https://images.unsplash.com/photo-1599351431247-f10b21817021?auto=format&fit=crop&q=80',
    },
  });

  // 2. Create Services
  const services = [
    {
      id: 'service-1',
      name: 'Corte de Precisión',
      description: 'Corte artesanal con acabado detallado.',
      durationMinutes: 45,
      price: 45,
      barberId: barber.id,
    },
    {
      id: 'service-2',
      name: 'Escultura de Barba',
      description: 'Diseño y perfilado de barba con ritual de toalla caliente.',
      durationMinutes: 30,
      price: 30,
      barberId: barber.id,
    },
    {
      id: 'service-3',
      name: 'El Ritual Vaon',
      description: 'Experiencia completa: Corte + Barba + Tratamiento facial.',
      durationMinutes: 75,
      price: 70,
      barberId: barber.id,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }

  // 3. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({

    where: { email: 'admin@barberia.com' },
    update: {},
    create: {
      email: 'admin@barberia.com',
      password: adminPassword,
    },
  });

  // 4. Create Working Hours
  const workingHours = [];
  for (let i = 1; i <= 6; i++) { // Monday to Saturday
    workingHours.push({
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '19:00',
    });
  }

  for (const wh of workingHours) {
    await prisma.workingHours.upsert({
      where: { id: `wh-${wh.dayOfWeek}` },
      update: {},
      create: {
        id: `wh-${wh.dayOfWeek}`,
        ...wh,
      },
    });
  }

  console.log('Seeding finished.');
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
