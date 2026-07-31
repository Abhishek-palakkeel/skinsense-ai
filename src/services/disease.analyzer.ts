import type {
  DiseaseAnalysisCase,
  DiseasePrediction,
  DiseaseReport,
  IDiseaseAnalyzer,
  ImageQualityReport,
} from "./disease.types";

async function dataURLToFile(dataUrl: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], "skin.jpg", { type: "image/jpeg" });
}

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Raw JSON shape returned by the FastAPI `/predict` endpoint. */
interface BackendPredictionResponse {
  disease: string;
  confidence: number;
}

/**
 * Maps the exact disease strings returned by the FastAPI/PyTorch
 * (EfficientNet-B0, HAM10000) backend onto the internal CONDITIONS keys.
 */
const BACKEND_LABEL_TO_KEY: Record<string, string> = {
  "Actinic Keratosis": "actinic-keratosis",
  "Basal Cell Carcinoma": "basal-cell-carcinoma",
  "Benign Keratosis": "benign-keratosis",
  "Dermatofibroma": "dermatofibroma",
  "Melanoma": "melanoma",
  "Melanocytic Nevus": "melanocytic-nevus",
  "Vascular Lesion": "vascular-lesion",
};

/**
 * Real dermatological classification client.
 *
 * Contract: `analyze({ imageDataUrl, quality })` -> DiseaseReport, sourced
 * from a live FastAPI backend serving a PyTorch EfficientNet-B0 model
 * trained on HAM10000. The backend returns a single top-1 disease label
 * plus a confidence percentage; this class turns that into the
 * `DiseaseReport` shape the UI already expects.
 *
 * This service is educational. It never prescribes medication.
 */
export class DiseaseAnalyzer implements IDiseaseAnalyzer {
  constructor(
    private readonly endpoint: string = "http://127.0.0.1:8000/predict"
  ) {}

  async analyze({
    imageDataUrl,
    quality,
  }: {
    imageDataUrl: string;
    quality: ImageQualityReport;
  }): Promise<DiseaseReport> {
    void quality; // reserved for future backend-side quality gating

    const file = await dataURLToFile(imageDataUrl);

    const formData = new FormData();
    formData.append("file", file);

    let response: Response;
    try {
      response = await fetch(this.endpoint, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      throw new Error(
        "Could not reach the AI diagnosis backend. Make sure the FastAPI server is running at " +
          this.endpoint +
          "."
      );
    }

    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch {
        // ignore body-read failures
      }
      throw new Error(
        `AI diagnosis backend returned an error (status ${response.status}).${
          detail ? ` ${detail}` : ""
        }`
      );
    }

    let data: BackendPredictionResponse;
    try {
      data = (await response.json()) as BackendPredictionResponse;
    } catch (err) {
      throw new Error("AI diagnosis backend returned an invalid (non-JSON) response.");
    }

    if (
      !data ||
      typeof data.disease !== "string" ||
      typeof data.confidence !== "number" ||
      Number.isNaN(data.confidence)
    ) {
      throw new Error(
        "AI diagnosis backend returned an unexpected response shape (expected { disease, confidence })."
      );
    }

    const key = BACKEND_LABEL_TO_KEY[data.disease];
    const condition = key ? CONDITIONS[key] : undefined;

    if (!key || !condition) {
      throw new Error(
        `AI diagnosis backend returned an unrecognised disease label: "${data.disease}".`
      );
    }

    const probability = round(Math.min(Math.max(data.confidence, 0), 100) / 100);

    const topPrediction: DiseasePrediction = {
      id: key,
      label: condition.label,
      probability,
    };

    const predictions: DiseasePrediction[] = [topPrediction];

    return {
      id: crypto.randomUUID(),
      kind: "disease",
      createdAt: new Date().toISOString(),
      imageDataUrl,
      predictions,
      topPrediction,
      urgency: condition.urgency,
      explanation: {
        method: "AI Image Classification",
        summary:
          "The prediction was generated using the EfficientNet-B0 skin lesion classification model.",
        regions: [],
      },
      symptoms: condition.symptoms,
      causes: condition.causes,
      riskFactors: condition.riskFactors,
      complications: condition.complications,
      careAdvice: condition.careAdvice,
      warningSigns: condition.warningSigns,
      consultAdvice: condition.consultAdvice,
      similarCaseIds: condition.similarCases,
      herbIds: condition.herbs,
    };
  }
}

