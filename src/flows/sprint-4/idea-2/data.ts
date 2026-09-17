/**
 * Static content for Sprint 4 / Idea 2 — the tucked logic gate.
 *
 * Copied from Sprint 4 Idea 1 rather than imported, because the directions stay
 * independent. It is still Sprint 3 Idea 2's fixed sample of 1,440 drug rows,
 * built once at module load from weighted tables and a seeded generator, with
 * the same taxonomy. Every number on screen — the headline, the per-value counts
 * in a value picker, the running count on each node of the logic gate and the
 * rows in the grid — is counted off that one array against the query as it
 * stands, so the views of the query cannot disagree.
 *
 * Each condition carries its own link to the one before, as in Idea 1, because
 * the logic gate draws every join as something you can flip.
 */

/** The attributes of Drugs as the product lists them. Idea 1's labels, inlined. */
const drugAttributes = [
  "Drug Name",
  "Therapy Area / Indication",
  "Development Stage",
  "Drug Geography",
  "Route of Administration",
  "Molecule Type",
  "Target",
  "Mechanism of Action",
  "ATC Classification",
  "Drug Type",
  "Mono/Combination Drug",
  "Drug Descriptor",
  "Gene Therapy Vector",
  "Application Type",
  "CAS Number",
]

/** Therapy areas in the product's own order. */
const therapyAreas = [
  "Cardiovascular",
  "Central Nervous System",
  "Dermatology",
  "Ear Nose Throat Disorders",
  "Gastrointestinal",
  "Genetic Disorders",
  "Genito Urinary System",
  "Hermatological Disorders",
  "Hormonal Disorders",
  "Immunology",
  "Infectious Disease",
  "Metabolic Disorders",
  "Musculoskeletal Disorders",
].map((label) => ({ label }))

/* -------------------------------------------------------------------------- */
/* The taxonomy                                                                */
/* -------------------------------------------------------------------------- */

/** A label and the share of the sample that carries it. Weights are relative. */
type Weighted = [label: string, weight: number]

const labelsOf = (table: Weighted[]) => table.map(([label]) => label)

/** Development stages, in pipeline order. Weighted towards the live phases. */
const stageTable: Weighted[] = [
  ["Discovery", 8],
  ["Preclinical", 12],
  ["Phase 0", 2],
  ["Phase I", 12],
  ["Phase II", 18],
  ["Phase III", 14],
  ["Phase IV", 5],
  ["Pre-registration", 4],
  ["Approved", 5],
  ["Marketed", 12],
  ["Suspended", 2],
  ["Discontinued", 4],
  ["Withdrawn", 2],
]

const regionTable: Weighted[] = [
  ["Europe", 34],
  ["North America", 27],
  ["Asia-Pacific", 21],
  ["Latin America", 8],
  ["Middle East & Africa", 5],
  ["Global", 5],
]

const routeTable: Weighted[] = [
  ["Oral", 38],
  ["Subcutaneous", 16],
  ["Topical", 13],
  ["Intravenous", 15],
  ["Intramuscular", 5],
  ["Inhaled", 6],
  ["Ophthalmic", 4],
  ["Transdermal", 3],
]

const moleculeTable: Weighted[] = [
  ["Small Molecule", 46],
  ["Monoclonal Antibody", 20],
  ["Peptide", 11],
  ["Recombinant Protein", 8],
  ["Oligonucleotide", 7],
  ["Cell Therapy", 4],
  ["Gene Therapy", 4],
]

const drugTypeTable: Weighted[] = [
  ["New Molecular Entity", 52],
  ["Generic", 18],
  ["Biosimilar", 9],
  ["Repurposed", 13],
  ["Fixed Dose Combination", 8],
]

const regimenTable: Weighted[] = [
  ["Mono", 78],
  ["Combination", 22],
]

const applicationTable: Weighted[] = [
  ["IND", 32],
  ["NDA", 23],
  ["MAA", 19],
  ["BLA", 14],
  ["ANDA", 12],
]

const vectorTable: Weighted[] = [
  ["Adeno Associated Virus (AAV)", 42],
  ["Lentivirus", 26],
  ["Adenovirus", 18],
  ["Lipid Nanoparticle (non-viral)", 14],
]

const descriptorTable: Weighted[] = [
  ["Antiinflammatory Therapy", 24],
  ["Immunosuppressant Therapy", 13],
  ["Analgesic Therapy", 11],
  ["Antiinfective Therapy", 11],
  ["Antineoplastic Therapy", 9],
  ["Antihypertensive Therapy", 8],
  ["Antidiabetic Therapy", 7],
  ["Lipid Regulator Therapy", 6],
  ["Antithrombotic Therapy", 6],
  ["Neuromodulator Therapy", 5],
]

