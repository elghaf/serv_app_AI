import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    token: string;
  }

  interface Session {
    user: User & {
      token: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    token: string;
  }
}