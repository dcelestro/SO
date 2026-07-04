import "server-only";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

/**
 * Checks if the user is authenticated.
 * If not, throws an error. Should be used at the beginning of Server Actions.
 */
export async function requireActionSession() {
  if (process.env.AUTH_ENABLED !== "true") return null;
  const token = (await cookies()).get("nexo_session")?.value;
  const session = await verifySession(token);
  if (!session) {
    throw new Error("No autorizado. Inicie sesión para realizar esta acción.");
  }
  return session;
}
