import { prisma } from "./lib/prisma";
import "dotenv/config";


const express = require("express");
const app = express();
const port = process.env.PORT || 5001;

async function main() {
  try {
    // Connect the client
    await prisma.$connect();

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (e) {
    // Disconnect the client only if startup failed
    await prisma.$disconnect();
    throw e;
  }
}

main();


