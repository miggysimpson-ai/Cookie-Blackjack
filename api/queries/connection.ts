import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function isDevStore(): boolean {
  return env.useDevStore;
}

export function getDb() {
  if (env.useDevStore) {
    throw new Error(
      "Dev file store is active (DATABASE_URL=dev). Database client is not used.",
    );
  }
  if (!instance) {
    if (!env.databaseUrl) {
      throw new Error(
        "DATABASE_URL is not set. Use DATABASE_URL=dev for local file storage, or a mysql:// URL with npm run db:push",
      );
    }
    instance = drizzle(env.databaseUrl, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}
