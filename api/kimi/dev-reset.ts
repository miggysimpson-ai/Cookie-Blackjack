import type { Context } from "hono";
import { env } from "../lib/env";
import { resetDevStore } from "../lib/dev-store";

export function createDevResetHandler() {
  return async (c: Context) => {
    if (!env.allowDevAuth) {
      return c.json({ error: "Dev reset is disabled" }, 403);
    }

    resetDevStore();
    return c.redirect("/login?reset=1", 302);
  };
}