const atcTable: Weighted[] = [
  ["A — Alimentary Tract & Metabolism", 11],
  ["B — Blood & Blood Forming Organs", 6],
  ["C — Cardiovascular System", 10],
  ["D — Dermatologicals", 15],
  ["G — Genito Urinary System", 7],
  ["H — Systemic Hormonal Preparations", 5],
  ["J — Antiinfectives for Systemic Use", 11],
  ["L — Antineoplastic & Immunomodulating", 12],
  ["M — Musculoskeletal System", 14],
  ["N — Nervous System", 6],
  ["R — Respiratory System", 3],
]

/**
 * A target and the mechanism it implies. Keeping the two in one table is the
 * point: a row carrying `Interleukin 23` against `Beta Adrenoceptor Antagonist`
 * is the kind of nonsense a pharma analyst spots in a second, and the sample is
 * shown to pharma analysts.
 */
const mechanismByTarget: Record<string, string> = {
  "Interleukin 23": "Interleukin 23 Inhibitor",
  "Interleukin 17A": "Interleukin 17A Inhibitor",
  "Janus Kinase 1": "Janus Kinase Inhibitor",
  "Tumour Necrosis Factor": "Tumour Necrosis Factor Alpha Inhibitor",
  "Phosphodiesterase 4": "Phosphodiesterase 4 Inhibitor",
  "Cyclooxygenase 2": "Cyclooxygenase 2 Inhibitor",
  "Interleukin 6 Receptor": "Interleukin 6 Receptor Antagonist",
  "Interleukin 4 Receptor": "Interleukin 4 Receptor Antagonist",
  "Interleukin 5": "Interleukin 5 Inhibitor",
  "Histamine H1 Receptor": "Histamine H1 Receptor Antagonist",
  "Endothelin Receptor A": "Endothelin Receptor Antagonist",
  "Angiotensin II Receptor": "Angiotensin II Receptor Antagonist",
  "Beta Adrenoceptor": "Beta Adrenoceptor Antagonist",
  PCSK9: "PCSK9 Inhibitor",
  "Factor Xa": "Factor Xa Inhibitor",
  "Erythropoietin Receptor": "Erythropoietin Receptor Agonist",
  BCL11A: "BCL11A Gene Silencer",
  "Sodium Glucose Cotransporter 2": "SGLT2 Inhibitor",
  "Glucagon Like Peptide 1 Receptor": "GLP-1 Receptor Agonist",
  "Dipeptidyl Peptidase 4": "DPP-4 Inhibitor",
  "NMDA Receptor": "NMDA Receptor Antagonist",
  "Dopamine D2 Receptor": "Dopamine D2 Receptor Antagonist",
  "Voltage Gated Sodium Channel": "Sodium Channel Blocker",
  "Muscarinic M3 Receptor": "Muscarinic M3 Receptor Antagonist",
  "Androgen Receptor": "Androgen Receptor Antagonist",
  "Estrogen Receptor": "Estrogen Receptor Modulator",
  "Viral RNA Polymerase": "Viral RNA Polymerase Inhibitor",
  "Viral Protease": "Viral Protease Inhibitor",
  "Bacterial DNA Gyrase": "DNA Gyrase Inhibitor",
  "Somatostatin Receptor": "Somatostatin Receptor Agonist",
  "Thyroid Hormone Receptor": "Thyroid Hormone Receptor Agonist",
  "Cortisol Synthase": "Cortisol Synthesis Inhibitor",
  CFTR: "CFTR Potentiator",
  Dystrophin: "Exon Skipping Oligonucleotide",
  "Survival Motor Neuron 2": "SMN2 Splicing Modifier",
}

