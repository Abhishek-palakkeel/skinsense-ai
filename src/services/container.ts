import { CanvasImageQualityService } from "./image-quality.service";
import { MockSkinHealthAnalyzer } from "./skin-health.analyzer";
import { MockDiseaseAnalyzer } from "./disease.analyzer";
import { JsonIngredientService } from "./ingredient.service";
import { JsonHerbalService } from "./herbal.service";
import { MockLLMProvider } from "./llm/mock-provider";
import { LocalStorageReportRepository } from "./report.repository";
import { InMemoryRetriever } from "./rag/retriever";
import type {
  IDiseaseAnalyzer,
  IHerbalService,
  IImageQualityService,
  IIngredientService,
  ILLMProvider,
  IReportRepository,
  ISkinHealthAnalyzer,
} from "./types";
import type { IRetriever } from "./rag/types";

/**
 * Composition root — the single place where interfaces are bound to
 * implementations.
 *
 * Going to production means editing THIS FILE ONLY:
 *   skinHealthAnalyzer: new TorchSkinHealthAnalyzer(env.MODEL_PATH)
 *   diseaseAnalyzer:    new OnnxDiseaseAnalyzer(env.MODEL_PATH)
 *   llmProvider:        new GrokProvider(env.XAI_API_KEY)
 *   reportRepository:   new SqlReportRepository(env.DATABASE_URL)
 */
export interface ServiceContainer {
  imageQuality: IImageQualityService;
  skinHealthAnalyzer: ISkinHealthAnalyzer;
  diseaseAnalyzer: IDiseaseAnalyzer;
  ingredients: IIngredientService;
  herbs: IHerbalService;
  llmProvider: ILLMProvider;
  retriever: IRetriever;
  reports: IReportRepository;
}

const retriever = new InMemoryRetriever();

export const services: ServiceContainer = {
  imageQuality: new CanvasImageQualityService(),
  skinHealthAnalyzer: new MockSkinHealthAnalyzer(),
  diseaseAnalyzer: new MockDiseaseAnalyzer(),
  ingredients: new JsonIngredientService(),
  herbs: new JsonHerbalService(),
  llmProvider: new MockLLMProvider(retriever),
  retriever,
  reports: new LocalStorageReportRepository(),
};
