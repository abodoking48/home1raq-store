import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const initialMessage =
    sp.error === "forbidden" ? "This account is not an admin." : null;

  return <LoginForm initialMessage={initialMessage} />;
}
