/**
 * Sprint 3 / Idea 4 — results-first. The data and the pure functions over it.
 *
 * There is no filter engine and nothing is fetched. What there is: a fixed
 * sample of 44 drug records held in memory, and predicates that narrow it. Every
 * number on screen — the match count, the counts beside each value in a column
 * menu, the footer aggregates — is derived from that sample by the helpers at
 * the bottom of this file, so the grid and the numbers describing it cannot
 * disagree.
 *
 * The one authored number left is `DATABASE_RECORDS`, the size of the live
 * Drugs database. It is labelled as scale on screen and never used in a
 * calculation.
 *
 * `src/flows/sprint-3/idea-1/data.ts` is imported read-only for the attribute
 * list behind the column manager, so the two ideas stay on the same domain
 * nouns.
 */
import { drugAttributes } from "@/flows/sprint-3/idea-1/data"

export { drugAttributes }

/** Size of the live Drugs database. Context only — never computed against. */
export const DATABASE_RECORDS = "285,529"

/* -------------------------------------------------------------------------- */
/* Records                                                                     */
/* -------------------------------------------------------------------------- */

export interface DrugRecord {
  id: string
  name: string
  /** Pipeline assets have no brand yet — rendered as an em dash. */
  brand?: string
  company: string
  therapyAreas: string[]
  indications: string[]
  stage: string
  moleculeType: string
  routes: string[]
  geographies: string[]
  targets: string[]
  mechanism: string
  drugType: string
  marketingStatus: string
  /** Peak-year risk-adjusted NPV, US$ millions. */
  npv: number
}

