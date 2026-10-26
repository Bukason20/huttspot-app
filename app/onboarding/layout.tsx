import { OnboardingProvider } from "@/context/OnboardingContext";
import OnboardingShell from "@/components/ui/OnboardingShell";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <OnboardingShell>{children}</OnboardingShell>
    </OnboardingProvider>
  );
}
