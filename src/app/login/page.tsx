import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Entrar · Postula" };

export default function LoginPage() {
  return (
    <AuthCard title="Entrar" subtitle="Accede a tus candidaturas.">
      <LoginForm />
    </AuthCard>
  );
}