export const rows: DrugRecord[] = [
  {
    id: "dato-dxd",
    name: "Datopotamab Deruxtecan",
    brand: "Datroway",
    company: "Daiichi Sankyo",
    therapyAreas: ["Oncology"],
    indications: [
      "Non-Small Cell Lung Cancer",
      "Breast Cancer (HR+/HER2−)",
      "Triple-Negative Breast Cancer",
    ],
    stage: "Phase II",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "United Kingdom", "Germany", "France", "Spain"],
    targets: ["TROP2"],
    mechanism: "TROP2-directed cytotoxic delivery",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 4120,
  },
  {
    id: "tarlatamab",
    name: "Tarlatamab",
    brand: "Imdelltra",
    company: "Amgen",
    therapyAreas: ["Oncology"],
    indications: ["Small Cell Lung Cancer", "Neuroendocrine Prostate Cancer"],
    stage: "Phase II",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "United Kingdom"],
    targets: ["DLL3", "CD3"],
    mechanism: "DLL3 x CD3 T-cell engagement",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 2870,
  },
  {
    // The wide record. On the live platform this drug alone fills a viewport,
    // because each indication and each geography renders as its own merged row.
    id: "zanidatamab",
    name: "Zanidatamab",
    company: "Jazz Pharmaceuticals",
    therapyAreas: ["Oncology"],
    indications: [
      "Biliary Tract Cancer",
      "Gastro-Oesophageal Adenocarcinoma",
      "Breast Cancer (HER2+)",
      "Gastric Cancer",
      "Colorectal Cancer",
      "Non-Small Cell Lung Cancer",
      "Pancreatic Cancer",
      "Ovarian Cancer",
      "Endometrial Cancer",
    ],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous", "Subcutaneous"],
    geographies: [
      "United States",
      "Canada",
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Japan",
      "China",
      "South Korea",
      "Australia",
      "Brazil",
    ],
    targets: ["HER2"],
    mechanism: "HER2 biparatopic binding",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 3450,
  },
  {
    id: "obexelimab",
    name: "Obexelimab",
    company: "Zenas BioPharma",
    therapyAreas: ["Immunology"],
    indications: [
      "IgG4-Related Disease",
      "Warm Autoimmune Haemolytic Anaemia",
      "Systemic Lupus Erythematosus",
      "Multiple Sclerosis",
    ],
    stage: "Phase II",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: ["United States", "Canada", "United Kingdom", "Germany"],
    targets: ["CD19", "FcγRIIb"],
    mechanism: "Bifunctional B-cell inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 890,
  },
  {
    id: "patritumab",
    name: "Patritumab Deruxtecan",
    company: "Merck & Co",
    therapyAreas: ["Oncology"],
    indications: [
      "Non-Small Cell Lung Cancer (EGFR-Mutated)",
      "Breast Cancer",
      "Colorectal Cancer",
    ],
    stage: "Phase II",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "Germany", "Spain", "Netherlands"],
    targets: ["HER3"],
    mechanism: "HER3-directed cytotoxic delivery",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1240,
  },
  {
    id: "efgartigimod",
    name: "Efgartigimod Alfa",
    brand: "Vyvgart Hytrulo",
    company: "argenx",
    therapyAreas: ["Immunology", "Neurology"],
    indications: [
      "Generalised Myasthenia Gravis",
      "Chronic Inflammatory Demyelinating Polyneuropathy",
      "Idiopathic Inflammatory Myopathy",
      "Bullous Pemphigoid",
      "Sjogren's Disease",
    ],
    stage: "Phase III",
    moleculeType: "Antibody Fragment",
    routes: ["Subcutaneous", "Intravenous"],
    geographies: [
      "United States",
      "Japan",
      "Germany",
      "United Kingdom",
      "France",
      "Canada",
      "China",
    ],
    targets: ["FcRn"],
    mechanism: "Neonatal Fc receptor antagonism",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 6180,
  },
  {
    id: "sac-tmt",
    name: "MK-2870",
    company: "Merck & Co",
    therapyAreas: ["Oncology"],
    indications: [
      "Endometrial Cancer",
      "Non-Small Cell Lung Cancer",
      "Breast Cancer",
      "Gastric Cancer",
    ],
    stage: "Phase III",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "China", "Japan", "Germany"],
    targets: ["TROP2"],
    mechanism: "TROP2-directed cytotoxic delivery",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 2960,
  },
  {
    id: "ianalumab",
    name: "Ianalumab",
    company: "Novartis",
    therapyAreas: ["Immunology", "Haematological Disorders"],
    indications: [
      "Sjogren's Disease",
      "Systemic Lupus Erythematosus",
      "Immune Thrombocytopenia",
      "Warm Autoimmune Haemolytic Anaemia",
      "Lupus Nephritis",
      "Rheumatoid Arthritis",
    ],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous", "Intravenous"],
    geographies: [
      "United States",
      "Switzerland",
      "Germany",
      "United Kingdom",
      "France",
      "Italy",
      "Spain",
      "Japan",
      "Canada",
      "Australia",
    ],
    targets: ["BAFF-R"],
    mechanism: "BAFF receptor blockade and B-cell depletion",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1980,
  },
  {
    id: "bnt327",
    name: "BNT327",
    company: "BioNTech",
    therapyAreas: ["Oncology"],
    indications: [
      "Small Cell Lung Cancer",
      "Non-Small Cell Lung Cancer",
      "Triple-Negative Breast Cancer",
    ],
    stage: "Phase II",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "China", "Germany"],
    targets: ["PD-L1", "VEGF-A"],
    mechanism: "PD-L1 x VEGF-A dual blockade",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 2210,
  },
  {
    id: "nipocalimab",
    name: "Nipocalimab",
    company: "Johnson & Johnson",
    therapyAreas: ["Immunology"],
    indications: [
      "Generalised Myasthenia Gravis",
      "Foetal & Neonatal Alloimmune Thrombocytopenia",
      "Sjogren's Disease",
      "Rheumatoid Arthritis",
    ],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Intravenous"],
    geographies: [
      "United States",
      "United Kingdom",
      "Germany",
      "France",
      "Japan",
      "Netherlands",
    ],
    targets: ["FcRn"],
    mechanism: "Neonatal Fc receptor antagonism",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 3040,
  },
  {
    // The record expanded in the opening frame. Its values are short enough
    // that the detail band stays clear of an open column menu sideways.
    id: "rocatinlimab",
    name: "Rocatinlimab",
    company: "Amgen",
    therapyAreas: ["Immunology"],
    indications: ["Atopic Dermatitis", "Prurigo Nodularis", "Asthma"],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: [
      "United States",
      "Japan",
      "Germany",
      "United Kingdom",
      "France",
      "Italy",
      "Canada",
      "Australia",
    ],
    targets: ["OX40"],
    mechanism: "OX40 T-cell depletion",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1670,
  },
  {
    id: "petosemtamab",
    name: "Petosemtamab",
    company: "Merus",
    therapyAreas: ["Oncology"],
    indications: ["Head & Neck Squamous Cell Carcinoma", "Colorectal Cancer"],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Netherlands", "Germany", "Spain"],
    targets: ["EGFR", "LGR5"],
    mechanism: "EGFR x LGR5 dual blockade",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1880,
  },
  {
    id: "telitacicept",
    name: "Telitacicept",
    brand: "Tai'ai",
    company: "RemeGen",
    therapyAreas: ["Immunology"],
    indications: [
      "Systemic Lupus Erythematosus",
      "Generalised Myasthenia Gravis",
      "IgA Nephropathy",
      "Rheumatoid Arthritis",
      "Sjogren's Disease",
    ],
    stage: "Phase III",
    moleculeType: "Fusion Protein",
    routes: ["Subcutaneous"],
    geographies: ["China", "United States", "Germany", "France", "Japan"],
    targets: ["BLyS", "APRIL"],
    mechanism: "Dual BLyS and APRIL inhibition",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 1120,
  },
  {
    id: "volrustomig",
    name: "Volrustomig",
    company: "AstraZeneca",
    therapyAreas: ["Oncology"],
    indications: [
      "Non-Small Cell Lung Cancer",
      "Cervical Cancer",
      "Head & Neck Squamous Cell Carcinoma",
      "Mesothelioma",
    ],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: [
      "United States",
      "United Kingdom",
      "Japan",
      "Germany",
      "France",
      "Spain",
      "Italy",
    ],
    targets: ["PD-1", "CTLA-4"],
    mechanism: "PD-1 x CTLA-4 dual checkpoint blockade",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 2540,
  },
  {
    // The simple case, for contrast: one indication, one geography, one row.
    id: "anselamimab",
    name: "Anselamimab",
    company: "Bristol Myers Squibb",
    therapyAreas: ["Immunology"],
    indications: ["AL Amyloidosis"],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Intravenous"],
    geographies: ["United States"],
    targets: ["Amyloid Light Chain"],
    mechanism: "Amyloid fibril clearance",
    drugType: "Orphan",
    marketingStatus: "Not Marketed",
    npv: 640,
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    brand: "Wegovy",
    company: "Novo Nordisk",
    therapyAreas: ["Metabolic Disorders", "Cardiovascular"],
    indications: [
      "Obesity",
      "Type 2 Diabetes",
      "Heart Failure (HFpEF)",
      "Chronic Kidney Disease",
      "MASH",
    ],
    stage: "Marketed",
    moleculeType: "Peptide",
    routes: ["Subcutaneous", "Oral"],
    geographies: [
      "United States",
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Denmark",
      "Japan",
      "Canada",
      "Brazil",
    ],
    targets: ["GLP-1 Receptor"],
    mechanism: "GLP-1 receptor agonism",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 28400,
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    company: "Eli Lilly",
    therapyAreas: ["Metabolic Disorders"],
    indications: ["Obesity", "Type 2 Diabetes", "Knee Osteoarthritis"],
    stage: "Phase III",
    moleculeType: "Peptide",
    routes: ["Subcutaneous"],
    geographies: ["United States", "United Kingdom", "Germany", "Japan", "Mexico"],
    targets: ["GIP Receptor", "GLP-1 Receptor", "Glucagon Receptor"],
    mechanism: "Triple incretin receptor agonism",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 9600,
  },
  {
    id: "lepodisiran",
    name: "Lepodisiran",
    company: "Eli Lilly",
    therapyAreas: ["Cardiovascular"],
    indications: ["Atherosclerotic Cardiovascular Disease"],
    stage: "Phase III",
    moleculeType: "siRNA",
    routes: ["Subcutaneous"],
    geographies: ["United States", "United Kingdom", "Germany", "Netherlands", "Australia"],
    targets: ["LPA"],
    mechanism: "Lipoprotein(a) synthesis inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 3100,
  },
  {
    id: "zerlasiran",
    name: "Zerlasiran",
    company: "Silence Therapeutics",
    therapyAreas: ["Cardiovascular"],
    indications: ["Atherosclerotic Cardiovascular Disease"],
    stage: "Phase II",
    moleculeType: "siRNA",
    routes: ["Subcutaneous"],
    geographies: ["United States", "United Kingdom"],
    targets: ["LPA"],
    mechanism: "Lipoprotein(a) synthesis inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 720,
  },
  {
    id: "donanemab",
    name: "Donanemab",
    brand: "Kisunla",
    company: "Eli Lilly",
    therapyAreas: ["Neurology"],
    indications: ["Alzheimer's Disease"],
    stage: "Marketed",
    moleculeType: "Monoclonal Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "United Kingdom", "Germany", "China"],
    targets: ["Amyloid Beta"],
    mechanism: "Amyloid plaque clearance",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 5400,
  },
  {
    id: "trontinemab",
    name: "Trontinemab",
    company: "Roche",
    therapyAreas: ["Neurology"],
    indications: ["Alzheimer's Disease"],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Switzerland", "Germany", "United Kingdom", "Spain"],
    targets: ["Amyloid Beta", "Transferrin Receptor"],
    mechanism: "Brain-shuttle amyloid clearance",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 4200,
  },
  {
    id: "tolebrutinib",
    name: "Tolebrutinib",
    company: "Sanofi",
    therapyAreas: ["Neurology"],
    indications: ["Multiple Sclerosis", "Generalised Myasthenia Gravis"],
    stage: "Pre-Registration",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: [
      "United States",
      "France",
      "Germany",
      "United Kingdom",
      "Italy",
      "Canada",
    ],
    targets: ["BTK"],
    mechanism: "Bruton tyrosine kinase inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 3350,
  },
  {
    id: "depemokimab",
    name: "Depemokimab",
    company: "GSK",
    therapyAreas: ["Respiratory"],
    indications: [
      "Severe Asthma",
      "Chronic Rhinosinusitis with Nasal Polyps",
      "Chronic Obstructive Pulmonary Disease",
    ],
    stage: "Approved",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: ["United States", "United Kingdom", "Germany", "France", "Japan"],
    targets: ["Interleukin 5"],
    mechanism: "IL-5 inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 2760,
  },
  {
    id: "dupilumab",
    name: "Dupilumab",
    brand: "Dupixent",
    company: "Sanofi",
    therapyAreas: ["Immunology", "Respiratory", "Dermatology"],
    indications: [
      "Atopic Dermatitis",
      "Severe Asthma",
      "Chronic Obstructive Pulmonary Disease",
      "Chronic Rhinosinusitis with Nasal Polyps",
      "Eosinophilic Oesophagitis",
      "Prurigo Nodularis",
    ],
    stage: "Marketed",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: [
      "United States",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "United Kingdom",
      "Japan",
      "Canada",
      "Australia",
      "Brazil",
    ],
    targets: ["Interleukin 4 Receptor"],
    mechanism: "IL-4Rα blockade",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 41200,
  },
  {
    id: "lebrikizumab",
    name: "Lebrikizumab",
    brand: "Ebglyss",
    company: "Almirall",
    therapyAreas: ["Dermatology"],
    indications: ["Atopic Dermatitis"],
    stage: "Marketed",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: ["Germany", "Spain", "Italy", "United Kingdom", "France"],
    targets: ["Interleukin 13"],
    mechanism: "IL-13 inhibition",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 1450,
  },
  {
    id: "aficamten",
    name: "Aficamten",
    company: "Cytokinetics",
    therapyAreas: ["Cardiovascular"],
    indications: ["Hypertrophic Cardiomyopathy"],
    stage: "Pre-Registration",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "Germany", "United Kingdom", "Japan"],
    targets: ["Cardiac Myosin"],
    mechanism: "Cardiac myosin inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 2880,
  },
  {
    id: "obicetrapib",
    name: "Obicetrapib",
    company: "NewAmsterdam Pharma",
    therapyAreas: ["Cardiovascular"],
    indications: ["Dyslipidaemia", "Atherosclerotic Cardiovascular Disease"],
    stage: "Phase III",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "Netherlands", "United Kingdom", "Germany"],
    targets: ["CETP"],
    mechanism: "Cholesteryl ester transfer protein inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1930,
  },
  {
    id: "gepotidacin",
    name: "Gepotidacin",
    brand: "Blujepa",
    company: "GSK",
    therapyAreas: ["Infectious Disease"],
    indications: ["Uncomplicated Urinary Tract Infection", "Gonorrhoea"],
    stage: "Approved",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "United Kingdom"],
    targets: ["DNA Gyrase", "Topoisomerase IV"],
    mechanism: "Dual bacterial topoisomerase inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 610,
  },
  {
    id: "zoliflodacin",
    name: "Zoliflodacin",
    company: "Innoviva",
    therapyAreas: ["Infectious Disease"],
    indications: ["Gonorrhoea"],
    stage: "Pre-Registration",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "South Africa", "Thailand"],
    targets: ["DNA Gyrase"],
    mechanism: "Bacterial gyrase inhibition",
    drugType: "Orphan",
    marketingStatus: "Not Marketed",
    npv: 180,
  },
  {
    id: "mrna-1283",
    name: "mRNA-1283",
    brand: "mNexspike",
    company: "Moderna",
    therapyAreas: ["Infectious Disease"],
    indications: ["COVID-19"],
    stage: "Approved",
    moleculeType: "Vaccine",
    routes: ["Intramuscular"],
    geographies: ["United States", "Japan", "United Kingdom", "Germany", "Canada"],
    targets: ["SARS-CoV-2 Spike Protein"],
    mechanism: "Spike-directed active immunisation",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 1240,
  },
  {
    id: "sotatercept",
    name: "Sotatercept",
    brand: "Winrevair",
    company: "Merck & Co",
    therapyAreas: ["Cardiovascular"],
    indications: ["Pulmonary Arterial Hypertension"],
    stage: "Marketed",
    moleculeType: "Fusion Protein",
    routes: ["Subcutaneous"],
    geographies: ["United States", "Germany", "United Kingdom", "France", "Japan"],
    targets: ["Activin Receptor Type IIA"],
    mechanism: "Activin signalling inhibition",
    drugType: "Orphan",
    marketingStatus: "Marketed",
    npv: 7800,
  },
  {
    id: "ranibizumab-bs",
    name: "Ranibizumab Biosimilar",
    brand: "Ximluci",
    company: "STADA",
    therapyAreas: ["Ophthalmology"],
    indications: [
      "Neovascular Age-Related Macular Degeneration",
      "Diabetic Macular Oedema",
    ],
    stage: "Marketed",
    moleculeType: "Antibody Fragment",
    routes: ["Intravitreal"],
    geographies: ["Germany", "Spain", "Italy", "Poland", "United Kingdom"],
    targets: ["VEGF-A"],
    mechanism: "VEGF-A inhibition",
    drugType: "Biosimilar",
    marketingStatus: "Marketed",
    npv: 210,
  },
  {
    id: "tarcocimab",
    name: "Tarcocimab Tedromer",
    company: "Kodiak Sciences",
    therapyAreas: ["Ophthalmology"],
    indications: ["Diabetic Macular Oedema", "Retinal Vein Occlusion"],
    stage: "Phase III",
    moleculeType: "Antibody Fragment",
    routes: ["Intravitreal"],
    geographies: ["United States", "Germany"],
    targets: ["VEGF-A"],
    mechanism: "VEGF-A inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 340,
  },
  {
    id: "exa-cel",
    name: "Exagamglogene Autotemcel",
    brand: "Casgevy",
    company: "Vertex Pharmaceuticals",
    therapyAreas: ["Haematological Disorders"],
    indications: ["Sickle Cell Disease", "Transfusion-Dependent Beta Thalassaemia"],
    stage: "Marketed",
    moleculeType: "Cell Therapy",
    routes: ["Intravenous"],
    geographies: ["United States", "United Kingdom", "Saudi Arabia", "Bahrain", "France"],
    targets: ["BCL11A"],
    mechanism: "Ex vivo CRISPR gene editing",
    drugType: "Orphan",
    marketingStatus: "Marketed",
    npv: 3900,
  },
  {
    id: "mitapivat",
    name: "Mitapivat",
    brand: "Pyrukynd",
    company: "Agios Pharmaceuticals",
    therapyAreas: ["Haematological Disorders"],
    indications: [
      "Pyruvate Kinase Deficiency",
      "Transfusion-Dependent Beta Thalassaemia",
      "Sickle Cell Disease",
    ],
    stage: "Marketed",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "Germany", "France", "Italy"],
    targets: ["Pyruvate Kinase"],
    mechanism: "Pyruvate kinase activation",
    drugType: "Orphan",
    marketingStatus: "Marketed",
    npv: 780,
  },
  {
    id: "fitusiran",
    name: "Fitusiran",
    brand: "Qfitlia",
    company: "Sanofi",
    therapyAreas: ["Haematological Disorders"],
    indications: ["Haemophilia A", "Haemophilia B"],
    stage: "Approved",
    moleculeType: "siRNA",
    routes: ["Subcutaneous"],
    geographies: ["United States", "France", "Germany", "Japan"],
    targets: ["Antithrombin III"],
    mechanism: "Antithrombin knockdown",
    drugType: "Orphan",
    marketingStatus: "Not Marketed",
    npv: 1580,
  },
  {
    id: "metformin",
    name: "Metformin Hydrochloride",
    brand: "Glucophage",
    company: "Teva Pharmaceutical Industries",
    therapyAreas: ["Metabolic Disorders"],
    indications: ["Type 2 Diabetes", "Polycystic Ovary Syndrome"],
    stage: "Marketed",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: [
      "United States",
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Poland",
      "India",
    ],
    targets: ["AMPK"],
    mechanism: "AMP-activated protein kinase activation",
    drugType: "Generic",
    marketingStatus: "Marketed",
    npv: 90,
  },
  {
    id: "olaparib",
    name: "Olaparib",
    brand: "Lynparza",
    company: "AstraZeneca",
    therapyAreas: ["Oncology"],
    indications: [
      "Ovarian Cancer",
      "Breast Cancer",
      "Prostate Cancer",
      "Pancreatic Cancer",
    ],
    stage: "Marketed",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: [
      "United States",
      "United Kingdom",
      "Germany",
      "France",
      "Japan",
      "China",
      "Canada",
    ],
    targets: ["PARP1", "PARP2"],
    mechanism: "PARP inhibition",
    drugType: "Branded",
    marketingStatus: "Marketed",
    npv: 12400,
  },
  {
    id: "sibeprenlimab",
    name: "Sibeprenlimab",
    company: "Otsuka Pharmaceutical",
    therapyAreas: ["Immunology"],
    indications: ["IgA Nephropathy"],
    stage: "Pre-Registration",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: ["United States", "Japan"],
    targets: ["APRIL"],
    mechanism: "APRIL inhibition",
    drugType: "Orphan",
    marketingStatus: "Not Marketed",
    npv: 1340,
  },
  {
    id: "bezuclastinib",
    name: "Bezuclastinib",
    company: "Cogent Biosciences",
    therapyAreas: ["Oncology"],
    indications: ["Systemic Mastocytosis", "Gastrointestinal Stromal Tumour"],
    stage: "Phase III",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "Germany", "United Kingdom"],
    targets: ["KIT"],
    mechanism: "KIT D816V inhibition",
    drugType: "Orphan",
    marketingStatus: "Not Marketed",
    npv: 960,
  },
  {
    id: "azd-0901",
    name: "AZD0901",
    company: "AstraZeneca",
    therapyAreas: ["Oncology"],
    indications: ["Gastric Cancer", "Pancreatic Cancer"],
    stage: "Phase I",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "China"],
    targets: ["Claudin 18.2"],
    mechanism: "CLDN18.2-directed cytotoxic delivery",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 480,
  },
  {
    id: "nvl-655",
    name: "NVL-655",
    company: "Nuvalent",
    therapyAreas: ["Oncology"],
    indications: ["Non-Small Cell Lung Cancer"],
    stage: "Phase II",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "United Kingdom", "Spain"],
    targets: ["ALK"],
    mechanism: "Selective ALK inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1140,
  },
  {
    id: "vx-993",
    name: "VX-993",
    company: "Vertex Pharmaceuticals",
    therapyAreas: ["Neurology"],
    indications: ["Acute Pain", "Diabetic Peripheral Neuropathy"],
    stage: "Phase II",
    moleculeType: "Small Molecule",
    routes: ["Oral", "Intravenous"],
    geographies: ["United States"],
    targets: ["NaV1.8"],
    mechanism: "Selective NaV1.8 inhibition",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 1760,
  },
  {
    id: "abbv-101",
    name: "ABBV-101",
    company: "AbbVie",
    therapyAreas: ["Immunology"],
    indications: ["Rheumatoid Arthritis"],
    stage: "Phase I",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States"],
    targets: ["BTK"],
    mechanism: "BTK degradation",
    drugType: "Branded",
    marketingStatus: "Not Marketed",
    npv: 60,
  },
  {
    id: "aducanumab",
    name: "Aducanumab",
    brand: "Aduhelm",
    company: "Biogen",
    therapyAreas: ["Neurology"],
    indications: ["Alzheimer's Disease"],
    stage: "Discontinued",
    moleculeType: "Monoclonal Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan"],
    targets: ["Amyloid Beta"],
    mechanism: "Amyloid plaque clearance",
    drugType: "Branded",
    marketingStatus: "Withdrawn",
    npv: 0,
  },
  {
    id: "rofecoxib",
    name: "Rofecoxib",
    brand: "Vioxx",
    company: "Merck & Co",
    therapyAreas: ["Musculoskeletal Disorders"],
    indications: ["Osteoarthritis", "Rheumatoid Arthritis", "Acute Pain"],
    stage: "Withdrawn",
    moleculeType: "Small Molecule",
    routes: ["Oral"],
    geographies: ["United States", "United Kingdom", "Germany"],
    targets: ["Cyclooxygenase 2"],
    mechanism: "COX-2 inhibition",
    drugType: "Branded",
    marketingStatus: "Withdrawn",
    npv: 0,
  },
]

