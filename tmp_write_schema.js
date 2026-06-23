const fs = require('fs');
const path = require('path');
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Example {
  FIRST
  SECOND
}

model Foo {
  id String @id @default(cuid())
  status Example
}
`;
fs.writeFileSync(path.join(process.cwd(), 'tmp_enum3.prisma'), schema, 'utf8');
console.log('wrote tmp_enum3.prisma');
