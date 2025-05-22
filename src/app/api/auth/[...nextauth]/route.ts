import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { iRacingService } from "@/services/iRacingService";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "iracing",
      name: "iRacing",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.code) {
          return null;
        }

        try {
          // Exchange code for tokens
          const tokens = await iRacingService.exchangeCodeForTokens(credentials.code);
          
          // Get user profile using the access token
          const profile = await iRacingService.getProfile();
          
          // Check if user exists in the database
          let user = await prisma.user.findUnique({
            where: { iRacingId: profile.cust_id },
          });
          
          // Create user if it doesn't exist
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.display_name,
                iRacingId: profile.cust_id,
              },
            });
          }
          
          // Update user if needed
          if (user.name !== profile.display_name || user.email !== profile.email) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name: profile.display_name,
                email: profile.email,
              },
            });
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            iRacingId: user.iRacingId,
          };
        } catch (error) {
          console.error("Error authenticating with iRacing:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.iRacingId = user.iRacingId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.iRacingId = token.iRacingId as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST }; 