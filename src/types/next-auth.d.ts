import type { DefaultSession } from "next-auth";
import type { UserRole } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    onboardingComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    onboardingComplete: boolean;
  }
}