/* -------------------------------------------------------------------------- */
/* Columns                                                                     */
/* -------------------------------------------------------------------------- */

export type ColumnKind = "select" | "primary" | "text" | "badge" | "pills" | "number"

export interface ColumnDef {
  key: string
  label: string
  /**
   * Lane width, used verbatim in the grid template. The minimums are the
   * no-horizontal-scroll promise: the ten default lanes sum to 866px, so the
   * grid still fits beside the 312px agent panel at a 1190px window and
   * compresses rather than running off the side of the screen.
   */
  width: string
  kind: ColumnKind
  /** Values this column filters and groups on. Empty means neither. */
  values: (row: DrugRecord) => string[]
  /** Sort key. Multi-valued lanes sort on their first value. */
  sortValue: (row: DrugRecord) => string | number
  /** Off for lanes where a value list would be one row per value. */
  filterable: boolean
  /** Off for multi-valued lanes — a row would land in several groups at once. */
  groupable: boolean
  /** Collapsed pill cap for `pills` lanes. */
  pillLimit?: number
  /** Secondary lanes sit back a step so the primary ones read first. */
  muted?: boolean
  /** Order values by the pipeline rather than by count. */
  ordered?: readonly string[]
}

/** Pipeline order, used for stage sorting, the stage menu and the median. */
export const stageOrder = [
  "Discovery",
  "Preclinical",
  "Phase 0",
  "Phase I",
  "Phase II",
  "Phase III",
  "Phase IV",
  "Pre-Registration",
  "Tentative Approval",
  "Approved",
  "Marketed",
  "Suspended",
  "Discontinued",
  "Withdrawn",
] as const

