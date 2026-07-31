/**
 * Shared domain contracts.
 *
 * Every service in `src/services` is defined as an interface first and a
 * mock implementation second. Swapping a mock for a real model, LLM or API
 * only requires providing a new class that satisfies the interface and
 * registering it in `src/services/container.ts`. No UI code changes.
 */

export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive";

export type Severity = "mild" | "moderate" | "significant";

export interface ImageQualityReport {
  passed: boolean;
  overallScore: number;
  checks: QualityCheck[];
  guidance: string[];
}

export interface QualityCheck {
  id: "resolution" | "blur" | "brightness" | "subject";
  label: string;
  score: number;
  passed: boolean;
  detail: string;
}

export interface DetectedConcern {
  id: string;
  label: string;
  severity: Severity;
  confidence: number;
  affectedZones: string[];
  causes: string[];
}

export interface RoutineStep {
  order: number;
  step: string;
  product: string;
  ingredientIds: string[];
  note: string;
}

export interface SkinHealthReport {
  id: string;
  kind: "skin-health";
  createdAt: string;
  imageDataUrl: string;
  skinType: SkinType;
  skinTypeConfidence: number;
  hydrationScore: number;
  barrierScore: number;
  evennessScore: number;
  overallScore: number;
  concerns: DetectedConcern[];
  morningRoutine: RoutineStep[];
  nightRoutine: RoutineStep[];
  activeIngredientIds: string[];
  avoidCombinations: { a: string; b: string; reason: string }[];
  lifestyle: string[];
  nutrition: string[];
  sunProtection: string;
  hydrationAdvice: string;
  herbIds: string[];
}

export interface DiseasePrediction {
  id: string;
  label: string;
  probability: number;
}

export interface DiseaseReport {
  id: string;
  kind: "disease";
  createdAt: string;
  imageDataUrl: string;
  predictions: DiseasePrediction[];
  topPrediction: DiseasePrediction;
  urgency: "routine" | "soon" | "prompt";
  explanation: {
    method: string;
    summary: string;
    regions: { x: number; y: number; radius: number; weight: number }[];
  };
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  complications: string[];
  careAdvice: string[];
  warningSigns: string[];
  consultAdvice: string;
  similarCaseIds: string[];
  herbIds: string[];
}

export type AnyReport = SkinHealthReport | DiseaseReport;

export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  description: string;
  benefits: string[];
  sideEffects: string[];
  suitableSkinTypes: string[];
  usage: string;
  compatibleWith: string[];
  avoidMixingWith: string[];
  avoidMixingReason: string;
  evidenceLevel: string;
  pregnancySafe: boolean;
}

export interface Herb {
  id: string;
  commonName: string;
  malayalamName: string;
  scientificName: string;
  emoji: string;
  traditionalUse: string;
  preparation: string;
  application: string;
  safety: string;
  patchTest: string;
  supports: string[];
  references: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: string[];
}

/* ---------- Service interfaces (implementation-agnostic) ---------- */

export interface IImageQualityService {
  assess(file: File): Promise<ImageQualityReport>;
}

import type {
  SkinType,
  SkinConcern,
  Gender,
} from "@/components/app/assessment/types";

export interface ISkinHealthAnalyzer {
  analyze(input: {
    imageDataUrl: string;
    quality: ImageQualityReport;

    skinType: SkinType;
    concerns: SkinConcern[];

    age: number;
    gender: Gender;
  }): Promise<SkinHealthReport>;
}

export interface IDiseaseAnalyzer {
  analyze(input: { imageDataUrl: string; quality: ImageQualityReport }): Promise<DiseaseReport>;
}

export interface IIngredientService {
  search(query: string): Ingredient[];
  getById(id: string): Ingredient | undefined;
  all(): Ingredient[];
  checkCompatibility(a: string, b: string): { compatible: boolean; reason: string };
}

export interface IHerbalService {
  all(): Herb[];
  recommendFor(concerns: string[]): Herb[];
  getByIds(ids: string[]): Herb[];
}

export interface LLMResponse {
  content: string;
  sources?: string[];
}

export interface ILLMProvider {
  readonly name: string;
  generateResponse(input: { messages: ChatMessage[]; context?: string[] }): Promise<LLMResponse>;
}

export interface IReportRepository {
  save(report: AnyReport): void;
  list(): AnyReport[];
  listByKind<K extends AnyReport["kind"]>(kind: K): Extract<AnyReport, { kind: K }>[];
  getById(id: string): AnyReport | undefined;
  remove(id: string): void;
}
