import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { redirect } from "next/navigation";
export default function Login() {
  if (process.env.AUTH_ENABLED !== "true") redirect("/dashboard");
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-3 grid size-10 place-items-center rounded-lg bg-slate-950 font-bold text-white">
            N
          </div>
          <CardTitle>Entrar a Nexo</CardTitle>
          <CardDescription>Tu centro de control personal.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
