import type { KnowledgeDocument } from "./types";

/**
 * Sample dermatology knowledge corpus.
 * Replace or extend with real curated documents — the retriever indexes
 * whatever the document loader returns.
 */
export const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: "kb-retinoid-onboarding",
    title: "Starting a retinoid without wrecking your barrier",
    tags: ["retinol", "routine", "irritation", "anti-ageing", "start"],
    source: "Knowledge base / actives",
    content: `Begin with a low-strength retinol (0.1–0.3%) two nights per week, applied to completely dry skin after cleansing.
Use the "sandwich" method if you are sensitive: moisturiser, then retinoid, then moisturiser again.
Expect purging for four to six weeks — new breakouts in your usual problem areas that resolve faster than normal.
Stop and repair with ceramides for a week if you see stinging, flaking or shiny tightness; that is barrier damage, not adjustment.
Never layer a retinoid with exfoliating acids or benzoyl peroxide on the same night, and always wear SPF 50 the following morning.`,
  },
  {
    id: "kb-niacinamide-vitaminc",
    title: "Layering niacinamide with vitamin C",
    tags: ["niacinamide", "vitamin c", "mixing", "layering", "together", "compatible"],
    source: "Knowledge base / ingredient interactions",
    content: `The old warning that niacinamide "cancels out" vitamin C came from lab conditions with heat and extreme pH — not real formulations.
In practice most people tolerate them layered. The exception is high-dose pure L-ascorbic acid (15–20%) with high-dose niacinamide (10%), which can cause temporary flushing in reactive skin.
The safest structure: vitamin C in the morning under sunscreen, niacinamide at night alongside your barrier products.
If you want both in the morning, apply vitamin C first, wait sixty seconds, then niacinamide.`,
  },
  {
    id: "kb-post-acne-marks",
    title: "Why dark marks appear after acne clears",
    tags: ["pigmentation", "dark spots", "acne", "marks", "cause", "hyperpigmentation"],
    source: "Knowledge base / pigmentation",
    content: `Post-inflammatory hyperpigmentation is excess melanin deposited during the inflammatory phase of a breakout. It is more common and longer-lasting in deeper skin tones.
It fades on its own over three to twelve months. The two things that speed it up are daily broad-spectrum SPF 50 and consistent tyrosinase-modulating actives: azelaic acid 10%, niacinamide 5%, vitamin C, or a retinoid.
The two things that make it worse are picking at lesions and unprotected sun exposure.
Flat brown or purple marks are pigment. Indented or raised marks are scars and need in-clinic treatment.`,
  },
  {
    id: "kb-barrier-repair",
    title: "Repairing an over-exfoliated skin barrier",
    tags: ["barrier", "sensitivity", "irritation", "repair", "stinging", "damage"],
    source: "Knowledge base / barrier health",
    content: `Signs of barrier damage: stinging from products that used to be fine, shiny tight skin, flaking, sudden reactivity and increased redness.
Recovery protocol — hold this for a minimum of two weeks: a non-foaming cleanser once daily at night, a ceramide and cholesterol-rich moisturiser twice daily, mineral sunscreen, and nothing else.
Remove all acids, retinoids, vitamin C, scrubs and cleansing devices during recovery.
Reintroduce one active at a time, once weekly, and increase frequency only after two comfortable weeks.`,
  },
  {
    id: "kb-oily-skin-hydration",
    title: "Oily skin still needs moisturiser",
    tags: ["oily", "moisturiser", "hydration", "sebum", "shine"],
    source: "Knowledge base / skin types",
    content: `Oil and water are separate concerns. Skin can be oily and dehydrated at the same time — that combination is what produces shine plus tightness.
Stripping cleansers and alcohol-heavy toners trigger a rebound: the barrier compensates for water loss by producing more sebum.
Use a low-foam gel cleanser twice a day, an oil-free gel moisturiser with hyaluronic acid and niacinamide, and a fluid sunscreen.
Blot during the day instead of re-washing.`,
  },
  {
    id: "kb-sunscreen-application",
    title: "How much sunscreen actually protects you",
    tags: ["spf", "sunscreen", "sun", "protection", "uv", "reapply"],
    source: "Knowledge base / photoprotection",
    content: `Labelled SPF is measured at 2 mg per square centimetre. Most people apply a quarter of that and get a quarter of the protection.
The practical measure is two finger-lengths of product for face and neck, applied as the final morning step.
Reapply every two to three hours during daylight exposure, and after swimming or heavy sweating.
Sunscreen is the single most effective intervention for pigmentation, photoageing and post-acne marks — more than any serum.`,
  },
  {
    id: "kb-eczema-basics",
    title: "Eczema flare management fundamentals",
    tags: ["eczema", "atopic", "dermatitis", "itch", "dry", "flare"],
    source: "Knowledge base / conditions",
    content: `Atopic dermatitis is driven by a compromised barrier plus an over-reactive immune response, so treatment is always two-part: seal the barrier and reduce inflammation.
Apply a thick fragrance-free emollient within three minutes of bathing, at least twice daily, including on clear skin.
Keep showers short and lukewarm and use a soap-free cleanser.
Track flares against triggers: detergents, wool, dust, heat and stress are the common ones.
Yellow crusting, pus or fever means possible infection and needs same-week medical review.`,
  },
  {
    id: "kb-when-to-see-derm",
    title: "When to stop self-treating and see a dermatologist",
    tags: ["dermatologist", "consult", "warning", "urgent", "doctor", "when"],
    source: "Knowledge base / responsible care",
    content: `Book a dermatologist appointment if: a mole changes in size, shape, colour or sensation; a lesion bleeds, crusts or fails to heal within four weeks; you have painful deep nodules or any acne scarring; a rash spreads rapidly or comes with fever; or a condition has not improved after twelve weeks of consistent appropriate care.
Also seek care for anything involving the eyes, and for any skin condition that is significantly affecting sleep or mental health.
No AI analysis — including this platform — replaces an in-person examination or a biopsy.`,
  },
  {
    id: "kb-herbal-safety",
    title: "Using traditional herbal remedies safely",
    tags: ["herbal", "ayurveda", "neem", "turmeric", "aloe", "natural", "safety"],
    source: "Knowledge base / traditional support",
    content: `Traditional remedies are supportive, not curative, and "natural" is not the same as "non-irritating" — botanical extracts are among the most common contact allergens.
Always patch test on the inner forearm for 24 hours before facial use.
Never apply undiluted essential oils, never use raw lemon juice on skin, and discard aloe latex (the yellow layer) which is a known irritant.
Use herbal preparations alongside evidence-based care, not instead of it, and stop immediately if burning or itching develops.`,
  },
  {
    id: "kb-progress-tracking",
    title: "How to judge whether a routine is working",
    tags: ["progress", "tracking", "photos", "results", "timeline", "weeks"],
    source: "Knowledge base / method",
    content: `Skin turnover means nothing meaningful happens in under four weeks. Judge a routine at eight to twelve weeks, not eight days.
Photograph in the same place, same time of day, same lighting, with no makeup and no filter. Consistency of conditions matters more than image quality.
Change one variable at a time — if you add three products at once, you learn nothing about which worked.
Track texture, tone and breakout frequency separately; they improve on different timelines.`,
  },
];
