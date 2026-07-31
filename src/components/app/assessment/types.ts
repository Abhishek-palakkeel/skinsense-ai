export type SkinType =
  | "oily"
  | "dry"
  | "combination"
  | "normal"
  | "sensitive";

export type SkinConcern =
  | "acne"
  | "pigmentation"
  | "dark-spots"
  | "wrinkles"
  | "dryness"
  | "redness"
  | "blackheads"
  | "large-pores"
  | "uneven-tone";

export type Gender =
  | "male"
  | "female"
  | "prefer-not-to-say";

export interface AssessmentData {
  skinType?: SkinType;
  concerns: SkinConcern[];
  age?: number;
  gender?: Gender;
}