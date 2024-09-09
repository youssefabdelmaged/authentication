import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { Lucia } from "lucia";
import db from "./db";
import { cookies } from "next/headers";
import { Login } from "@/actionns/auth-actions";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
});

const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export const verifyAuth = async () => {
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  // If no session cookie, return null for both user and session
  if (!sessionCookie) {
    return { user: null, session: null };
  }

  const sessionId = sessionCookie.value;

  // If sessionId is not present, return null for both user and session
  if (!sessionId) {
    return { user: null, session: null };
  }

  try {
    // Validate session using sessionId
    const result = await lucia.validateSession(sessionId);

    // If the session is fresh, renew session cookie
    if (result.session && result.session.fresh) {
      const newSessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        newSessionCookie.name,
        newSessionCookie.value,
        newSessionCookie.attributes
      );
    }

    // If session is not valid, create a blank session cookie
    if (!result.session) {
      const blankSessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        blankSessionCookie.name,
        blankSessionCookie.value,
        blankSessionCookie.attributes
      );
    }

    return result; // Return the result if session validation passes
  } catch (error) {
    console.error("Error validating session:", error.toString());
    return { user: null, session: null }; // In case of error, return null for both
  }
};

export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);
  const blankSessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    blankSessionCookie.name,
    blankSessionCookie.value,
    blankSessionCookie.attributes
  );
}
