import { store } from './store.js';

export interface SymptomDefinition {
  id: string;
  category: 'Udder & Milk' | 'Mobility & Legs' | 'Digestion & Appetite' | 'Respiratory & Head' | 'General & Vitals';
  name: string;
  description: string;
  severityWeight: number; // 1 to 5
}

export interface DiseaseMatch {
  diseaseName: string;
  scientificName: string;
  confidenceScore: number; // 0 to 100
  urgency: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
  matchedSymptoms: string[];
  primaryCause: string;
  firstAidProtocols: string[];
  veterinaryInterventions: string[];
  isolationRequired: boolean;
  dairyMilkWithdrawalDays: number;
}

export interface DiagnosticResult {
  cattleId?: string;
  cattleTag?: string;
  cattleName?: string;
  cattleBreed?: string;
  diagnosedAt: string;
  primaryDiagnosis: DiseaseMatch;
  differentialDiagnoses: DiseaseMatch[];
  overallUrgency: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
  immediateActions: string[];
  safetyDisclaimer: string;
}

export const SYMPTOMS_LIST: SymptomDefinition[] = [
  // Udder & Milk
  { id: 'udder_swelling', category: 'Udder & Milk', name: 'Swollen / Hard Udder', description: 'One or more quarters warm, painful or visibly enlarged', severityWeight: 4 },
  { id: 'milk_clots', category: 'Udder & Milk', name: 'Clots, Flakes, or Watery Milk', description: 'Abnormal milk consistency or discoloration during stripping', severityWeight: 4 },
  { id: 'sudden_yield_drop', category: 'Udder & Milk', name: 'Sudden Drop in Milk Yield', description: 'Unexplained >30% decline in daily harvest', severityWeight: 3 },
  
  // Mobility & Legs
  { id: 'lameness', category: 'Mobility & Legs', name: 'Lameness / Reluctance to Walk', description: 'Uneven gait, favoring one foot, or difficulty rising', severityWeight: 3 },
  { id: 'hoof_lesions', category: 'Mobility & Legs', name: 'Blisters / Lesions on Hooves or Coronet', description: 'Sores or redness between claws or around coronet band', severityWeight: 5 },
  { id: 'downer_cow', category: 'Mobility & Legs', name: 'Unable to Stand (Downer Cow)', description: 'Animal recumbent, sternal or lateral paralysis', severityWeight: 5 },

  // Digestion & Appetite
  { id: 'left_flank_bloat', category: 'Digestion & Appetite', name: 'Distended Left Flank (Bloat)', description: 'Taut, balloon-like swelling on the left abdomen', severityWeight: 5 },
  { id: 'loss_of_appetite', category: 'Digestion & Appetite', name: 'Loss of Appetite / Off Feed', description: 'Refusing concentrate or green fodder', severityWeight: 3 },
  { id: 'no_rumination', category: 'Digestion & Appetite', name: 'Absence of Rumination (No Chewing Cud)', description: 'Lack of normal rhythmic jaw motion and regurgitation', severityWeight: 3 },
  { id: 'diarrhea', category: 'Digestion & Appetite', name: 'Watery / Foul Smelling Diarrhea', description: 'Profuse loose stool with or without blood specs', severityWeight: 3 },

  // Respiratory & Head
  { id: 'rapid_breathing', category: 'Respiratory & Head', name: 'Rapid / Labored Breathing', description: 'Flared nostrils, heavy abdominal movement, grunting', severityWeight: 4 },
  { id: 'nasal_discharge', category: 'Respiratory & Head', name: 'Mucopurulent Nasal Discharge', description: 'Thick cloudy discharge from nostrils', severityWeight: 3 },
  { id: 'mouth_blisters', category: 'Respiratory & Head', name: 'Blisters on Tongue / Excessive Frothing', description: 'Oral ulcerations with stringy saliva drooling', severityWeight: 5 },
  { id: 'coughing', category: 'Respiratory & Head', name: 'Persistent Coughing', description: 'Dry or hacking cough aggravated by movement', severityWeight: 2 },

  // General & Vitals
  { id: 'high_fever', category: 'General & Vitals', name: 'High Fever (>39.5°C / 103°F)', description: 'Elevated rectal temperature with dry muzzle', severityWeight: 4 },
  { id: 'cold_ears_extremities', category: 'General & Vitals', name: 'Cold Ears & Extremities', description: 'Subnormal body temperature, ears cold to touch', severityWeight: 4 },
  { id: 'nodular_skin_lumps', category: 'General & Vitals', name: 'Nodular Skin Lumps / Papules', description: 'Firm, round nodules covering body and neck', severityWeight: 4 },
  { id: 'depression_lethargy', category: 'General & Vitals', name: 'Dullness, Depression & Drooping Ears', description: 'Unresponsive to surroundings, isolated from herd', severityWeight: 2 },
];