const none = () => [] as string[]

export const columnDefs: ColumnDef[] = [
  {
    key: "select",
    label: "",
    width: "48px",
    kind: "select",
    values: none,
    sortValue: () => "",
    filterable: false,
    groupable: false,
  },
  {
    key: "drugName",
    label: "Drug Name",
    width: "minmax(120px,180px)",
    kind: "primary",
    values: none,
    sortValue: (row) => row.name,
    filterable: false,
    groupable: false,
  },
  {
    key: "brand",
    label: "Brand",
    width: "minmax(52px,96px)",
    kind: "text",
    values: (row) => (row.brand ? [row.brand] : []),
    sortValue: (row) => row.brand ?? "￿",
    filterable: false,
    groupable: false,
  },
  {
    key: "company",
    label: "Company",
    width: "minmax(88px,144px)",
    kind: "text",
    values: (row) => [row.company],
    sortValue: (row) => row.company,
    filterable: true,
    groupable: true,
  },
  {
    key: "therapyArea",
    label: "Therapy Area",
    width: "minmax(84px,116px)",
    kind: "pills",
    values: (row) => row.therapyAreas,
    sortValue: (row) => row.therapyAreas[0] ?? "",
    filterable: true,
    groupable: false,
    pillLimit: 1,
  },
  {
    key: "indication",
    label: "Indication",
    width: "minmax(118px,1.6fr)",
    kind: "pills",
    values: (row) => row.indications,
    sortValue: (row) => row.indications[0] ?? "",
    filterable: true,
    groupable: false,
    pillLimit: 2,
  },
  {
    key: "stage",
    label: "Development Stage",
    width: "minmax(100px,132px)",
    kind: "badge",
    values: (row) => [row.stage],
    sortValue: (row) => stageOrder.indexOf(row.stage as (typeof stageOrder)[number]),
    filterable: true,
    groupable: true,
    ordered: stageOrder,
  },
  {
    key: "moleculeType",
    label: "Molecule Type",
    width: "minmax(82px,144px)",
    kind: "text",
    values: (row) => [row.moleculeType],
    sortValue: (row) => row.moleculeType,
    filterable: true,
    groupable: true,
  },
  {
    key: "route",
    label: "Route of Administration",
    width: "minmax(74px,124px)",
    kind: "pills",
    values: (row) => row.routes,
    sortValue: (row) => row.routes[0] ?? "",
    filterable: true,
    groupable: false,
    pillLimit: 1,
    muted: true,
  },
  {
    key: "geography",
    label: "Drug Geography",
    width: "minmax(100px,1.3fr)",
    kind: "pills",
    values: (row) => row.geographies,
    sortValue: (row) => row.geographies[0] ?? "",
    filterable: true,
    groupable: false,
    pillLimit: 2,
    muted: true,
  },
  /* --- available, not in the grid by default --------------------------- */
  {
    key: "target",
    label: "Target",
    width: "minmax(96px,150px)",
    kind: "pills",
    values: (row) => row.targets,
    sortValue: (row) => row.targets[0] ?? "",
    filterable: true,
    groupable: false,
    pillLimit: 2,
  },
  {
    key: "mechanism",
    label: "Mechanism of Action",
    width: "minmax(110px,180px)",
    kind: "text",
    values: (row) => [row.mechanism],
    sortValue: (row) => row.mechanism,
    filterable: true,
    groupable: false,
    muted: true,
  },
  {
    key: "drugType",
    label: "Drug Type",
    width: "minmax(78px,110px)",
    kind: "text",
    values: (row) => [row.drugType],
    sortValue: (row) => row.drugType,
    filterable: true,
    groupable: true,
  },
  {
    key: "marketingStatus",
    label: "Marketing Status",
    width: "minmax(90px,124px)",
    kind: "text",
    values: (row) => [row.marketingStatus],
    sortValue: (row) => row.marketingStatus,
    filterable: true,
    groupable: true,
  },
  {
    key: "npv",
    label: "NPV (US$m)",
    width: "minmax(72px,100px)",
    kind: "number",
    values: none,
    sortValue: (row) => row.npv,
    filterable: false,
    groupable: false,
  },
]

