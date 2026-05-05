import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  ttl: {
    slots: 300,        // 5 minutes — availability slots
    tenantInfo: 3600,  // 1 hour — tenant profile cache
  },
}));