interface DiseaseTemplate {
  name: string;
  scientificName: string;
  keySymptomIds: string[];
  urgency: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW';
  primaryCause: string;
  firstAidProtocols: string[];
  veterinaryInterventions: string[];
  isolationRequired: boolean;
  dairyMilkWithdrawalDays: number;
}

const DISEASE_TEMPLATES: DiseaseTemplate[] = [
  {
    name: 'Bovine Mastitis (Clinical / Acute)',
    scientificName: 'Infectious Bovine Mastitis (Staphylococcus / Streptococcus / Coliform)',
    keySymptomIds: ['udder_swelling', 'milk_clots', 'sudden_yield_drop', 'high_fever'],
    urgency: 'HIGH',
    primaryCause: 'Bacterial infection of mammary gland tissues via teat canal.',
    firstAidProtocols: [
      'Immediately strip affected quarter frequently (every 2-3 hours) into a discard cup.',
      'Apply cold compresses or soothing ice packs if udder is severely inflamed and hot.',
      'Separate milk from bulk tank — DO NOT mix with commercial collection.',
      'Ensure dry, sanitized bedding and post-milking teat disinfectant dip.'
    ],
    veterinaryInterventions: [
      'Intramammary antibiotic infusion following aseptic teat scrub.',
      'Systemic anti-inflammatory and pain management (e.g., Flunixin Meglumine or Meloxicam).',
      'Milk sample culture and antibiotic sensitivity testing.'
    ],
    isolationRequired: false,
    dairyMilkWithdrawalDays: 4,
  },
  {
    name: 'Foot and Mouth Disease (FMD)',
    scientificName: 'Aphthovirus (Picornaviridae)',
    keySymptomIds: ['mouth_blisters', 'hoof_lesions', 'high_fever', 'lameness', 'loss_of_appetite'],
    urgency: 'EMERGENCY',
    primaryCause: 'Highly contagious viral infection affecting cloven-hoofed livestock.',
    firstAidProtocols: [
      'STRICT QUARANTINE: Isolate the animal immediately in a separate shed away from the main herd.',
      'Disinfect shed entrance with 4% Sodium Carbonate (Washing Soda) or 1% Potassium Permanganate.',
      'Wash oral mouth lesions gently with mild 1% Potassium Permanganate or boric acid lotion.',
      'Apply protective wound antiseptic / zinc oxide paste to interdigital hoof sores to prevent maggot infestation.',
      'Provide soft, easily digestible gruel (rice water with jaggery and crushed mineral salt).'
    ],
    veterinaryInterventions: [
      'Immediate mandatory notification to local Animal Husbandry Veterinary Authority.',
      'Supportive antibiotics to prevent secondary bacterial infection on mucosal erosions.',
      'Ring vaccination of surrounding cattle herd within a 5 km radius.'
    ],
    isolationRequired: true,
    dairyMilkWithdrawalDays: 14,
  },
  {
    name: 'Acute Rumen Tympany (Bloat)',
    scientificName: 'Acute Ruminal Frothy Tympany',
    keySymptomIds: ['left_flank_bloat', 'rapid_breathing', 'no_rumination', 'loss_of_appetite'],
    urgency: 'EMERGENCY',
    primaryCause: 'Excessive accumulation of fermentation gas trapped as foam in the rumen.',
    firstAidProtocols: [
      'Keep cattle in standing position with front feet elevated on an incline to facilitate eructation.',
      'Place a wooden bit or rope in the mouth across the teeth to encourage salivation and chewing.',
      'Drench immediately with 250-500 ml edible vegetable oil (peanut or mustard oil) or Simethicone / Bloatosil.',
      'DO NOT force down water while breathing is distressed.'
    ],
    veterinaryInterventions: [
      'Stomach tube passage to relieve free gas.',
      'Emergency trocharization of the left paralumbar fossa if animal is in imminent asphyxiation collapse.',
      'Ruminal buffer and probiotic administration.'
    ],
    isolationRequired: false,
    dairyMilkWithdrawalDays: 0,
  },
  {
    name: 'Milk Fever (Post-Partum Hypocalcemia)',
    scientificName: 'Parturient Paresis',
    keySymptomIds: ['downer_cow', 'cold_ears_extremities', 'depression_lethargy', 'no_rumination'],
    urgency: 'EMERGENCY',
    primaryCause: 'Acute blood calcium deficiency occurring within 48-72 hours of calving due to sudden colostrum demand.',
    firstAidProtocols: [
      'Prop animal up into sternal recumbency using straw bales; do not let animal lie flat on its side.',
      'Massage legs and cover with warm gunny bags to maintain core body temperature.',
      'DO NOT attempt oral drenching while recumbent or comatose to prevent fatal aspiration pneumonia.'
    ],
    veterinaryInterventions: [
      'Emergency slow intravenous (IV) infusion of Calcium Borogluconate 25-40% warmed to body temperature.',
      'Simultaneous cardiac auscultation during calcium infusion to monitor heart rhythm.',
      'Follow-up oral calcium gel once swallowing reflex is fully recovered.'
    ],
    isolationRequired: false,
    dairyMilkWithdrawalDays: 2,
  },
  {
    name: 'Bovine Respiratory Disease (Pneumonia / Shipping Fever)',
    scientificName: 'Bovine Respiratory Disease Complex (BRDC)',
    keySymptomIds: ['rapid_breathing', 'coughing', 'nasal_discharge', 'high_fever', 'depression_lethargy'],
    urgency: 'HIGH',
    primaryCause: 'Viral-bacterial synergy exacerbated by weather stress, damp sheds, or poor ventilation.',
    firstAidProtocols: [
      'Move animal to a well-ventilated, dry, draft-free pen with clean dry bedding.',
      'Ensure access to clean lukewarm drinking water and palatable green grass.',
      'Wipe nasal discharges with clean antiseptic cloth.'
    ],
    veterinaryInterventions: [
      'Broad-spectrum antimicrobial therapy (e.g., Ceftiofur, Florfenicol, or Enrofloxacin).',
      'Non-steroidal anti-inflammatory drugs (NSAIDs) for rapid pulmonary relief.',
      'Bronchodilator and vitamin supportive therapy.'
    ],
    isolationRequired: true,
    dairyMilkWithdrawalDays: 5,
  },
  {
    name: 'Lumpy Skin Disease (LSD)',
    scientificName: 'Capripoxvirus (Poxviridae)',
    keySymptomIds: ['nodular_skin_lumps', 'high_fever', 'nasal_discharge', 'udder_swelling', 'lameness'],
    urgency: 'HIGH',
    primaryCause: 'Vector-borne viral infection transmitted by biting flies, mosquitoes, and ticks.',
    firstAidProtocols: [
      'Isolate affected animal in insect-proof screened quarters.',
      'Spray fly repellents and neem oil emulsion around the shed perimeter.',
      'Clean ruptured skin nodules with antiseptic Betadine (Povidone-iodine) solution.',
      'Administer oral hydration fluids and liver tonic supplements.'
    ],
    veterinaryInterventions: [
      'Supportive antibiotic therapy to combat secondary bacterial skin infections.',
      'Antipyretics and antihistamines.',
      'Heterologous Goat Pox Vaccine prophylactic vaccination for remaining cattle.'
    ],
    isolationRequired: true,
    dairyMilkWithdrawalDays: 7,
  },
];