/** Which targets a therapy area is actually worked on through. */
const targetsByArea: Record<string, Weighted[]> = {
  Dermatology: [
    ["Interleukin 23", 30],
    ["Interleukin 17A", 25],
    ["Janus Kinase 1", 20],
    ["Tumour Necrosis Factor", 15],
    ["Phosphodiesterase 4", 10],
  ],
  "Musculoskeletal Disorders": [
    ["Tumour Necrosis Factor", 30],
    ["Cyclooxygenase 2", 25],
    ["Janus Kinase 1", 23],
    ["Interleukin 6 Receptor", 22],
  ],
  Immunology: [
    ["Interleukin 6 Receptor", 30],
    ["Tumour Necrosis Factor", 28],
    ["Janus Kinase 1", 24],
    ["Interleukin 17A", 18],
  ],
  Cardiovascular: [
    ["Angiotensin II Receptor", 28],
    ["PCSK9", 28],
    ["Endothelin Receptor A", 22],
    ["Beta Adrenoceptor", 22],
  ],
  "Infectious Disease": [
    ["Viral RNA Polymerase", 40],
    ["Viral Protease", 32],
    ["Bacterial DNA Gyrase", 28],
  ],
  "Metabolic Disorders": [
    ["Glucagon Like Peptide 1 Receptor", 40],
    ["Sodium Glucose Cotransporter 2", 34],
    ["Dipeptidyl Peptidase 4", 26],
  ],
  "Central Nervous System": [
    ["NMDA Receptor", 34],
    ["Dopamine D2 Receptor", 34],
    ["Voltage Gated Sodium Channel", 32],
  ],
  Gastrointestinal: [
    ["Interleukin 23", 36],
    ["Tumour Necrosis Factor", 34],
    ["Janus Kinase 1", 30],
  ],
  "Ear Nose Throat Disorders": [
    ["Interleukin 4 Receptor", 38],
    ["Histamine H1 Receptor", 34],
    ["Interleukin 5", 28],
  ],
  "Genito Urinary System": [
    ["Muscarinic M3 Receptor", 40],
    ["Androgen Receptor", 32],
    ["Estrogen Receptor", 28],
  ],
  "Hermatological Disorders": [
    ["Factor Xa", 38],
    ["Erythropoietin Receptor", 34],
    ["BCL11A", 28],
  ],
  "Hormonal Disorders": [
    ["Somatostatin Receptor", 36],
    ["Thyroid Hormone Receptor", 34],
    ["Cortisol Synthase", 30],
  ],
  "Genetic Disorders": [
    ["CFTR", 38],
    ["Dystrophin", 32],
    ["Survival Motor Neuron 2", 30],
  ],
}

/** Both lists run alphabetically — thirty-odd values is past useful order. */
const targetLabels = Array.from(
  new Set(Object.values(targetsByArea).flatMap((table) => labelsOf(table))),
).sort()

const mechanismLabels = Array.from(
  new Set(targetLabels.map((target) => mechanismByTarget[target])),
).sort()

/** One value in a picker. Counts are computed, never authored. */
export interface ValueItem {
  label: string
  /** True when the value has children underneath it, like a region and its countries. */
  drillable?: boolean
}

/**
 * Level 4 — what sits under a value. Therapy areas open into indications,
 * regions into countries.
 *
 * The weights double as the generator's distribution, so the taxonomy and the
 * sample can never drift apart: nothing appears in a picker that no row can
 * carry, and nothing is in a row that a picker cannot reach.
 */
const childTables: Record<string, Weighted[]> = {
  Dermatology: [
    ["Plaque Psoriasis", 24],
    ["Atopic Dermatitis", 21],
    ["Acne Vulgaris", 12],
    ["Hidradenitis Suppurativa", 9],
    ["Vitiligo", 7],
    ["Alopecia Areata", 7],
    ["Chronic Urticaria", 6],
    ["Rosacea", 6],
    ["Pemphigus Vulgaris", 4],
    ["Cutaneous Lupus Erythematosus", 2],
    ["Epidermolysis Bullosa", 2],
  ],
  Cardiovascular: [
    ["Chronic Heart Failure", 24],
    ["Pulmonary Arterial Hypertension", 17],
    ["Resistant Hypertension", 15],
    ["Dyslipidaemia", 14],
    ["Atrial Fibrillation", 12],
    ["Venous Thrombosis", 10],
    ["Cardiomyopathy", 8],
  ],
  "Central Nervous System": [
    ["Alzheimer's Disease", 30],
    ["Parkinson's Disease", 24],
    ["Epilepsy", 21],
    ["Multiple Sclerosis", 15],
    ["Major Depressive Disorder", 10],
  ],
  "Ear Nose Throat Disorders": [
    ["Chronic Rhinosinusitis", 32],
    ["Allergic Rhinitis", 25],
    ["Otitis Media", 17],
    ["Sensorineural Hearing Loss", 15],
    ["Tinnitus", 11],
  ],
  Gastrointestinal: [
    ["Ulcerative Colitis", 31],
    ["Crohn's Disease", 27],
    ["Irritable Bowel Syndrome", 17],
    ["Coeliac Disease", 14],
    ["Eosinophilic Oesophagitis", 11],
  ],
  "Genetic Disorders": [
    ["Cystic Fibrosis", 30],
    ["Duchenne Muscular Dystrophy", 24],
    ["Sickle Cell Disease", 20],
    ["Spinal Muscular Atrophy", 14],
    ["Huntington's Disease", 12],
  ],
  "Genito Urinary System": [
    ["Overactive Bladder", 30],
    ["Chronic Kidney Disease", 25],
    ["Benign Prostatic Hyperplasia", 18],
    ["Endometriosis", 16],
    ["Interstitial Cystitis", 11],
  ],
  "Hermatological Disorders": [
    ["Anaemia", 32],
    ["Haemophilia A", 26],
    ["Immune Thrombocytopenia", 22],
    ["Beta Thalassaemia", 20],
  ],
  "Hormonal Disorders": [
    ["Hypothyroidism", 30],
    ["Cushing's Syndrome", 22],
    ["Acromegaly", 19],
    ["Hypogonadism", 16],
    ["Primary Adrenal Insufficiency", 13],
  ],
  Immunology: [
    ["Rheumatoid Arthritis", 34],
    ["Systemic Lupus Erythematosus", 28],
    ["Sjögren's Syndrome", 21],
    ["Giant Cell Arteritis", 17],
  ],
  "Infectious Disease": [
    ["Influenza", 24],
    ["COVID-19", 21],
    ["Hepatitis B", 16],
    ["HIV Infection", 15],
    ["Tuberculosis", 13],
    ["Respiratory Syncytial Virus", 11],
  ],
  "Metabolic Disorders": [
    ["Obesity", 30],
    ["Type 2 Diabetes", 27],
    ["Non-alcoholic Steatohepatitis", 17],
    ["Gout", 15],
    ["Phenylketonuria", 11],
  ],
  "Musculoskeletal Disorders": [
    ["Osteoarthritis", 27],
    ["Rheumatoid Arthritis", 24],
    ["Osteoporosis", 17],
    ["Ankylosing Spondylitis", 15],
    ["Psoriatic Arthritis", 11],
    ["Fibromyalgia", 6],
  ],
  Europe: [
    ["Germany", 19],
    ["France", 15],
    ["Italy", 14],
    ["United Kingdom", 12],
    ["Spain", 10],
    ["Switzerland", 7],
    ["Austria", 6],
    ["Denmark", 5],
    ["Belgium", 4],
    ["Netherlands", 4],
    ["Finland", 3],
    ["Sweden", 3],
    ["Ireland", 2],
  ],
  "North America": [
    ["United States", 74],
    ["Canada", 20],
    ["Mexico", 6],
  ],
  "Asia-Pacific": [
    ["Japan", 30],
    ["China", 26],
    ["South Korea", 15],
    ["Australia", 15],
    ["India", 14],
  ],
  "Latin America": [
    ["Brazil", 52],
    ["Argentina", 24],
    ["Chile", 13],
    ["Colombia", 11],
  ],
  "Middle East & Africa": [
    ["Israel", 42],
    ["South Africa", 28],
    ["United Arab Emirates", 18],
    ["Saudi Arabia", 12],
  ],
}

