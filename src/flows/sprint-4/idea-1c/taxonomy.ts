/**
 * Deeper value trees, taken from the incumbent's own search.
 *
 * The Cardiovascular branch of Therapy Area / Indication is GlobalData's tree
 * as the live Drugs search lists it (October 2026), in its order, trimmed to a
 * sample: a node whose children were not captured is a leaf here. It runs five
 * levels below the therapy area at its deepest (Cardiovascular › Cardiovascular
 * Disease › Aneurysm › Aortic Aneurysm › Abdominal Aortic Aneurysm), which is
 * seven columns once Drugs and the attribute are in front of it.
 *
 * Three nodes are authored rather than captured, so the sample's existing
 * Cardiovascular indications have somewhere to sit: Heart Failure (with
 * Chronic Heart Failure) under Cardiovascular Disease, and Dyslipidaemia (with
 * Hypercholesterolaemia and Mixed Dyslipidaemia) under Cardiovascular Risk
 * Factors. Every other therapy area keeps its single level of indications.
 */
export interface TreeNode {
  label: string
  children?: readonly TreeNode[]
}

const leaf = (...labels: string[]): TreeNode[] => labels.map((label) => ({ label }))
const node = (label: string, children: readonly TreeNode[]): TreeNode => ({ label, children })

export const cardiovascularTree: readonly TreeNode[] = [
  ...leaf("Arteriovenous Fistula"),
  node("Artery Stenosis", leaf("Intracranial Artery Stenosis", "Renal Artery Stenosis")),
  node(
    "Cardiovascular Calcification",
    leaf("Arterial Calcification", "Cardiac Valve Calcification", "Vascular Calcification"),
  ),
  node("Cardiovascular Disease", [
    ...leaf("Acrocyanosis", "Acute Rheumatic Heart Disease"),
    node("Aneurysm", [
      node("Aortic Aneurysm", leaf("Abdominal Aortic Aneurysm")),
      ...leaf("Cerebral Aneurysms"),
    ]),
    node("Angina (Angina Pectoris)", [
      ...leaf(
        "Microvascular Angina",
        "Prinzmetal Angina (Variant Angina/Vasospastic Angina)",
        "Refractory Angina",
      ),
      node("Stable Angina", leaf("Chronic Stable Angina")),
      ...leaf("Unstable Angina"),
    ]),
    node(
      "Arrhythmias",
      leaf("Premature Ventricular Complexes", "Sick Sinus Syndrome", "Ventricular Arrhythmia"),
    ),
    ...leaf("Arterial Stiffness"),
    node("Arteriosclerosis", leaf("Atherosclerosis")),
    ...leaf(
      "Atrial Fibrillation",
      "Atrial Flutter",
      "Calciphylaxis",
      "Capillary Leak Syndrome (Systemic Capillary Leak Syndrome/Clarkson's Disease)",
      "Cardiac Arrest",
      "Cardiomegaly",
    ),
    node("Cardiomyopathy", leaf("Chagas Cardiomyopathy", "Endomyocardial (Eosinophilic) Disease")),
    node("Heart Failure", leaf("Chronic Heart Failure")),
  ]),
  node("Cardiovascular Inflammation", [
    ...leaf("Endocarditis"),
    node("Vasculitis", leaf("Arteritis", "Phlebitis")),
  ]),
  node("Cardiovascular Risk Factors", [
    node("Dyslipidaemia", leaf("Hypercholesterolaemia", "Mixed Dyslipidaemia")),
    node("Hypertension", leaf("Portal Hypertension", "Pulmonary Hypertension")),
  ]),
  ...leaf(
    "Congenital Malformations of Heart",
    "Edema",
    "Heart Valve Disease",
    "Hepatic Veno-Occlusive Disease",
    "Hypoxemia",
    "Myocardial Fibrosis",
    "Pericardial Disease",
    "Raynauds Disease",
    "Reperfusion Injury",
    "Shock",
    "Telangiectasis",
    "Unspecified Cardiovascular Disorders",
  ),
]
