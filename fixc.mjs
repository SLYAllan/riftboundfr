// One-off: swap the blurry tiny cover (sydney-1, 299x168) of the top-8 Sydney
// article for the high-res sydney-2 (1920x1080). Run in the prod container.
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.article
  .update({ where: { slug: "top-8-sydney-rq-2026" }, data: { coverImage: "/img/articles/sydney-2.webp" } })
  .then(() => console.log("cover fixed -> /img/articles/sydney-2.webp"))
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => p.$disconnect());
