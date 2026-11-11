// Disease Master Data for Surveillance
export const MOCK_DISEASES = [
  {
    id: 'dengue',
    name: 'Dengue Fever',
    category: 'Vector-Borne',
    vector: 'Aedes Aegypti',
    color: '#ef4444', // Red
    thresholdDaily: 15,
    severityWeights: { mild: 0.5, moderate: 0.35, severe: 0.15 }
  },
  {
    id: 'malaria',
    name: 'Malaria',
    category: 'Vector-Borne',
    vector: 'Anopheles Mosquito',
    color: '#f97316', // Orange
    thresholdDaily: 10,
    severityWeights: { mild: 0.6, moderate: 0.3, severe: 0.1 }
  },
  {
    id: 'diarrhea',
    name: 'Acute Diarrhea (ADD)',
    category: 'Water-Borne',
    vector: 'Contaminated Water / Food',
    color: '#0d9488', // Teal
    thresholdDaily: 25,
    severityWeights: { mild: 0.7, moderate: 0.25, severe: 0.05 }
  },
  {
    id: 'typhoid',
    name: 'Typhoid (Enteric Fever)',
    category: 'Water-Borne',
    vector: 'Salmonella Typhi',
    color: '#0284c7', // Sky blue
    thresholdDaily: 12,
    severityWeights: { mild: 0.55, moderate: 0.35, severe: 0.1 }
  },
  {
    id: 'viral_fever',
    name: 'Viral Pyrexia (FUO)',
    category: 'General Infection',
    vector: 'Seasonal Viral Transmission',
    color: '#6366f1', // Indigo
    thresholdDaily: 35,
    severityWeights: { mild: 0.8, moderate: 0.18, severe: 0.02 }
  },
  {
    id: 'respiratory',
    name: 'Acute Respiratory Inf. (ARI)',
    category: 'Airborne',
    vector: 'Droplet Transmission',
    color: '#8b5cf6', // Violet
    thresholdDaily: 30,
    severityWeights: { mild: 0.75, moderate: 0.2, severe: 0.05 }
  },
  {
    id: 'cholera',
    name: 'Suspected Cholera',
    category: 'Water-Borne',
    vector: 'Vibrio Cholerae',
    color: '#dc2626', // Deep Red Alert
    thresholdDaily: 2,
    severityWeights: { mild: 0.2, moderate: 0.4, severe: 0.4 }
  },
  {
    id: 'hepatitis',
    name: 'Viral Hepatitis',
    category: 'Water-Borne',
    vector: 'HAV / HEV Water Contamination',
    color: '#eab308', // Yellow
    thresholdDaily: 5,
    severityWeights: { mild: 0.5, moderate: 0.4, severe: 0.1 }
  }
];

