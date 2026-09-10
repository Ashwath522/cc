'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  console.log('Starting official mongod binary on port 27017...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'content-x',
      ip: '127.0.0.1',
    },
  });

  const uri = mongod.getUri();
  console.log(`[MongoMemoryServer] mongod running at: ${uri} (port 27017)`);

  const keepAlive = () => setTimeout(keepAlive, 10000);
  keepAlive();

  process.on('SIGINT', async () => {
    console.log('Stopping mongod...');
    await mongod.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start mongod:', err);
  process.exit(1);
});
