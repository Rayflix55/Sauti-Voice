import { jsPDF } from 'jspdf';
import { StatementItem } from '../types.js';

export function generateStatementPDF(statement: StatementItem): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(58, 23, 16); // --copper-1
  doc.text('FEDERAL REPUBLIC OF NIGERIA', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(122, 47, 28); // --copper-2
  doc.text('NIGERIA POLICE FORCE / CITIZENS LEGAL AID COMMISSION', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 80, 75);
  doc.text('SAUTI FIRST-MILE VOICE INTAKE SYSTEM (LEGAL SERVICES TRACK)', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Line divider
  doc.setDrawColor(198, 90, 52); // --copper-3
  doc.setLineWidth(0.8);
  doc.line(16, y, pageWidth - 16, y);
  y += 7;

  // Case Reference & Metadata Box
  doc.setFillColor(246, 241, 234); // --cream
  doc.roundedRect(16, y, pageWidth - 32, 22, 2, 2, 'F');
  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.3);
  doc.roundedRect(16, y, pageWidth - 32, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(23, 19, 16); // --ink
  doc.text(`CASE REF: ${statement.case_number}`, 20, y + 6);
  doc.text(`DATE FILED: ${new Date(statement.created_at).toLocaleDateString()} ${new Date(statement.created_at).toLocaleTimeString()}`, 20, y + 12);
  doc.text(`AUDIO RETENTION: ${statement.consent_to_store ? 'Retained with Citizen Consent' : 'Discarded Post-Processing (Privacy First)'}`, 20, y + 18);

  doc.text(`STATUS: ${statement.status.toUpperCase().replace('_', ' ')}`, pageWidth - 20, y + 6, { align: 'right' });
  doc.text(`LANGUAGE: ${statement.language_detected}`, pageWidth - 20, y + 12, { align: 'right' });
  doc.text(`ASR ENGINE: ${statement.asr_engine || 'Sahara ASR (Intron)'}`, pageWidth - 20, y + 18, { align: 'right' });
  y += 28;

  // Section 1: PARTICULARS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(122, 47, 28);
  doc.text('1. PARTICULARS OF INCIDENT & PARTIES', 16, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(23, 19, 16);

  const drawField = (label: string, value: string | null, isMissing: boolean = false) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 18, y);
    doc.setFont('helvetica', 'normal');
    if (isMissing || !value) {
      doc.setTextColor(198, 90, 52);
      doc.text('[NOT SPECIFIED IN VERBAL TESTIMONY — PENDING CONFIRMATION]', 65, y);
      doc.setTextColor(23, 19, 16);
    } else {
      doc.text(value, 65, y);
    }
    y += 5.5;
  };

  drawField('Complainant Full Name', statement.complainant_name);
  drawField('Incident Date / Time', statement.incident_datetime);
  drawField('Incident Location / Landmark', statement.location);
  drawField('Witnesses Mentioned', statement.witnesses.length > 0 ? statement.witnesses.join(', ') : 'None specified');
  drawField('Relief / Action Requested', statement.requested_action);
  y += 3;

  // Section 2: FORMAL INCIDENT NARRATIVE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(122, 47, 28);
  doc.text('2. STRUCTURED STATEMENT OF INCIDENT (SWORN TESTIMONY)', 16, y);
  y += 5;

  doc.setFillColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(23, 19, 16);

  const splitNarrative = doc.splitTextToSize(statement.narrative, pageWidth - 36);
  const narrativeHeight = splitNarrative.length * 4.5 + 6;
  doc.rect(16, y, pageWidth - 32, narrativeHeight);
  doc.text(splitNarrative, 20, y + 5);
  y += narrativeHeight + 5;

  // Section 3: MISSING DETAILS / OFFICER VERIFICATION
  if (statement.missing_fields && statement.missing_fields.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(198, 90, 52);
    doc.text('3. INTAKE AUDIT & FLAGGED MISSING DETAILS', 16, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 50, 45);
    for (const mf of statement.missing_fields) {
      doc.text(`• ${mf}`, 20, y);
      y += 4;
    }
    y += 2;
  }

  // Section 4: VERBATIM SPOKEN TRANSCRIPT (APPENDIX)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(122, 47, 28);
  doc.text('4. VERBATIM SPOKEN TRANSCRIPT (AS RECORDED VIA SAHARA ASR)', 16, y);
  y += 4.5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(80, 70, 65);
  const splitTranscript = doc.splitTextToSize(`"${statement.raw_transcript}"`, pageWidth - 36);
  doc.text(splitTranscript, 20, y);
  y += splitTranscript.length * 4 + 6;

  // Sign-off section
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 80, 75);
  doc.text(
    'I certify that this statement has been translated and structured with human oversight pursuant to the Sauti Intake Protocol.',
    16,
    y
  );
  y += 12;

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(23, 19, 16);

  // Left: Officer
  doc.line(18, y + 10, 80, y + 10);
  doc.text('INTAKE OFFICER SIGNATURE', 18, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(statement.officer_name || 'Insp. A. Adeleke (Legal Aid Desk)', 18, y + 18);

  // Right: Complainant
  doc.setFont('helvetica', 'bold');
  doc.line(pageWidth - 80, y + 10, pageWidth - 18, y + 10);
  doc.text('COMPLAINANT MARK / SIGNATURE', pageWidth - 80, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(statement.complainant_name || 'Complainant (Verbal Confirmation)', pageWidth - 80, y + 18);

  // Download trigger
  const safeName = (statement.complainant_name || statement.case_number).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Sauti_Statement_${safeName}.pdf`);
}
