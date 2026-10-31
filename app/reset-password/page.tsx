import { redirect } from "next/navigation";

// Safety net: if a reset email links to /reset-password, send it to the
// real page and keep the token.
export default async function ResetPasswordAlias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await searchParams;
  redirect(
    typeof token === "string" && token
      ? `/auth/reset-password?token=${encodeURIComponent(token)}`
      : "/auth/reset-password",
  );
}
