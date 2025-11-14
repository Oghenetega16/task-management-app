const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Test with DATABASE_URL (transaction pooler)
const databaseUrl = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Testing DATABASE_URL (Transaction Pooler)...');
  console.log('URL (masked):', databaseUrl?.replace(/:[^:@]+@/, ':****@'));
  
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to database');
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Query result:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();