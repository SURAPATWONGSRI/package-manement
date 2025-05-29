import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { UserUpdateForm } from "@/components/auth/update-user-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { Lock, User } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Profile",
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

  // Check if user is admin based on permissions result
  const isAdmin = FULL_POST_ACCESS.success;
  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {session.user.image ? (
            <Avatar className="h-24 w-24 border-4 rounded-lg border-background">
              <AvatarImage
                src={session.user.image}
                alt={session.user.name || "User Avatar"}
              />
              <AvatarFallback className="text-2xl ">
                {session.user.name?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-24 w-24 rounded-xl bg-primary/10">
              <AvatarFallback className="text-2xl rounded-xl ">
                {session.user.name?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold font-sans">
              {session.user.name}
            </h1>
            <p className="text-muted-foreground font-sans">
              {session.user.email}
            </p>
            {session.user.lineId && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-sans">
                  Line ID:
                </span>
                <span className="font-sans">{session.user.lineId}</span>
              </div>
            )}
            {isAdmin && (
              <Badge className="mt-2" variant="default">
                <p className="font-sans">Admin</p>
              </Badge>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="profile" className="w-full">
          <TabsList
            className={`grid w-full grid-cols-2 bg-muted text-muted-foreground `}
          >
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-1" />
              ข้อมูลส่วนตัว
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-1" />
              ความปลอดภัย
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลโปรไฟล์</CardTitle>
              </CardHeader>
              <CardContent>
                <UserUpdateForm
                  lineId={session.user.lineId ?? null}
                  name={session.user.name}
                  image={session.user.image ?? ""}
                  email={session.user.email}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
