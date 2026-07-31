export type {
  DiseasePrediction,
  DiseaseReport,
  IDiseaseAnalyzer,
  ImageQualityReport,
} from "./types";

export interface DiseaseAnalysisCase {
  id: string;
  conditionId: string;
  title: string;
  presentation: string;
  outcome: string;
  similarity: number;
}
