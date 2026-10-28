import { loadEnvFile } from './loadEnv.js';

loadEnvFile();

import { createServer } from './server.js';
import { config } from './config.js';
import { closeMongo } from './db/mongo.js';

const server = createServer();

server.listen(config.port, '0.0.0.0', () => {
  console.log(`GBP-Guard backend listening on http://localhost:${config.port}`);
  console.log(`Health check:  http://localhost:${config.port}/health`);
  console.log(`Blog API:      http://localhost:${config.port}/api/v1/posts`);
  console.log(`Auto-post:     POST http://localhost:${config.port}/api/v1/posts/auto-publish`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await closeMongo();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
