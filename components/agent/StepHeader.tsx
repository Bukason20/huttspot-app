interface StepHeaderProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
}

export default function StepHeader({
  title,
  subtitle,
  currentStep,
  totalSteps,
}: StepHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-secondary w-6"
                : i === currentStep - 1
                  ? "bg-secondary w-8"
                  : "bg-gray-200 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