export const columnByKey: Record<string, ColumnDef> = Object.fromEntries(
  columnDefs.map((column) => [column.key, column]),
)

/** The lanes the grid opens with, in order. */
export const defaultColumnOrder = [
  "select",
  "drugName",
  "brand",
  "company",
  "therapyArea",
  "indication",
  "stage",
  "moleculeType",
  "route",
  "geography",
]

/**
 * Attributes the live product carries that this sample has no values for. They
 * are listed in the column manager and disabled, rather than quietly omitted —
 * a reviewer should be able to see the gap between what the product holds and
 * what this prototype can show.
 */
export const unpopulatedAttributes = [
  "ATC Classification",
  "Mono/Combination Drug",
  "Drug Descriptor",
  "Gene Therapy Vector",
  "Application Type",
  "CAS Number",
  "Originator",
  "Licensee",
  "Patent Expiry",
  "Trial Count",
  "Highest Development Status",
  "Regulatory Designation",
  "Drug Class",
  "Delivery Technology",
  "Formulation",
  "Dosage Form",
  "Programme Status",
  "First Launch Date",
  "Peak Sales Forecast",
  "Deal Count",
  "Manufacturer",
  "Country of Origin",
  "Trial Count by Phase",
]

/* -------------------------------------------------------------------------- */
/* Filtering, sorting, grouping                                                */
/* -------------------------------------------------------------------------- */

