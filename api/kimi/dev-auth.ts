import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { signSessionToken } from "./session";
import { findUserByUnionId, upsertUser } from "../queries/users";
import { getOrCreatePlayer } from "../queries/store";

export const DEV_UNION_ID = "dev-local-player";

export function createDevLoginHandler() {
  return async (c: Context) => {
    if (!env.allowDevAuth) {
      return c.json({ error: "Dev login is disabled" }, 403);
    }

    try {
      await upsertUser({
        unionId: DEV_UNION_ID,
        name: "Dev Player",
        lastSignInAt: new Date(),
      });

      const user = await findUserByUnionId(DEV_UNION_ID);
      if (user) await getOrCreatePlayer(user.id);

      const token = await signSessionToken({
        unionId: DEV_UNION_ID,
        clientId: env.appId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/", 302);
    } catch (err) {
      console.error("[dev-auth] Login failed", err);
      const message =
        err instanceof Error ? err.message : "Dev login failed";
      return c.json(
        {
          error: "dev_login_failed",
          message,
          hint: 'Set DATABASE_URL=dev in .env for file storage, or use a mysql:// URL with npm run db:push',
        },
        500,
      );
    }
  };
}
