import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-6 py-16">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </main>
  );
}
