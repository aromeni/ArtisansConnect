import NextAuth from "next-auth";
import { authConfig } from "./config";
// Note: PrismaAdapter will be wired in Phase 3 after the Prisma schema is created.
// The JWT session strategy does not require the adapter for basic auth.

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
});