/**
 * Backward-compatible alias. Existing call sites (e.g. a DI container) may
 * still reference `MockDiseaseAnalyzer` by name; it now resolves to the
 * real backend-backed implementation above.
 */
export { DiseaseAnalyzer as MockDiseaseAnalyzer };

export interface ConditionProfile {
  label: string;
  category: string;
  urgency: DiseaseReport["urgency"];
  overview: string;
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  complications: string[];
  careAdvice: string[];
  warningSigns: string[];
  consultAdvice: string;
  similarCases: string[];
  herbs: string[];
}

export const CONDITIONS: Record<string, ConditionProfile> = {
  "actinic-keratosis": {
    label: "Actinic Keratosis",
    category: "Pre-cancerous lesion",
    urgency: "soon",
    overview:
      "A rough, scaly patch of skin caused by cumulative UV damage to keratinocytes. Considered pre-cancerous, with a small but real risk of progression to squamous cell carcinoma if untreated.",
    symptoms: [
      "Rough, dry, sandpaper-like patch",
      "Pink, red, or skin-coloured scaly spot",
      "Often on sun-exposed skin (face, scalp, ears, forearms, hands)",
      "May be more easily felt than seen",
      "Occasional tenderness or itching",
    ],
    causes: [
      "Cumulative ultraviolet (UV) radiation exposure",
      "DNA damage to epidermal keratinocytes",
      "Chronic sun damage over years to decades",
    ],
    riskFactors: [
      "Fair skin, light eyes or hair",
      "History of significant sun exposure or sunburns",
      "Older age",
      "Outdoor occupation or hobbies",
      "Immunosuppression",
    ],
    complications: [
      "Progression to squamous cell carcinoma (estimated in a minority of untreated lesions)",
      "Multiple lesions indicating widespread field sun damage",
      "Cosmetic and textural skin changes",
    ],
    careAdvice: [
      "Apply broad-spectrum SPF 30+ daily to the affected area and surrounding skin",
      "Avoid peak sun hours (10am-4pm) and wear a wide-brimmed hat",
      "Do not pick, scratch, or attempt to shave off the lesion",
      "Track the spot with monthly photos for size, thickness or colour change",
    ],
    warningSigns: [
      "Rapid growth or thickening",
      "Bleeding, crusting, or ulceration",
      "Increasing tenderness or pain",
      "A lesion that hardens into a firm nodule",
    ],
    consultAdvice:
      "Actinic keratoses should be examined by a dermatologist for confirmation and treatment (such as cryotherapy or topical therapy), particularly if the spot is enlarging, tender, or has been present for months.",
    similarCases: ["case-actinic-keratosis-1", "case-actinic-keratosis-2"],
    herbs: ["aloe-vera"],
  },
  "basal-cell-carcinoma": {
    label: "Basal Cell Carcinoma",
    category: "Skin cancer (non-melanoma)",
    urgency: "soon",
    overview:
      "The most common form of skin cancer, arising from basal cells in the epidermis. It grows slowly and rarely spreads (metastasises), but can cause significant local tissue damage if left untreated.",
    symptoms: [
      "Pearly or waxy raised bump, often with visible small blood vessels",
      "Flat, flesh-coloured or brown scar-like lesion",
      "A sore that bleeds, heals, then reopens",
      "Slow, persistent growth over months",
    ],
    causes: [
      "Cumulative and intense intermittent UV exposure",
      "DNA mutations in basal layer skin cells",
      "Rarely, prior radiation exposure",
    ],
    riskFactors: [
      "Fair skin and history of sunburns",
      "Older age",
      "Chronic sun exposure or tanning bed use",
      "Personal or family history of skin cancer",
      "Immunosuppression",
    ],
    complications: [
      "Local tissue invasion and disfigurement if untreated",
      "Recurrence after incomplete removal",
      "Very rarely, spread to other tissues",
    ],
    careAdvice: [
      "Do not attempt home treatment or removal",
      "Protect the area from further sun exposure while awaiting assessment",
      "Keep any open or bleeding area clean and covered",
      "Continue routine full-body skin checks going forward",
    ],
    warningSigns: [
      "A sore that will not heal within a few weeks",
      "Progressive growth or new pearly appearance",
      "Spontaneous bleeding",
      "Change in a previously stable spot",
    ],
    consultAdvice:
      "This pattern warrants prompt dermatologist evaluation, typically including a biopsy. Basal cell carcinoma is highly treatable when addressed early.",
    similarCases: ["case-bcc-1", "case-bcc-2"],
    herbs: [],
  },
  "benign-keratosis": {
    label: "Benign Keratosis",
    category: "Benign epidermal lesion",
    urgency: "routine",
    overview:
      "A broad category including seborrheic keratoses and related benign growths — harmless, often waxy or 'stuck-on' looking lesions that are extremely common with age.",
    symptoms: [
      "Waxy, 'stuck-on' appearance",
      "Light tan to dark brown or black colour",
      "Round or oval shape with a slightly raised, warty surface",
      "Usually painless, occasionally itchy",
    ],
    causes: [
      "Benign overgrowth of epidermal cells",
      "Strongly associated with age",
      "Some genetic predisposition",
    ],
    riskFactors: [
      "Increasing age",
      "Family history of similar lesions",
      "Sun-exposed or friction-prone skin areas",
    ],
    complications: [
      "Irritation or bleeding if caught on clothing",
      "Cosmetic concern",
      "Occasionally mimics more serious pigmented lesions, which is why confirmation matters",
    ],
    careAdvice: [
      "Leave the lesion alone; it does not require treatment unless bothersome",
      "Avoid picking, which can cause bleeding or scarring",
      "Removal (cryotherapy, curettage) is available electively if it catches on clothing",
      "Monitor for any change against its usual stable appearance",
    ],
    warningSigns: [
      "Sudden change in colour, shape, or texture",
      "New bleeding without trauma",
      "Rapid growth unlike the lesion's prior behaviour",
    ],
    consultAdvice:
      "Benign keratoses are usually harmless, but a dermatologist should confirm the diagnosis, especially if the lesion looks different from your other spots or has changed recently.",
    similarCases: ["case-benign-keratosis-1"],
    herbs: ["aloe-vera"],
  },
  "dermatofibroma": {
    label: "Dermatofibroma",
    category: "Benign fibrous lesion",
    urgency: "routine",
    overview:
      "A common, benign, firm nodule in the dermis, often on the lower legs, thought to arise from a minor injury such as an insect bite or ingrown hair.",
    symptoms: [
      "Firm, small (usually under 1cm) nodule",
      "Dimples inward when pinched from the sides (the 'dimple sign')",
      "Tan, pink, red, or brown in colour",
      "Most common on the lower legs and arms",
    ],
    causes: [
      "Benign fibrous tissue proliferation",
      "Often follows minor local trauma (insect bite, splinter)",
      "Exact trigger not always identifiable",
    ],
    riskFactors: [
      "More common in adults, especially women",
      "History of minor skin trauma at the site",
    ],
    complications: [
      "Occasional tenderness with pressure or shaving",
      "Cosmetic concern",
      "Very rarely confused with other pigmented lesions on exam",
    ],
    careAdvice: [
      "No treatment is usually needed; it is benign and typically stable for life",
      "Avoid repeated trauma or shaving directly over the lesion",
      "Surgical removal is an option if it is persistently irritated",
      "Monitor for any change against its typically stable appearance",
    ],
    warningSigns: [
      "Rapid growth",
      "New pain, bleeding, or ulceration",
      "Loss of the classic firm, stable feel",
    ],
    consultAdvice:
      "Dermatofibromas are almost always benign, but have a dermatologist confirm the diagnosis, particularly if it is new, growing, or looks unlike a typical dermatofibroma.",
    similarCases: ["case-dermatofibroma-1"],
    herbs: [],
  },
  "melanoma": {
    label: "Melanoma",
    category: "Skin cancer (malignant)",
    urgency: "prompt",
    overview:
      "The most serious form of skin cancer, arising from pigment-producing melanocytes. Early detection dramatically improves outcomes, which makes prompt evaluation of any suspicious pigmented lesion essential.",
    symptoms: [
      "Asymmetric shape",
      "Irregular or blurred border",
      "Multiple colours within one lesion",
      "Diameter larger than 6mm",
      "Evolving size, shape, or colour over weeks to months",
    ],
    causes: [
      "Malignant transformation of melanocytes",
      "UV-induced DNA damage, including intense intermittent sun exposure and sunburns",
      "Genetic mutation pathways (e.g. BRAF) in a subset of cases",
    ],
    riskFactors: [
      "Fair skin, red or blonde hair, light eyes",
      "History of severe or blistering sunburns",
      "High mole count or atypical moles",
      "Family history of melanoma",
      "Personal history of skin cancer",
      "Tanning bed use",
    ],
    complications: [
      "Local invasion into deeper skin layers",
      "Spread to lymph nodes or distant organs if untreated",
      "Higher treatment complexity at later stages",
    ],
    careAdvice: [
      "Do not delay seeking in-person medical evaluation",
      "Avoid further sun exposure to the area until assessed",
      "Do not attempt to treat, remove, or biopsy the lesion yourself",
      "Bring photos showing any change over time to your appointment",
    ],
    warningSigns: [
      "Asymmetry, irregular border, multiple colours, diameter over 6mm, or evolution (the ABCDE signs)",
      "New pigmented lesion in someone over 40",
      "Bleeding, itching, or ulceration in a mole",
      "A lesion that looks different from all your other moles (the 'ugly duckling' sign)",
    ],
    consultAdvice:
      "This finding should be assessed by a dermatologist as soon as possible, ideally within days. Early-stage melanoma is highly treatable, so prompt evaluation matters far more than waiting to see if it changes.",
    similarCases: ["case-melanoma-1", "case-melanoma-2"],
    herbs: [],
  },
  "melanocytic-nevus": {
    label: "Melanocytic Nevus",
    category: "Benign pigmented lesion",
    urgency: "routine",
    overview:
      "A common benign mole formed by a cluster of melanocytes. The overwhelming majority are harmless and stable for years, but any that change deserve a closer look.",
    symptoms: [
      "Uniform brown or tan colour",
      "Symmetric, round or oval shape",
      "Sharp, regular, well-defined border",
      "Stable size and appearance over years",
    ],
    causes: [
      "Benign clustering of melanocytes",
      "Combination of genetic factors and sun exposure",
    ],
    riskFactors: [
      "Fair skin",
      "High overall mole count",
      "History of sunburns, particularly in childhood",
      "Family history of atypical moles or melanoma",
    ],
    complications: [
      "Rarely, malignant transformation over many years",
      "Irritation from friction with clothing",
    ],
    careAdvice: [
      "Photograph moles periodically against a ruler to track change objectively",
      "Apply daily broad-spectrum SPF to all exposed moles",
      "Use the ABCDE rule (Asymmetry, Border, Colour, Diameter, Evolving) for self-checks",
      "Never attempt to remove a mole at home",
    ],
    warningSigns: [
      "New asymmetry or irregular borders",
      "Multiple colours appearing within the mole",
      "Growth beyond 6mm or rapid enlargement",
      "Bleeding, itching, or crusting without trauma",
    ],
    consultAdvice:
      "Any mole that changes in size, shape, colour, or sensation should be examined by a dermatologist promptly, even if the change seems minor.",
    similarCases: ["case-melanocytic-nevus-1"],
    herbs: [],
  },
  "vascular-lesion": {
    label: "Vascular Lesion",
    category: "Vascular malformation/proliferation",
    urgency: "routine",
    overview:
      "A broad group of benign lesions formed by blood vessels close to the skin surface, including cherry angiomas and related growths. Almost always harmless and largely cosmetic.",
    symptoms: [
      "Bright red, purple, or blue coloured spot",
      "Smooth, dome-shaped or flat surface",
      "Blanches (lightens) with firm pressure",
      "Usually painless",
    ],
    causes: [
      "Benign proliferation or dilation of small blood vessels",
      "Often age-related (cherry angiomas increase with age)",
      "Some are congenital vascular malformations",
    ],
    riskFactors: [
      "Increasing age",
      "Family history of similar lesions",
      "Hormonal changes (e.g. pregnancy) for some subtypes",
    ],
    complications: [
      "Bleeding if repeatedly traumatised or caught on clothing",
      "Cosmetic concern",
      "Rarely mistaken for pigmented lesions of more concern",
    ],
    careAdvice: [
      "No treatment is usually needed unless the lesion bleeds or is cosmetically bothersome",
      "Avoid picking or repeatedly scratching the area",
      "Laser or electrocautery removal is available electively",
      "Note whether the lesion blanches with pressure, a typical benign feature",
    ],
    warningSigns: [
      "Rapid growth or sudden appearance of many new lesions",
      "Colour turning dark brown or black rather than red/purple",
      "Bleeding without an obvious trigger",
    ],
    consultAdvice:
      "Vascular lesions are usually benign, but a dermatologist should confirm the diagnosis if the spot is new, growing quickly, or does not blanch with pressure.",
    similarCases: ["case-vascular-lesion-1"],
    herbs: [],
  },
};

