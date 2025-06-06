import { auth } from "@/lib/auth";

// Define the session type based on the actual return type of auth.api.getSession
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

// For components that expect a non-null session
export type NonNullAuthSession = NonNullable<AuthSession>;
