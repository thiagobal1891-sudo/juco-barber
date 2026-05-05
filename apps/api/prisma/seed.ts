import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'barberia-demo' },
    update: {},
    create: {
      slug: 'barberia-demo',
      name: 'Barbería Demo Central',
      address: 'Av. Corrientes 1234, CABA',
      phone: '+541144445555',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@barberia.demo' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@barberia.demo',
      firstName: 'Admin',
      lastName: 'Demo',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const barberUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'juan@barberia.demo' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'juan@barberia.demo',
      firstName: 'Juan',
      lastName: 'Pérez',
      passwordHash,
      role: 'BARBER',
    },
  });

  const barber = await prisma.barber.upsert({
    where: { userId: barberUser.id },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: barberUser.id,
      displayName: 'Juan Pérez',
      bio: 'Especialista en degradados y barba.',
    },
  });

  const serviceCorte = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Corte Clásico',
      durationMinutes: 30,
      price: 5000,
    },
  });

  const serviceBarba = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: 'Arreglo de Barba',
      durationMinutes: 20,
      price: 3000,
    },
  });

  await prisma.barberService.createMany({
    data: [
      { barberId: barber.id, serviceId: serviceCorte.id },
      { barberId: barber.id, serviceId: serviceBarba.id },
    ],
  });

  // Schedule Mon-Fri 09:00 - 18:00
  const days: any[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const day of days) {
    await prisma.availability.upsert({
      where: { barberId_dayOfWeek: { barberId: barber.id, dayOfWeek: day } },
      update: {},
      create: {
        barberId: barber.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
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