/** Selected values per column. `or` inside a column, `and` between columns. */
export type FilterState = Record<string, string[]>

export interface SortState {
  columnKey: string
  direction: "asc" | "desc"
}

function matchesColumn(row: DrugRecord, columnKey: string, selected: string[]) {
  if (selected.length === 0) return true
  const column = columnByKey[columnKey]
  if (!column) return true
  const values = column.values(row)
  return selected.some((value) => values.includes(value))
}

/** Rows matching every applied filter. This is the whole filter engine. */
export function filterRows(all: DrugRecord[], filters: FilterState) {
  const entries = Object.entries(filters).filter(([, values]) => values.length > 0)
  if (entries.length === 0) return all
  return all.filter((row) => entries.every(([key, values]) => matchesColumn(row, key, values)))
}

/**
 * Rows in scope for one column's menu: everything except that column's own
 * filter. So the counts beside each value say what you would get if you ticked
 * one more box, rather than restating what you already ticked.
 */
export function scopeFor(all: DrugRecord[], filters: FilterState, columnKey: string) {
  const rest: FilterState = { ...filters }
  delete rest[columnKey]
  return filterRows(all, rest)
}

export function sortRows(list: DrugRecord[], sort: SortState | null) {
  if (!sort) return list
  const column = columnByKey[sort.columnKey]
  if (!column) return list
  const factor = sort.direction === "asc" ? 1 : -1
  return [...list].sort((a, b) => {
    const left = column.sortValue(a)
    const right = column.sortValue(b)
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor
    return String(left).localeCompare(String(right)) * factor
  })
}