export const childrenByValue: Record<string, ValueItem[]> = Object.fromEntries(
  Object.entries(childTables).map(([parent, table]) => [
    parent,
    table.map(([label]) => ({ label })),
  ]),
)

/** Therapy areas keep Idea 1's ordering; the weights are this prototype's. */
const therapyAreaTable: Weighted[] = therapyAreas.map(({ label }) => [
  label,
  {
    Dermatology: 14,
    "Musculoskeletal Disorders": 13,
    "Infectious Disease": 11,
    Cardiovascular: 9,
    "Metabolic Disorders": 9,
    "Genito Urinary System": 7,
    "Ear Nose Throat Disorders": 6,
    Gastrointestinal: 6,
    Immunology: 6,
    "Hormonal Disorders": 5,
    "Hermatological Disorders": 5,
    "Genetic Disorders": 5,
    "Central Nervous System": 4,
  }[label] ?? 5,
])

/** Values per attribute, in the order a picker lists them. */
export const valuesByAttribute: Record<string, ValueItem[]> = {
  "Therapy Area / Indication": labelsOf(therapyAreaTable).map((label) => ({
    label,
    drillable: true,
  })),
  "Development Stage": labelsOf(stageTable).map((label) => ({ label })),
  "Drug Geography": labelsOf(regionTable).map((label) => ({
    label,
    drillable: label !== "Global",
  })),
  "Route of Administration": labelsOf(routeTable).map((label) => ({ label })),
  "Molecule Type": labelsOf(moleculeTable).map((label) => ({ label })),
  Target: targetLabels.map((label) => ({ label })),
  "Mechanism of Action": mechanismLabels.map((label) => ({ label })),
  "ATC Classification": labelsOf(atcTable).map((label) => ({ label })),
  "Drug Type": labelsOf(drugTypeTable).map((label) => ({ label })),
  "Mono/Combination Drug": labelsOf(regimenTable).map((label) => ({ label })),
  "Drug Descriptor": labelsOf(descriptorTable).map((label) => ({ label })),
  "Gene Therapy Vector": labelsOf(vectorTable).map((label) => ({ label })),
  "Application Type": labelsOf(applicationTable).map((label) => ({ label })),
}

/* -------------------------------------------------------------------------- */
/* The sample                                                                  */
/* -------------------------------------------------------------------------- */

export interface DrugRow {
  id: string
  name: string
  generic: string
  company: string
  therapyArea: string
  indication: string
  stage: string
  region: string
  country: string
  route: string
  moleculeType: string
  target: string
  moa: string
  atc: string
  drugType: string
  regimen: string
  descriptor: string
  applicationType: string
  /** Only gene therapies carry one. Everything else has no value for it. */
  vector?: string
}

