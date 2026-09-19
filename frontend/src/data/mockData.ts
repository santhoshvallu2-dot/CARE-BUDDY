import { DocumentItem, ReminderItem, QuestionItem, UserProfile, UserPreferences } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Care Instructions — Cardiology',
    date: 'Uploaded today, 09:30 AM',
    status: 'ready',
    category: 'Prescription & Care Plan',
    fileSize: '1.2 MB',
    source: 'Dr. Sarah Jenkins • Mercy General Hospital',
    rawText: `PATIENT CARE PLAN
Rx: Metoprolol Tartrate 25mg PO BID with meals.
Rx: Atorvastatin 20mg PO QHS (at bedtime).
Advice: Maintain daily blood pressure log every morning.
Diet: Low sodium (< 2g/day), stay hydrated (1.5 - 2L water daily).
Next follow-up: 4 weeks. If experiencing dizziness upon standing, notify office.`,
    summary: 'This care plan outlines two daily medications for blood pressure and cholesterol, alongside daily morning BP tracking and a low-sodium diet routine.',
    instructions: [
      {
        id: 'inst-1',
        action: 'Metoprolol Tartrate 25mg',
        timing: 'Twice daily with meals (08:00 AM, 08:00 PM)',
        details: 'Take 1 tablet with food to maintain blood pressure.',
        type: 'medication',
      },
      {
        id: 'inst-2',
        action: 'Atorvastatin 20mg',
        timing: 'Once daily at bedtime (09:30 PM)',
        details: 'Take 1 tablet with a glass of water.',
        type: 'medication',
      },
      {
        id: 'inst-3',
        action: 'Log Morning Blood Pressure',
        timing: 'Daily at 07:30 AM',
        details: 'Rest 5 minutes before recording reading in journal.',
        type: 'measurement',
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'Follow-up Notes & Discharge Summary',
    date: 'Uploaded yesterday, 04:15 PM',
    status: 'ready',
    category: 'Discharge Summary',
    fileSize: '2.4 MB',
    source: 'Westside Medical Clinic',
    rawText: `DISCHARGE INSTRUCTIONS
Post-procedure recovery is on track.
Wound care: Keep dry for 48 hours.
Activity: Light walking 15-20 mins daily, avoid heavy lifting (>10 lbs) for 2 weeks.
Pain management: Acetaminophen 500mg as needed for mild discomfort, maximum 3g/day.`,
    summary: 'Discharge guidance for post-procedure recovery. Focuses on gentle daily walking, keeping surgical dressing dry, and avoiding strenuous lifting.',
    instructions: [
      {
        id: 'inst-4',
        action: 'Light Recovery Walk',
        timing: 'Daily at 01:00 PM',
        details: '15-20 minutes leisurely pace around flat terrain.',
        type: 'activity',
      },
    ],
  },
  {
    id: 'doc-3',
    title: 'Lab Test Report — Lipid & Metabolic',
    date: '3 days ago',
    status: 'uploaded',
    category: 'Lab Report',
    fileSize: '890 KB',
    source: 'Quest Diagnostics',
    rawText: `FASTING LIPID PANEL
Total Cholesterol: 185 mg/dL (Normal)
Triglycerides: 140 mg/dL (Normal)
HDL: 52 mg/dL (Normal)
LDL: 105 mg/dL (Borderline)
HbA1c: 5.4% (Normal)`,
    summary: 'Fasting lipid and metabolic panel showing cholesterol within target ranges.',
    instructions: [],
  },
];

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    time: '08:00 AM',
    title: 'Metoprolol Tartrate (25mg)',
    instruction: 'Take 1 tablet with breakfast and water',
    completed: true,
    frequency: 'Twice daily',
    tag: 'Morning Routine',
    category: 'medication',
    notes: 'Prescribed by Dr. Sarah Jenkins',
    startDate: '2026-10-12',
    createdAt: '2026-10-12',
    completedDates: ['2026-10-12'],
    sourceDocumentTitle: 'Care Instructions — Cardiology',
    isDemo: true,
  },
  {
    id: 'rem-2',
    time: '01:00 PM',
    title: 'Light 15-Min Recovery Walk',
    instruction: 'Gentle walk on flat ground, stay hydrated',
    completed: true,
    frequency: 'Once daily',
    tag: 'Afternoon Activity',
    category: 'routine',
    notes: 'Discharge instruction from Oct 12',
    startDate: '2026-10-12',
    createdAt: '2026-10-12',
    completedDates: ['2026-10-12'],
    sourceDocumentTitle: 'Follow-up Notes & Discharge Summary',
    isDemo: true,
  },
  {
    id: 'rem-3',
    time: '08:00 PM',
    title: 'Metoprolol Tartrate (25mg)',
    instruction: 'Take 1 tablet with dinner',
    completed: false,
    frequency: 'Twice daily',
    tag: 'Evening Routine',
    category: 'medication',
    notes: 'Second daily dose with meal',
    startDate: '2026-10-12',
    createdAt: '2026-10-12',
    completedDates: [],
    sourceDocumentTitle: 'Care Instructions — Cardiology',
    isDemo: true,
  },
  {
    id: 'rem-4',
    time: '09:30 PM',
    title: 'Atorvastatin (20mg)',
    instruction: 'Take 1 tablet at bedtime with water',
    completed: false,
    frequency: 'Once daily',
    tag: 'Night Routine',
    category: 'medication',
    notes: 'Lipid management',
    startDate: '2026-10-12',
    createdAt: '2026-10-12',
    completedDates: [],
    sourceDocumentTitle: 'Care Instructions — Cardiology',
    isDemo: true,
  },
];

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-1',
    question: 'Can you confirm if I should take Metoprolol before or after breakfast if I practice intermittent fasting?',
    sourceDoc: 'Care Instructions — Cardiology',
    category: 'Medication Timing',
    resolved: false,
    createdAt: 'Today',
  },
  {
    id: 'q-2',
    question: 'How long should I wait after taking blood pressure medication before doing my morning walk?',
    sourceDoc: 'Discharge Summary',
    category: 'Daily Activity',
    resolved: false,
    createdAt: 'Yesterday',
  },
  {
    id: 'q-3',
    question: 'Is occasional slight dizziness in the morning an expected side effect while my body adjusts?',
    sourceDoc: 'Care Instructions — Cardiology',
    category: 'Symptoms & Adjustment',
    resolved: false,
    createdAt: '2 days ago',
  },
  {
    id: 'q-4',
    question: 'When should I schedule the next lipid profile blood test?',
    sourceDoc: 'Lab Test Report',
    category: 'Follow-up Lab',
    resolved: true,
    createdAt: 'Oct 10',
  },
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  primaryCaregiver: 'Robert Doe (Spouse)',
  caregiverPhone: '+1 (555) 234-5678',
  primaryDoctor: 'Dr. Sarah Jenkins, MD (Cardiology)',
  doctorPhone: '+1 (555) 876-5432',
  clinicName: 'Mercy General Heart & Vascular Clinic',
};

export const INITIAL_PREFERENCES: UserPreferences = {
  pushNotifications: true,
  soundAlerts: true,
  vibrateAlerts: true,
  highContrast: false,
  demoMode: true,
};