export class CattleDiseaseDiagnosticService {
  /**
   * Diagnostic inference engine
   */
  public diagnose(params: {
    cattleId?: string;
    symptoms: string[];
    vitals?: { bodyTempC?: number; heartRateBpm?: number };
  }): DiagnosticResult {
    const selectedSymptomIds = new Set(params.symptoms || []);

    // Include vital-derived symptoms automatically
    if (params.vitals?.bodyTempC && params.vitals.bodyTempC > 39.5) {
      selectedSymptomIds.add('high_fever');
    }
    if (params.vitals?.bodyTempC && params.vitals.bodyTempC < 37.5) {
      selectedSymptomIds.add('cold_ears_extremities');
    }

    let cattleRecord: any = null;
    if (params.cattleId) {
      cattleRecord = store.cattle?.find(
        (c: any) => c.id === params.cattleId || c.tag_number === params.cattleId || c.tag_id === params.cattleId
      );
    }

    const matches: DiseaseMatch[] = DISEASE_TEMPLATES.map((tmpl) => {
      const matchedSymptoms: string[] = [];
      let matchScore = 0;

      tmpl.keySymptomIds.forEach((symId) => {
        if (selectedSymptomIds.has(symId)) {
          matchedSymptoms.push(symId);
          matchScore += 1;
        }
      });

      // Calculate confidence percentage
      const totalKey = tmpl.keySymptomIds.length;
      let confidence = Math.round((matchScore / Math.max(totalKey, 1)) * 100);

      // Penalize if no symptoms matched
      if (matchedSymptoms.length === 0) confidence = 0;

      // Bonus if critical key symptoms matched
      if (tmpl.name.includes('Mastitis') && selectedSymptomIds.has('udder_swelling') && selectedSymptomIds.has('milk_clots')) {
        confidence = Math.min(confidence + 15, 96);
      }
      if (tmpl.name.includes('Foot and Mouth') && selectedSymptomIds.has('mouth_blisters') && selectedSymptomIds.has('hoof_lesions')) {
        confidence = Math.min(confidence + 20, 98);
      }
      if (tmpl.name.includes('Milk Fever') && selectedSymptomIds.has('downer_cow')) {
        confidence = Math.min(confidence + 25, 95);
      }
      if (tmpl.name.includes('Bloat') && selectedSymptomIds.has('left_flank_bloat')) {
        confidence = Math.min(confidence + 25, 96);
      }

      return {
        diseaseName: tmpl.name,
        scientificName: tmpl.scientificName,
        confidenceScore: confidence,
        urgency: tmpl.urgency,
        matchedSymptoms: matchedSymptoms.map((id) => {
          const symDef = SYMPTOMS_LIST.find((s) => s.id === id);
          return symDef ? symDef.name : id;
        }),
        primaryCause: tmpl.primaryCause,
        firstAidProtocols: tmpl.firstAidProtocols,
        veterinaryInterventions: tmpl.veterinaryInterventions,
        isolationRequired: tmpl.isolationRequired,
        dairyMilkWithdrawalDays: tmpl.dairyMilkWithdrawalDays,
      };
    });

    // Sort by confidence descending
    matches.sort((a, b) => b.confidenceScore - a.confidenceScore);

    const primaryDiagnosis = matches[0] && matches[0].confidenceScore > 0
      ? matches[0]
      : {
          diseaseName: 'Non-Specific Malaise / Early Clinical Observation',
          scientificName: 'Undetermined Etiology',
          confidenceScore: 35,
          urgency: 'MODERATE' as const,
          matchedSymptoms: Array.from(selectedSymptomIds).map((id) => {
            const symDef = SYMPTOMS_LIST.find((s) => s.id === id);
            return symDef ? symDef.name : id;
          }),
          primaryCause: 'Symptoms indicate general physiological distress without a single definitive pathogen cluster.',
          firstAidProtocols: [
            'Record vital signs (temperature, respiration rate, and rumination cycles) every 4 hours.',
            'Provide calm, sheltered rest quarters with clean fresh drinking water.',
            'Monitor feed intake and check for sudden changes in manure consistency.'
          ],
          veterinaryInterventions: [
            'Schedule a professional veterinary physical examination if symptoms do not improve within 24 hours.'
          ],
          isolationRequired: false,
          dairyMilkWithdrawalDays: 0,
        };

    const differentialDiagnoses = matches.filter(
      (m) => m.diseaseName !== primaryDiagnosis.diseaseName && m.confidenceScore > 20
    ).slice(0, 3);

    // Determine overall triage urgency
    let overallUrgency: 'EMERGENCY' | 'HIGH' | 'MODERATE' | 'LOW' = primaryDiagnosis.urgency;
    if (selectedSymptomIds.has('left_flank_bloat') || selectedSymptomIds.has('downer_cow') || selectedSymptomIds.has('mouth_blisters')) {
      overallUrgency = 'EMERGENCY';
    }

    const immediateActions: string[] = [
      ...primaryDiagnosis.firstAidProtocols.slice(0, 3)
    ];

    if (primaryDiagnosis.isolationRequired) {
      immediateActions.unshift('🚨 IMMEDIATE ACTION: Quarantining animal in an isolated shed is strictly required.');
    }

    return {
      cattleId: cattleRecord?.id || params.cattleId,
      cattleTag: cattleRecord?.tag_number || cattleRecord?.tag_id || cattleRecord?.digital_identity_id,
      cattleName: cattleRecord?.name || 'Unspecified Cattle',
      cattleBreed: cattleRecord?.breed || 'Indian Native',
      diagnosedAt: new Date().toISOString(),
      primaryDiagnosis,
      differentialDiagnoses,
      overallUrgency,
      immediateActions,
      safetyDisclaimer: 'FarmEase AI Diagnostic Wizard is a clinical decision-support tool designed for agricultural triage. It does NOT replace authorized veterinary licensure. Contact a licensed veterinarian immediately for emergency treatment.'
    };
  }
}

export const cattleDiseaseDiagnosticService = new CattleDiseaseDiagnosticService();