/**
 * Fixed-seed mulberry32. Deterministic — the same 1,440 rows on every render,
 * every reload and every build — but without the lattice a plain LCG leaves,
 * which showed up as neighbouring rows sharing half their values.
 */
function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

function weightedPick(table: Weighted[], roll: number) {
  const total = table.reduce((sum, [, weight]) => sum + weight, 0)
  let cursor = roll * total
  for (const [label, weight] of table) {
    cursor -= weight
    if (cursor <= 0) return label
  }
  return table[table.length - 1][0]
}

/** Which descriptors a therapy area can plausibly carry, so rows read true. */
const descriptorsByArea: Record<string, Weighted[]> = {
  Dermatology: [
    ["Antiinflammatory Therapy", 52],
    ["Immunosuppressant Therapy", 30],
    ["Antiinfective Therapy", 10],
    ["Analgesic Therapy", 8],
  ],
  "Musculoskeletal Disorders": [
    ["Antiinflammatory Therapy", 48],
    ["Analgesic Therapy", 30],
    ["Immunosuppressant Therapy", 22],
  ],
  Immunology: [
    ["Immunosuppressant Therapy", 46],
    ["Antiinflammatory Therapy", 44],
    ["Antineoplastic Therapy", 10],
  ],
  Cardiovascular: [
    ["Antihypertensive Therapy", 40],
    ["Lipid Regulator Therapy", 30],
    ["Antithrombotic Therapy", 30],
  ],
  "Infectious Disease": [
    ["Antiinfective Therapy", 78],
    ["Antiinflammatory Therapy", 14],
    ["Immunosuppressant Therapy", 8],
  ],
  "Metabolic Disorders": [
    ["Antidiabetic Therapy", 62],
    ["Lipid Regulator Therapy", 24],
    ["Antiinflammatory Therapy", 14],
  ],
  "Central Nervous System": [
    ["Neuromodulator Therapy", 58],
    ["Analgesic Therapy", 26],
    ["Antiinflammatory Therapy", 16],
  ],
  Gastrointestinal: [
    ["Antiinflammatory Therapy", 50],
    ["Immunosuppressant Therapy", 34],
    ["Analgesic Therapy", 16],
  ],
  "Ear Nose Throat Disorders": [
    ["Antiinflammatory Therapy", 54],
    ["Antiinfective Therapy", 28],
    ["Analgesic Therapy", 18],
  ],
  "Genito Urinary System": [
    ["Antiinflammatory Therapy", 34],
    ["Neuromodulator Therapy", 30],
    ["Antiinfective Therapy", 20],
    ["Antineoplastic Therapy", 16],
  ],
  "Hermatological Disorders": [
    ["Antithrombotic Therapy", 44],
    ["Antineoplastic Therapy", 32],
    ["Immunosuppressant Therapy", 24],
  ],
  "Hormonal Disorders": [
    ["Neuromodulator Therapy", 40],
    ["Antineoplastic Therapy", 32],
    ["Antidiabetic Therapy", 28],
  ],
  "Genetic Disorders": [
    ["Immunosuppressant Therapy", 38],
    ["Neuromodulator Therapy", 34],
    ["Antiinflammatory Therapy", 28],
  ],
}

/** ATC class follows the therapy area — a class is a body system, not a mood. */
const atcByArea: Record<string, Weighted[]> = {
  Dermatology: [
    ["D — Dermatologicals", 72],
    ["L — Antineoplastic & Immunomodulating", 28],
  ],
  "Musculoskeletal Disorders": [
    ["M — Musculoskeletal System", 78],
    ["L — Antineoplastic & Immunomodulating", 22],
  ],
  Immunology: [
    ["L — Antineoplastic & Immunomodulating", 66],
    ["M — Musculoskeletal System", 34],
  ],
  Cardiovascular: [["C — Cardiovascular System", 100]],
  "Infectious Disease": [
    ["J — Antiinfectives for Systemic Use", 84],
    ["R — Respiratory System", 16],
  ],
  "Metabolic Disorders": [["A — Alimentary Tract & Metabolism", 100]],
  "Central Nervous System": [["N — Nervous System", 100]],
  Gastrointestinal: [
    ["A — Alimentary Tract & Metabolism", 74],
    ["L — Antineoplastic & Immunomodulating", 26],
  ],
  "Ear Nose Throat Disorders": [
    ["R — Respiratory System", 62],
    ["J — Antiinfectives for Systemic Use", 38],
  ],
  "Genito Urinary System": [["G — Genito Urinary System", 100]],
  "Hermatological Disorders": [["B — Blood & Blood Forming Organs", 100]],
  "Hormonal Disorders": [["H — Systemic Hormonal Preparations", 100]],
  "Genetic Disorders": [
    ["L — Antineoplastic & Immunomodulating", 58],
    ["M — Musculoskeletal System", 42],
  ],
}

