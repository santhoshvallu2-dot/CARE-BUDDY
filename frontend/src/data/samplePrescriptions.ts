/**
 * Generates an SVG data URL for a realistic simulated prescription for testing OCR.
 */
export function generatePrescriptionDataUrl(title: string, textLines: string[]): string {
  const lineElements = textLines
    .map((line, idx) => `<text x="40" y="${140 + idx * 30}" font-family="monospace, sans-serif" font-size="16" fill="#1e293b">${line}</text>`)
    .join('');

  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420" style="background:#fcfcfc;">
  <rect width="600" height="420" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
  <rect x="20" y="20" width="560" height="380" fill="#f8fafc" rx="8"/>
  <text x="40" y="60" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#047857">MERCY GENERAL CLINIC &amp; HEART CENTER</text>
  <text x="40" y="85" font-family="Arial, sans-serif" font-size="13" fill="#64748b">104 Health Way, Suite 300 • Dr. Sarah Jenkins, MD • License: MD-8921</text>
  <line x1="40" y1="100" x2="560" y2="100" stroke="#059669" stroke-width="2"/>
  <text x="40" y="125" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${title}</text>
  ${lineElements}
  <line x1="40" y1="360" x2="560" y2="360" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="385" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">Sign: Dr. S. Jenkins, MD • Verified Electronic Record</text>
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_PRESCRIPTION_1 = {
  name: 'Cardiology Care Plan (Dr. Jenkins)',
  title: 'PATIENT CARE PRESCRIPTION',
  lines: [
    'Rx: Metoprolol Tartrate 25mg PO BID with meals.',
    'Rx: Atorvastatin 20mg PO once daily at bedtime.',
    'Instruction: Measure and log blood pressure daily.',
    'Diet: Maintain low sodium hydration routine.',
    'Follow-up: 4 weeks with updated morning BP log.',
  ],
  expectedText: `MERCY GENERAL CLINIC & HEART CENTER
104 Health Way, Suite 300 • Dr. Sarah Jenkins, MD • License: MD-8921
PATIENT CARE PRESCRIPTION
Rx: Metoprolol Tartrate 25mg PO BID with meals.
Rx: Atorvastatin 20mg PO once daily at bedtime.
Instruction: Measure and log blood pressure daily.
Diet: Maintain low sodium hydration routine.
Follow-up: 4 weeks with updated morning BP log.
Sign: Dr. S. Jenkins, MD • Verified Electronic Record`,
};

export const SAMPLE_PRESCRIPTION_2 = {
  name: 'Discharge Summary (Westside Clinic)',
  title: 'DISCHARGE & RECOVERY ADVICE',
  lines: [
    'Post-procedure recovery instructions:',
    '1. Light walking 15-20 minutes daily on flat terrain.',
    '2. Keep surgical dressing clean and dry for 48 hours.',
    '3. Acetaminophen 500mg as needed for mild soreness.',
    '4. Avoid lifting heavy objects over 10 lbs for 2 weeks.',
  ],
  expectedText: `MERCY GENERAL CLINIC & HEART CENTER
104 Health Way, Suite 300 • Dr. Sarah Jenkins, MD • License: MD-8921
DISCHARGE & RECOVERY ADVICE
Post-procedure recovery instructions:
1. Light walking 15-20 minutes daily on flat terrain.
2. Keep surgical dressing clean and dry for 48 hours.
3. Acetaminophen 500mg as needed for mild soreness.
4. Avoid lifting heavy objects over 10 lbs for 2 weeks.
Sign: Dr. S. Jenkins, MD • Verified Electronic Record`,
};
