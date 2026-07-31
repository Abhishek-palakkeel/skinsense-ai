import type { Gender } from "./types";

interface BasicProfileProps {
  age?: number;
  gender?: Gender;
  onAgeChange: (age: number | undefined) => void;
  onGenderChange: (gender: Gender) => void;
}

export function BasicProfile({
  age,
  gender,
  onAgeChange,
  onGenderChange,
}: BasicProfileProps) {
  return (
    <div className="surface-panel p-6">
      <h2 className="text-lg font-semibold">
        Tell us a little about yourself
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        This helps personalize your skincare recommendations.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Age */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Age
          </label>

          <input
            type="number"
            min={1}
            max={100}
            value={age ?? ""}
            onChange={(e) =>
              onAgeChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="Enter your age"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Gender
          </label>

          <select
            value={gender ?? ""}
            onChange={(e) =>
              onGenderChange(e.target.value as Gender)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer-not-to-say">
              Prefer not to say
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}