/** Route follows the molecule — biologics are not tablets. */
const routesByMolecule: Record<string, Weighted[]> = {
  "Small Molecule": [
    ["Oral", 62],
    ["Topical", 18],
    ["Intravenous", 8],
    ["Inhaled", 6],
    ["Ophthalmic", 3],
    ["Transdermal", 3],
  ],
  "Monoclonal Antibody": [
    ["Subcutaneous", 54],
    ["Intravenous", 44],
    ["Ophthalmic", 2],
  ],
  Peptide: [
    ["Subcutaneous", 62],
    ["Intravenous", 20],
    ["Oral", 12],
    ["Intramuscular", 6],
  ],
  "Recombinant Protein": [
    ["Intravenous", 52],
    ["Subcutaneous", 34],
    ["Intramuscular", 14],
  ],
  Oligonucleotide: [
    ["Subcutaneous", 48],
    ["Intravenous", 40],
    ["Inhaled", 12],
  ],
  "Cell Therapy": [["Intravenous", 100]],
  "Gene Therapy": [
    ["Intravenous", 68],
    ["Intramuscular", 20],
    ["Ophthalmic", 12],
  ],
}

const companies: { name: string; code: string }[] = [
  { name: "Novartis", code: "NVS" },
  { name: "AstraZeneca", code: "AZ" },
  { name: "Sanofi", code: "SAN" },
  { name: "Roche", code: "RG" },
  { name: "Pfizer", code: "PF" },
  { name: "Bayer", code: "BAY" },
  { name: "Boehringer Ingelheim", code: "BI" },
  { name: "LEO Pharma", code: "LEO" },
  { name: "UCB", code: "UCB" },
  { name: "Almirall", code: "ALM" },
  { name: "Galderma", code: "GAL" },
  { name: "Ipsen", code: "IPS" },
  { name: "Servier", code: "SVR" },
  { name: "Orion", code: "ORI" },
  { name: "Grünenthal", code: "GRN" },
  { name: "Pierre Fabre", code: "PFB" },
  { name: "Recordati", code: "REC" },
  { name: "Lundbeck", code: "LUN" },
  { name: "Chiesi", code: "CHI" },
  { name: "Menarini", code: "MEN" },
  { name: "Zydus Lifesciences", code: "ZYD" },
  { name: "Sun Pharmaceutical", code: "SUN" },
  { name: "Teva Pharmaceutical", code: "TEV" },
  { name: "Daiichi Sankyo", code: "DS" },
  { name: "Astellas Pharma", code: "AST" },
  { name: "Eisai", code: "EIS" },
]

/**
 * Brand-name syllables. 48 × 15 = 720 combinations, walked with a stride
 * coprime to 720, so the 720 coined names in the sample never repeat.
 */
const namePrefixes = [
  "Vetra", "Karde", "Sori", "Psor", "Derma", "Cardi", "Immu", "Neuro",
  "Onco", "Respi", "Hepa", "Reno", "Osteo", "Rheu", "Glyca", "Lipi",
  "Vascu", "Alve", "Corti", "Dermo", "Endo", "Fibro", "Gastro", "Hema",
  "Kera", "Lumi", "Meta", "Myco", "Nephro", "Oculo", "Pulmo", "Sero",
  "Somno", "Thera", "Tono", "Uro", "Vira", "Xylo", "Zeno", "Clari",
  "Dena", "Elva", "Ferra", "Gliva", "Ivera", "Nova", "Orbi", "Quilo",
]
const nameSuffixes = [
  "luma", "vex", "dex", "ryn", "zia", "tra", "mid", "nol",
  "sten", "vir", "cel", "dyn", "phor", "tide", "xan",
]

const genericStems = [
  "vetral", "karden", "soril", "psoral", "dermal", "cardim", "immun", "neural",
  "oncal", "respir", "hepat", "renal", "osteo", "rheum", "glycan", "lipid",
  "vascul", "alvel", "cortic", "dermon", "endor", "fibrol", "gastr", "hemat",
  "kerat", "lumin", "metabr", "mycol", "nephr", "ocul", "pulmon", "seral",
  "somnol", "therap", "tonel", "urol", "viral", "xylor", "zenor", "ferral",
]
const genericEndings = [
  "imab", "inib", "stat", "dine", "tide", "mab", "cept", "sartan", "prazole",
  "ciclib", "tinib", "zumab", "ximab", "olol", "parib", "gliptin", "floxacin",
  "vastatin",
]
const genericSalts = ["", " Sodium", " Hydrochloride", " Besilate"]

const SAMPLE_ROWS = 1_440

