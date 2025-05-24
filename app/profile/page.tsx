import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "โปรไฟล์",
};

export default async function page() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return <p className="text-destructive">Unauthorized</p>;
  }

  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      userId: session.user.id,
      permissions: {
        posts: ["update", "delete"],
      },
    },
  });
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold">Profile</h1>
      </div>

      <SignOutButton />

      <div className="text-2xl font-bold">Permissons</div>
      <div className="space-x-4">
        <Button>MANAGE OWN POST</Button>
        <Button disabled={!FULL_POST_ACCESS.success}>MANAGE ALL POST</Button>
      </div>
      <pre className="text-sm overflow-clip">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
