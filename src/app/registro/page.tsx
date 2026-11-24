import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = { title: "Crear cuenta · Postula" };

export default function SignupPage() {
  return (
    <AuthCard title="Crear cuenta" subtitle="Empieza a seguir tus candidaturas en un minuto.">
      <SignupForm />
    </AuthCard>
  );
}
