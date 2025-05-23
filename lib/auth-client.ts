import { createAuthClient } from "better-auth/react";

// กำหนด schema ที่รวม lineId
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  schema: {
    user: {
      signUp: {
        email: {
          fields: ["name", "email", "password", "lineId"], // เพิ่ม lineId ที่นี่
        },
      },
    },
  },
});

export const { signUp, signOut, signIn } = authClient;
