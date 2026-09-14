import { StatementItem } from '../types.js';

export interface SampleNarrative {
  id: string;
  title: string;
  language: 'Pidgin–English' | 'Yoruba–English' | 'English';
  transcript: string;
  description: string;
  expectedEntities: string[];
}

export const SAMPLE_NARRATIVES: SampleNarrative[] = [
  {
    id: 'sample-1',
    title: 'Alaba Market Commercial Shop Burglary',
    language: 'Pidgin–English',
    description: 'Shop break-in with stolen mobile phones and cash in office drawer',
    transcript: 'Na my neighbor break into my shop for Alaba market last night, im carry my two phone and small money wey dey inside drawer.',
    expectedEntities: ['Alaba market', 'neighbor', 'two phone', 'drawer'],
  },
  {
    id: 'sample-2',
    title: 'Domestic Assault & Battery Report',
    language: 'Yoruba–English',
    description: 'Urgent domestic violence testimony requiring protective order',
    transcript: 'Mo fẹ́ jábọ̀ pé ọkọ mi ti kọlù mí ní alẹ́ ana, ó sì ti pa mí lára.',
    expectedEntities: ['ọkọ mi', 'alẹ́ ana', 'kọlù'],
  },
  {
    id: 'sample-3',
    title: 'Commercial Debt & Fraudulent Conversion',
    language: 'Pidgin–English',
    description: 'Refusal to repay 45,000 Naira collected by corner shop vendor',
    transcript: 'The man wey dey sell for corner shop, e collect my money since last month, e no wan pay back — na 45,000 naira.',
    expectedEntities: ['corner shop', '45,000 naira', 'last month'],
  },
  {
    id: 'sample-4',
    title: 'Ojuelegba Junction Hit-and-Run Traffic Collision',
    language: 'Pidgin–English',
    description: 'Pedestrian struck by reckless commercial motorcycle at junction',
    transcript: 'I dey waka come from work when one motorcycle just hit my leg for Ojuelegba junction, na around 7pm yesterday.',
    expectedEntities: ['Ojuelegba junction', 'motorcycle', '7pm yesterday'],
  },
  {
    id: 'sample-5',
    title: 'Motor Vehicle Theft (Plate LND-234-XY)',
    language: 'Yoruba–English',
    description: 'Thursday night car theft with specific Lagos State registration plate',
    transcript: 'Ẹnìkan gbé ọkọ̀ ayọ́kẹ́lẹ́ mi ní alẹ́ ọjọ́ Ẹtì, plate number rẹ̀ jẹ́ LND-234-XY.',
    expectedEntities: ['LND-234-XY', 'alẹ́ ọjọ́ Ẹtì', 'ọkọ̀ ayọ́kẹ́lẹ́'],
  },
  {
    id: 'sample-6',
    title: 'Unlawful Eviction & Changed Locks',
    language: 'English',
    description: 'Landlord locked out tenant without legal notice or court order',
    transcript: "I'd like to report that my landlord changed the locks on my apartment while I was away, without giving me any notice.",
    expectedEntities: ['landlord', 'locks', 'apartment', 'notice'],
  },
];

export const INITIAL_STATEMENTS: StatementItem[] = [
  {
    id: 'stmt-001',
    case_number: 'CR-2026/09/0812',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    complainant_name: 'Amaka Okafor',
    incident_datetime: '11 September 2026, approx 21:00 WAT',
    location: null,
    narrative: 'The complainant reports that unknown perpetrators broke into her commercial stall and removed two mobile devices and cash proceeds. The complainant suspects an adjacent stall operator.',
    witnesses: ['Adjacent stall owner', 'Night watchman'],
    requested_action: 'Police investigation into burglary, recovery of stolen handsets, and inspection of shop premises.',
    missing_fields: ['Location of incident not mentioned — please confirm specific market or address with complainant'],
    language_detected: 'Yoruba–English',
    raw_transcript: 'Mo fẹ́ sọ pé wọ́n ji foonu mi meji ati owo mi ninu ile itaja, sugbon mi o mo ibi ti awon olopaa ma ba mi lo.',
    status: 'draft',
    officer_notes: 'Missing: location of incident. Awaiting officer confirmation.',
    officer_sign_off: false,
    audio_duration: 18,
    confidence_score: 0.94,
    asr_engine: 'Sahara ASR (Intron)',
    consent_to_store: false,
  },
  {
    id: 'stmt-002',
    case_number: 'CR-2026/09/0794',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000 + 1800000).toISOString(),
    complainant_name: 'Tunde Bello',
    incident_datetime: '10 September 2026 at 19:30 WAT',
    location: 'Ojuelegba Junction, Surulere, Lagos',
    narrative: 'The complainant was crossing the roadway near Ojuelegba junction when a commercial motorcycle rider collided with his left lower limb at excessive speed. The rider stopped briefly before absconding from the scene.',
    witnesses: ['Bystander fruit seller', 'Traffic wardens on duty'],
    requested_action: 'Tracking and apprehension of commercial motorcycle operator and financial restitution for emergency medical expenses.',
    missing_fields: [],
    language_detected: 'Pidgin–English',
    raw_transcript: 'I dey waka come from work when one motorcycle just hit my leg for Ojuelegba junction, na around 7pm yesterday.',
    status: 'finalized',
    officer_notes: 'All required fields confirmed and signed. Verified medical report attached.',
    officer_sign_off: true,
    officer_name: 'Insp. K. Balogun',
    audio_duration: 22,
    confidence_score: 0.98,
    asr_engine: 'Sahara ASR (Intron)',
    consent_to_store: false,
  },
  {
    id: 'stmt-003',
    case_number: 'CR-2026/09/0805',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    complainant_name: 'Blessing Adeyemi',
    incident_datetime: 'Thursday night, 10 September 2026',
    location: 'Ikeja Along Bus Stop, Lagos',
    narrative: 'The complainant reports theft of her registered motor vehicle parked adjacent to commercial banks along the expressway. Vehicle details provided: silver sedan, registration LND-234-XY.',
    witnesses: ['Bank private security guard'],
    requested_action: 'Broadcast alert to state anti-vehicle theft division and interstate patrol checkpoints.',
    missing_fields: ['Complainant contact phone number requires secondary verification'],
    language_detected: 'Yoruba–English',
    raw_transcript: 'Ẹnìkan gbé ọkọ̀ ayọ́kẹ́lẹ́ mi ní alẹ́ ọjọ́ Ẹtì, plate number rẹ̀ jẹ́ LND-234-XY.',
    status: 'in_review',
    officer_notes: 'CCTV footage requested from neighboring bank branch.',
    officer_sign_off: false,
    audio_duration: 16,
    confidence_score: 0.96,
    asr_engine: 'Sahara ASR (Intron)',
    consent_to_store: false,
  }
];