export const SIMILAR_CASES: DiseaseAnalysisCase[] = [
  {
    id: "case-actinic-keratosis-1",
    conditionId: "actinic-keratosis",
    title: "Scaly patch on forearm, 58-year-old gardener",
    presentation: "Rough, pink, sandpaper-textured patch present for several months, more easily felt than seen.",
    outcome: "Confirmed actinic keratosis on dermatoscopy; cleared with a course of topical therapy.",
    similarity: 0.87,
  },
  {
    id: "case-actinic-keratosis-2",
    conditionId: "actinic-keratosis",
    title: "Multiple scalp lesions, retired fisherman",
    presentation: "Several rough patches on a balding scalp with decades of outdoor sun exposure.",
    outcome: "Field-treated with cryotherapy across multiple sessions; routine surveillance continues.",
    similarity: 0.8,
  },
  {
    id: "case-bcc-1",
    conditionId: "basal-cell-carcinoma",
    title: "Pearly nodule on the nose, 64-year-old",
    presentation: "Slow-growing, waxy bump with visible fine blood vessels, occasional bleeding after shaving.",
    outcome: "Biopsy confirmed basal cell carcinoma; successfully removed with Mohs surgery.",
    similarity: 0.9,
  },
  {
    id: "case-bcc-2",
    conditionId: "basal-cell-carcinoma",
    title: "Non-healing sore on the shoulder",
    presentation: "A sore that repeatedly scabbed over and reopened across three months.",
    outcome: "Confirmed superficial basal cell carcinoma; treated with topical therapy under dermatology care.",
    similarity: 0.83,
  },
  {
    id: "case-benign-keratosis-1",
    conditionId: "benign-keratosis",
    title: "Stuck-on brown plaque, 67-year-old",
    presentation: "Waxy, warty-surfaced brown plaque on the back, stable for over a year.",
    outcome: "Confirmed benign seborrheic keratosis on exam; left untreated per patient preference.",
    similarity: 0.89,
  },
  {
    id: "case-dermatofibroma-1",
    conditionId: "dermatofibroma",
    title: "Firm nodule on the shin after an insect bite",
    presentation: "Small firm brown bump that dimples inward when pinched, present for two years.",
    outcome: "Confirmed dermatofibroma clinically; no treatment required, monitored at annual checks.",
    similarity: 0.85,
  },
  {
    id: "case-melanoma-1",
    conditionId: "melanoma",
    title: "Changing mole on the back, 45-year-old",
    presentation: "Previously stable mole developed irregular borders and a second colour over three months.",
    outcome: "Biopsy confirmed early-stage melanoma; successfully excised with clear margins.",
    similarity: 0.92,
  },
  {
    id: "case-melanoma-2",
    conditionId: "melanoma",
    title: "New dark lesion, history of blistering sunburns",
    presentation: "New asymmetric, multi-coloured lesion over 7mm in a patient with a childhood sunburn history.",
    outcome: "Prompt dermatology referral led to early diagnosis and treatment.",
    similarity: 0.88,
  },
  {
    id: "case-melanocytic-nevus-1",
    conditionId: "melanocytic-nevus",
    title: "Stable mole monitored for 3 years",
    presentation: "5mm symmetric brown mole on the shoulder, unchanged across serial photos.",
    outcome: "Confirmed benign at annual dermatoscopy; routine monitoring continues.",
    similarity: 0.9,
  },
  {
    id: "case-vascular-lesion-1",
    conditionId: "vascular-lesion",
    title: "Bright red spot on the trunk, 50-year-old",
    presentation: "Small, smooth, dome-shaped red spot that blanches under pressure, gradually increasing in number.",
    outcome: "Confirmed cherry angioma clinically; left untreated as purely cosmetic.",
    similarity: 0.86,
  },
];