function buildSample(): DrugRow[] {
  const random = seededRandom(20_260_906)
  const rows: DrugRow[] = []

  for (let i = 0; i < SAMPLE_ROWS; i += 1) {
    const therapyArea = weightedPick(therapyAreaTable, random())
    const indication = weightedPick(childTables[therapyArea], random())
    const stage = weightedPick(stageTable, random())
    const region = weightedPick(regionTable, random())
    const country = region === "Global" ? "Global" : weightedPick(childTables[region], random())
    const moleculeType = weightedPick(moleculeTable, random())
    const route = weightedPick(routesByMolecule[moleculeType], random())
    const descriptor = weightedPick(descriptorsByArea[therapyArea], random())
    const atc = weightedPick(atcByArea[therapyArea], random())
    const target = weightedPick(targetsByArea[therapyArea], random())
    const moa = mechanismByTarget[target]
    const drugType = weightedPick(drugTypeTable, random())
    const regimen = weightedPick(regimenTable, random())
    const applicationType = weightedPick(applicationTable, random())
    const company = companies[i % companies.length]

    // Half the sample carries a coined brand name, half a development code —
    // which is what a pipeline database actually looks like.
    const coined = i % 2 === 0
    const combo = ((i / 2) * 137) % 720
    const name = coined
      ? `${namePrefixes[combo % 48]}${nameSuffixes[Math.floor(combo / 48)]}`
      : `${company.code}-${1_000 + i}`

    // 40 stems x 18 endings walked on a coprime stride, and a salt that shifts
    // on the second lap, so no two of the 1,440 generic names collide.
    const genericCombo = (i * 271) % 720
    const salt = genericSalts[(i + Math.floor(i / 720)) % 4]
    const generic = `${genericStems[genericCombo % 40]}${genericEndings[Math.floor(genericCombo / 40)]}${salt}`

    rows.push({
      id: `d-${i}`,
      name,
      generic: generic.charAt(0).toUpperCase() + generic.slice(1),
      company: company.name,
      therapyArea,
      indication,
      stage,
      region,
      country,
      route,
      moleculeType,
      target,
      moa,
      atc,
      drugType,
      regimen,
      descriptor,
      applicationType,
      vector:
        moleculeType === "Gene Therapy" ? weightedPick(vectorTable, random()) : undefined,
    })
  }

  return rows
}

/** The sample. Built once, never mutated, never refetched. */
export const sample: DrugRow[] = buildSample()

/** What the sample stands in for on the live platform. Shown, not multiplied. */
export const platformTotal = 285_529

/* -------------------------------------------------------------------------- */
/* Attributes                                                                  */
/* -------------------------------------------------------------------------- */

export interface AttributeDef {
  /** How the pill bar names it: `Therapy area is Dermatology`. */
  subject: string
  /** Every label under this attribute a row satisfies, at any level. */
  valuesOf: (row: DrugRow) => string[]
  /** The top-level value, for counting how far the attribute can still split. */
  primaryOf: (row: DrugRow) => string
}

/**
 * The bridge between the taxonomy and the sample. An attribute with an entry
 * here is selectable and filters for real; an attribute without one is free
 * text and cannot be picked, rather than offering a tick that does nothing.
 */
export const attributeDefs: Record<string, AttributeDef> = {
  "Therapy Area / Indication": {
    subject: "Therapy area",
    valuesOf: (row) => [row.therapyArea, row.indication],
    primaryOf: (row) => row.therapyArea,
  },
  "Development Stage": {
    subject: "Development stage",
    valuesOf: (row) => [row.stage],
    primaryOf: (row) => row.stage,
  },
  "Drug Geography": {
    subject: "Drug geography",
    valuesOf: (row) => [row.region, row.country],
    primaryOf: (row) => row.region,
  },
  "Route of Administration": {
    subject: "Route of administration",
    valuesOf: (row) => [row.route],
    primaryOf: (row) => row.route,
  },
  "Molecule Type": {
    subject: "Molecule type",
    valuesOf: (row) => [row.moleculeType],
    primaryOf: (row) => row.moleculeType,
  },
  Target: {
    subject: "Target",
    valuesOf: (row) => [row.target],
    primaryOf: (row) => row.target,
  },
  "Mechanism of Action": {
    subject: "Mechanism of action",
    valuesOf: (row) => [row.moa],
    primaryOf: (row) => row.moa,
  },
  "ATC Classification": {
    subject: "ATC classification",
    valuesOf: (row) => [row.atc],
    primaryOf: (row) => row.atc,
  },
  "Drug Type": {
    subject: "Drug type",
    valuesOf: (row) => [row.drugType],
    primaryOf: (row) => row.drugType,
  },
  "Mono/Combination Drug": {
    subject: "Mono / combination",
    valuesOf: (row) => [row.regimen],
    primaryOf: (row) => row.regimen,
  },
  "Drug Descriptor": {
    subject: "Drug descriptor",
    valuesOf: (row) => [row.descriptor],
    primaryOf: (row) => row.descriptor,
  },
  "Gene Therapy Vector": {
    subject: "Gene therapy vector",
    valuesOf: (row) => (row.vector ? [row.vector] : []),
    primaryOf: (row) => row.vector ?? "—",
  },
  "Application Type": {
    subject: "Application type",
    valuesOf: (row) => [row.applicationType],
    primaryOf: (row) => row.applicationType,
  },
}

