import type { Server } from "http";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

let server: Server;

async function main() {
  try {
    await prisma.$connect();

    server = app.listen(config.port, () => {
      console.log(`GearUp server listening on port ${config.port}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

async function shutdown() {
  server?.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main();