export interface RowGroup {
  key: string
  label: string
  rows: DrugRecord[]
}

export function groupRows(list: DrugRecord[], groupKey: string | null): RowGroup[] {
  if (!groupKey) return [{ key: "__all", label: "", rows: list }]
  const column = columnByKey[groupKey]
  if (!column) return [{ key: "__all", label: "", rows: list }]
  const buckets = new Map<string, DrugRecord[]>()
  for (const row of list) {
    const label = column.values(row)[0] ?? "—"
    const bucket = buckets.get(label)
    if (bucket) bucket.push(row)
    else buckets.set(label, [row])
  }
  const ordered = [...buckets.entries()]
  ordered.sort((a, b) => {
    if (column.ordered) {
      return (
        column.ordered.indexOf(a[0] as never) - column.ordered.indexOf(b[0] as never)
      )
    }
    return a[0].localeCompare(b[0])
  })
  return ordered.map(([label, groupedRows]) => ({ key: label, label, rows: groupedRows }))
}

/* -------------------------------------------------------------------------- */
/* Column menu values                                                          */
/* -------------------------------------------------------------------------- */

export interface ColumnValue {
  label: string
  /** Rows carrying this value, inside the scope of every other column's filter. */
  count: number
  checked: boolean
}

/**
 * Every distinct value a column carries anywhere in the sample, counted inside
 * the current scope. Values that fall to zero stay in the list rather than
 * disappearing — a menu that silently drops options is a menu you cannot trust.
 */