/**
 * The attributes of Drugs, ordered by how far each can actually split a set,
 * with the two free-text ones last. Idea 1's order, kept so the two ideas list
 * attributes the same way.
 */
export const drugAttributeOrder = [
  "Therapy Area / Indication",
  "Development Stage",
  "Drug Geography",
  "Molecule Type",
  "Route of Administration",
  "Drug Descriptor",
  "Mechanism of Action",
  "Target",
  "ATC Classification",
  "Drug Type",
  "Mono/Combination Drug",
  "Application Type",
  "Gene Therapy Vector",
  "Drug Name",
  "CAS Number",
].filter((label) => drugAttributes.includes(label))

/* -------------------------------------------------------------------------- */
/* The query                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One attribute's condition. The query is an ordered list of these, and every
 * view draws the same list: a clause of the sentence, a node on the logic gate
 * canvas, the ticks in one attribute's value picker.
 */
export interface Condition {
  /**
   * Stable across reordering. Usually the attribute itself; a value pulled out
   * into its own condition gets the attribute with a suffix, since the same
   * attribute can then appear twice.
   */
  id: string
  attribute: string
  /** Selected labels, at any level of that attribute's taxonomy. */
  values: string[]
  /** Word between the values. `and` is an intersection, not a union. */
  join: "or" | "and"
  /** Whether the condition keeps or drops the rows it matches. */
  mode: "is" | "is not"
  /**
   * How this condition meets everything before it. Ignored on the first. Read
   * left to right, so `A and B or C` is `(A and B) or C` — the order the logic
   * gate draws it, top to bottom.
   */
  link: "and" | "or"
}

function conditionHit(row: DrugRow, condition: Condition) {
  const def = attributeDefs[condition.attribute]
  // An attribute with no definition cannot filter, so it keeps every row
  // rather than silently emptying the set as though it had been applied.
  if (!def || condition.values.length === 0) return true
  const values = def.valuesOf(row)
  const hit =
    condition.join === "and"
      ? condition.values.every((value) => values.includes(value))
      : condition.values.some((value) => values.includes(value))
  return condition.mode === "is not" ? !hit : hit
}

/**
 * Strictly left to right: each condition folds into the result of everything
 * before it by its own link, so `A and B or C` is `(A and B) or C`. The per-node
 * counts on the logic gate are this same fold stopped early, so the last node's
 * count is always the headline.
 */
function rowMatches(row: DrugRow, conditions: Condition[]) {
  let result = true
  conditions.forEach((condition, i) => {
    const hit = conditionHit(row, condition)
    result = i === 0 ? hit : condition.link === "or" ? result || hit : result && hit
  })
  return result
}

/** The sample, filtered in memory. The only source of every number on screen. */
export function matchingRows(conditions: Condition[], rows: DrugRow[] = sample) {
  if (conditions.length === 0) return rows
  return rows.filter((row) => rowMatches(row, conditions))
}

/**
 * How many rows survive each step of the query, top to bottom — the count the
 * logic gate writes beside every node.
 */
export function runningCounts(conditions: Condition[]) {
  return conditions.map((_, i) => matchingRows(conditions.slice(0, i + 1)).length)
}

/**
 * How many rows each label of an attribute would yield, in current context —
 * the query with this condition lifted, so the numbers beside the values say
 * "what you would get if you picked this" rather than "what you have already
 * got". Only the one condition is lifted: when a value has been pulled out into
 * a condition of its own, the other condition on the same attribute still runs.
 */
export function facetCounts(conditions: Condition[], id: string, attribute: string) {
  const def = attributeDefs[attribute]
  const counts: Record<string, number> = {}
  if (!def) return counts
  const others = conditions.filter((condition) => condition.id !== id)
  for (const row of matchingRows(others)) {
    for (const value of def.valuesOf(row)) {
      counts[value] = (counts[value] ?? 0) + 1
    }
  }
  return counts
}

/** Development stages in pipeline order, so the grid sorts them that way. */
export const stageOrder = new Map(labelsOf(stageTable).map((label, index) => [label, index]))

/** The values a pill menu offers: the top level, the children of any ticked parent, and whatever is ticked. */
export function valueOptions(attribute: string, selected: string[]) {
  const top = (valuesByAttribute[attribute] ?? []).map((item) => item.label)
  const children = top
    .filter((label) => selected.includes(label))
    .flatMap((label) => (childrenByValue[label] ?? []).map((item) => item.label))
  return Array.from(new Set([...top, ...children, ...selected]))
}

