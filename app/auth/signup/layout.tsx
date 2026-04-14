import { OnboardingProvider } from "@/context/OnboardingContext";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
