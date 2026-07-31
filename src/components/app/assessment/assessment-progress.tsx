import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Upload Photo",
  "Skin Type",
  "Skin Concerns",
  "Basic Profile",
];

interface AssessmentProgressProps {
  currentStep: number;
}

export function AssessmentProgress({
  currentStep,
}: AssessmentProgressProps) {
  return (
    <div className="surface-panel p-6">
      <p className="text-sm font-medium text-muted-foreground">
        Step {currentStep} of {STEPS.length}
      </p>

      <div className="mt-6 flex items-center">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;

          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                    completed &&
                      "bg-primary border-primary text-primary-foreground",
                    active &&
                      "border-primary bg-primary/10 text-primary",
                    !completed &&
                      !active &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {completed ? <Check className="h-5 w-5" /> : stepNumber}
                </div>

                <span
                  className={cn(
                    "mt-2 text-xs text-center",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {index !== STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-1 flex-1 rounded-full",
                    completed ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}