export function columnValues(
  all: DrugRecord[],
  filters: FilterState,
  columnKey: string,
): ColumnValue[] {
  const column = columnByKey[columnKey]
  if (!column || !column.filterable) return []
  const scope = scopeFor(all, filters, columnKey)
  const counts = new Map<string, number>()
  for (const row of all) for (const value of column.values(row)) counts.set(value, 0)
  for (const row of scope) {
    for (const value of new Set(column.values(row))) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  const selected = filters[columnKey] ?? []
  const list = [...counts.entries()].map(([label, count]) => ({
    label,
    count,
    checked: selected.includes(label),
  }))
  if (column.ordered) {
    const order = column.ordered
    list.sort((a, b) => order.indexOf(a.label as never) - order.indexOf(b.label as never))
  } else {
    list.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }
  return list
}

/* -------------------------------------------------------------------------- */
/* Aggregates                                                                  */
/* -------------------------------------------------------------------------- */

export type AggregateKey =
  | "companies"
  | "indications"
  | "geographies"
  | "medianStage"
  | "meanNpv"
  | "totalNpv"

export const aggregateLabels: Record<AggregateKey, string> = {
  companies: "Companies",
  indications: "Indications",
  geographies: "Geographies",
  medianStage: "Median stage",
  meanNpv: "Mean NPV",
  totalNpv: "Total NPV",
}

export const defaultAggregates: AggregateKey[] = [
  "companies",
  "indications",
  "geographies",
  "medianStage",
]

function distinct(list: DrugRecord[], read: (row: DrugRecord) => string[]) {
  const set = new Set<string>()
  for (const row of list) for (const value of read(row)) set.add(value)
  return set.size
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString()}m`
}

/** Every footer figure, computed from the rows currently on screen. */
export function aggregateValue(key: AggregateKey, list: DrugRecord[]): string {
  if (list.length === 0) return "—"
  switch (key) {
    case "companies":
      return String(distinct(list, (row) => [row.company]))
    case "indications":
      return String(distinct(list, (row) => row.indications))
    case "geographies":
      return String(distinct(list, (row) => row.geographies))
    case "medianStage": {
      const indices = list
        .map((row) => stageOrder.indexOf(row.stage as (typeof stageOrder)[number]))
        .sort((a, b) => a - b)
      return stageOrder[indices[Math.floor((indices.length - 1) / 2)]] ?? "—"
    }
    case "meanNpv":
      return money(list.reduce((total, row) => total + row.npv, 0) / list.length)
    case "totalNpv":
      return money(list.reduce((total, row) => total + row.npv, 0))
  }
}

/* -------------------------------------------------------------------------- */
/* Opening state                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The grid opens mid-task rather than empty: two therapy areas, two routes and
 * two stages already applied, so a reviewer lands on a working query rather
 * than a cold start.
 */
export const initialFilters: FilterState = {
  therapyArea: ["Oncology", "Immunology"],
  route: ["Intravenous", "Subcutaneous"],
  stage: ["Phase II", "Phase III"],
}

export const initialSort: SortState = { columnKey: "stage", direction: "asc" }

/** European geographies present in the sample, for the agent's "Europe" request. */
export const europeanGeographies = [
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Denmark",
  "Poland",
]
