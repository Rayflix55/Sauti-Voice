import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { StatementItem } from '../types.js';
import { generateStatementPDF } from '../utils/pdfGenerator.js';

interface ReviewScreenProps {
  statement: StatementItem;
  onUpdateStatement: (updated: StatementItem) => void;
  onBack: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  statement,
  onUpdateStatement,
  onBack,
}) => {
  const [formData, setFormData] = useState<StatementItem>({ ...statement });
  const [showRawTranscript, setShowRawTranscript] = useState(false);
  const [newWitness, setNewWitness] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Field change handler
  const handleChange = (field: keyof StatementItem, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value, updated_at: new Date().toISOString() };
      
      // Dynamically recalculate missing fields
      const missing: string[] = [];
      if (!updated.complainant_name) {
        missing.push('Complainant name not mentioned — please verify full name with complainant');
      }
      if (!updated.incident_datetime) {
        missing.push('Incident date/time not specified — please confirm exact timestamp');
      }
      if (!updated.location) {
        missing.push('Location of incident not mentioned — please confirm specific address or area');
      }
      if (!updated.requested_action) {
        missing.push('Requested action not specified — please ask what relief complainant seeks');
      }
      updated.missing_fields = missing;
      return updated;
    });
  };

  const handleAddWitness = () => {
    if (newWitness.trim().length > 0) {
      const updatedWitnesses = [...formData.witnesses, newWitness.trim()];
      handleChange('witnesses', updatedWitnesses);
      setNewWitness('');
    }
  };

  const handleRemoveWitness = (index: number) => {
    const updated = formData.witnesses.filter((_, i) => i !== index);
    handleChange('witnesses', updated);
  };

  const handleSave = (newStatus?: 'draft' | 'in_review' | 'finalized') => {
    const toSave = {
      ...formData,
      status: newStatus || formData.status,
      updated_at: new Date().toISOString(),
    };
    setFormData(toSave);
    onUpdateStatement(toSave);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportPDF = () => {
    generateStatementPDF(formData);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-[#171310] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-[#171310] dark:text-[#f6f1ea]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#e87a45] uppercase tracking-wider">
                {formData.case_number}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  formData.status === 'finalized'
                    ? 'bg-[#e4e9d8] text-[#4c5a2f]'
                    : formData.status === 'in_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#f3d9d6] text-[#8a3a2a]'
                }`}
              >
                {formData.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <h1 className="font-sora font-bold text-xl sm:text-2xl text-[#171310] dark:text-[#f6f1ea]">
              Review & Finalize Statement
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSave()}
            className="px-4 py-2.5 rounded-full bg-white dark:bg-[#171310] border border-black/10 dark:border-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer text-[#171310] dark:text-[#f6f1ea]"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? 'Saved!' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 rounded-full bg-[#e87a45] hover:bg-[#c65a34] text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Statement Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Missing Fields Warning Banner */}
          {formData.missing_fields && formData.missing_fields.length > 0 && (
            <div className="bg-[#f3d9d6] border border-[#c65a34]/40 rounded-2xl p-4 text-[#3a1710]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-[#7a2f1c] mb-1.5">
                <AlertTriangle className="w-4 h-4 text-[#c65a34]" />
                <span>Action Required: {formData.missing_fields.length} Detail(s) Missing in Verbal Narrative</span>
              </div>
              <ul className="space-y-1 text-xs pl-6 list-disc text-[#3a1710]/90">
                {formData.missing_fields.map((mf, idx) => (
                  <li key={idx}>{mf}</li>
                ))}
              </ul>
              <p className="text-[11px] opacity-75 mt-2">
                As intake officer, please confirm these missing items with the citizen and enter them into the fields below before finalizing.
              </p>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white dark:bg-[#171310] rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm space-y-5">
            {/* Complainant Name */}
            <div>
              <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                Complainant Full Name *
              </label>
              <input
                type="text"
                value={formData.complainant_name || ''}
                onChange={(e) => handleChange('complainant_name', e.target.value || null)}
                placeholder="e.g. Amaka Okafor (Confirm full name with complainant)"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors dark:bg-[#0c0908] dark:text-white ${
                  !formData.complainant_name
                    ? 'border-[#c65a34] bg-[#f3d9d6]/20'
                    : 'border-black/10 dark:border-white/15 focus:border-[#e87a45]'
                }`}
              />
            </div>

            {/* Date/Time and Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                  Incident Date & Time *
                </label>
                <input
                  type="text"
                  value={formData.incident_datetime || ''}
                  onChange={(e) => handleChange('incident_datetime', e.target.value || null)}
                  placeholder="e.g. 10 September 2026 at approx 7:00 PM"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors dark:bg-[#0c0908] dark:text-white ${
                    !formData.incident_datetime
                      ? 'border-[#c65a34] bg-[#f3d9d6]/20'
                      : 'border-black/10 dark:border-white/15 focus:border-[#e87a45]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                  Incident Location & Landmark *
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value || null)}
                  placeholder="e.g. Alaba Market, Lagos"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors dark:bg-[#0c0908] dark:text-white ${
                    !formData.location
                      ? 'border-[#c65a34] bg-[#f3d9d6]/20'
                      : 'border-black/10 dark:border-white/15 focus:border-[#e87a45]'
                  }`}
                />
              </div>
            </div>

            {/* Structured Narrative */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#171310] dark:text-[#f6f1ea]">
                  Formalized Incident Statement (Narrative) *
                </label>
                <span className="text-[10px] text-[#171310]/60 dark:text-[#f6f1ea]/60">
                  Cleaned & standardized formal English
                </span>
              </div>
              <textarea
                rows={5}
                value={formData.narrative}
                onChange={(e) => handleChange('narrative', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/15 dark:bg-[#0c0908] dark:text-white text-sm leading-relaxed outline-none focus:border-[#e87a45] resize-y"
              />
            </div>

            {/* Witnesses Section */}
            <div>
              <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                Identified Witnesses
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.witnesses.map((w, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1ea] dark:bg-white/10 text-xs text-[#171310] dark:text-white border border-black/5 dark:border-white/10"
                  >
                    <span>{w}</span>
                    <button
                      onClick={() => handleRemoveWitness(idx)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {formData.witnesses.length === 0 && (
                  <span className="text-xs text-[#171310]/50 dark:text-[#f6f1ea]/50 italic">
                    No third-party witnesses identified yet.
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add witness name or description..."
                  value={newWitness}
                  onChange={(e) => setNewWitness(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWitness())}
                  className="flex-1 px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/15 dark:bg-[#0c0908] dark:text-white text-xs outline-none focus:border-[#e87a45]"
                />
                <button
                  type="button"
                  onClick={handleAddWitness}
                  className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Requested Action */}
            <div>
              <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                Relief / Legal Action Requested *
              </label>
              <input
                type="text"
                value={formData.requested_action || ''}
                onChange={(e) => handleChange('requested_action', e.target.value || null)}
                placeholder="e.g. Investigation and recovery of stolen items"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors dark:bg-[#0c0908] dark:text-white ${
                  !formData.requested_action
                    ? 'border-[#c65a34] bg-[#f3d9d6]/20'
                    : 'border-black/10 dark:border-white/15 focus:border-[#e87a45]'
                }`}
              />
            </div>

            {/* Officer Notes & Review Sign-off */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                  Intake Officer Notes & Verification
                </label>
                <input
                  type="text"
                  value={formData.officer_notes || ''}
                  onChange={(e) => handleChange('officer_notes', e.target.value)}
                  placeholder="e.g. Complainant was calm; verbal testimony confirmed with station sergeant."
                  className="w-full px-4 py-2 rounded-xl border border-black/10 dark:border-white/15 dark:bg-[#0c0908] dark:text-white text-xs outline-none focus:border-[#e87a45]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171310] dark:text-[#f6f1ea] mb-1.5">
                    Officer Name / Station Desk
                  </label>
                  <input
                    type="text"
                    value={formData.officer_name || ''}
                    onChange={(e) => handleChange('officer_name', e.target.value)}
                    placeholder="e.g. Insp. A. Adeleke (Legal Aid Desk)"
                    className="w-full px-4 py-2 rounded-xl border border-black/10 dark:border-white/15 dark:bg-[#0c0908] dark:text-white text-xs outline-none focus:border-[#e87a45]"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f6f1ea]/50 dark:bg-white/5 border border-black/5 dark:border-white/10 w-full cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.officer_sign_off || false}
                      onChange={(e) => handleChange('officer_sign_off', e.target.checked)}
                      className="rounded text-[#e87a45] focus:ring-[#e87a45]"
                    />
                    <span className="font-semibold text-[#171310] dark:text-white">
                      Officer Certified & Signed Off
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Verbatim Transcript Accordion */}
          <div className="bg-white dark:bg-[#171310] rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <button
              onClick={() => setShowRawTranscript(!showRawTranscript)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#171310] dark:text-[#f6f1ea] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#e87a45]" />
                <span>View Original Spoken Transcript (Sahara ASR)</span>
              </span>
              <span className="text-[#e87a45]">{showRawTranscript ? 'Hide' : 'Show'}</span>
            </button>

            {showRawTranscript && (
              <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10">
                <p className="text-xs text-[#171310]/80 dark:text-[#f6f1ea]/80 italic bg-[#f6f1ea] dark:bg-[#0c0908] p-3 rounded-xl leading-relaxed">
                  "{formData.raw_transcript}"
                </p>
                <div className="flex gap-4 text-[10px] text-[#171310]/50 dark:text-[#f6f1ea]/50 mt-2">
                  <span>Language: {formData.language_detected}</span>
                  <span>Confidence: {(formData.confidence_score || 0.96) * 100}%</span>
                  <span>Engine: {formData.asr_engine || 'Sahara (Intron)'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 cols: Exact "Statement Check" Floating Card Style & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Statement Check Card (exact design from landing page mockup) */}
          <div className="bg-[#171310] text-[#f6f1ea] rounded-3xl p-6 border border-white/10 shadow-xl">
            <div className="font-sora font-bold text-sm mb-4 text-white flex items-center justify-between">
              <span>Statement Check</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3a1710] text-[#e87a45] border border-[#7a2f1c]">
                Auditing
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-white/80">Complainant name</span>
                {formData.complainant_name ? (
                  <span className="text-[#8fd6a8] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[#e87a45] font-semibold bg-[#3a1710] px-2 py-0.5 rounded">
                    Missing
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-white/80">Date & time</span>
                {formData.incident_datetime ? (
                  <span className="text-[#8fd6a8] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[#e87a45] font-semibold bg-[#3a1710] px-2 py-0.5 rounded">
                    Missing
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-white/80">Location / Landmark</span>
                {formData.location ? (
                  <span className="text-[#8fd6a8] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[#e87a45] font-semibold bg-[#3a1710] px-2 py-0.5 rounded">
                    Missing
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-white/80">Incident narrative</span>
                <span className="text-[#8fd6a8] font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Structured
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/80">Requested relief</span>
                {formData.requested_action ? (
                  <span className="text-[#8fd6a8] font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="text-[#e87a45] font-semibold bg-[#3a1710] px-2 py-0.5 rounded">
                    Missing
                  </span>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between text-[10px] text-white/60 mb-1.5">
                <span>Completion Status</span>
                <span>
                  {formData.missing_fields.length === 0
                    ? '100% Complete'
                    : `${Math.round(((5 - formData.missing_fields.length) / 5) * 100)}%`}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c65a34] transition-all duration-300"
                  style={{
                    width: `${Math.max(20, Math.round(((5 - formData.missing_fields.length) / 5) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Workflow Status Actions */}
          <div className="bg-white dark:bg-[#171310] rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-sm space-y-3">
            <div className="text-xs font-bold text-[#171310] dark:text-white mb-2">
              Statement Progression
            </div>

            <button
              onClick={() => handleSave('in_review')}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                formData.status === 'in_review'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Move to "In Review"
            </button>

            <button
              onClick={() => handleSave('finalized')}
              disabled={formData.missing_fields.length > 0}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                formData.missing_fields.length === 0
                  ? 'bg-[#4c5a2f] hover:bg-[#3d4925] text-white shadow-md'
                  : 'bg-black/10 dark:bg-white/5 text-[#171310]/40 dark:text-white/40 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Finalize & Sign Statement</span>
            </button>

            {formData.missing_fields.length > 0 && (
              <p className="text-[10px] text-[#c65a34] text-center">
                * Please resolve missing fields above before final sign-off.
              </p>
            )}

            <button
              onClick={handleExportPDF}
              className="w-full mt-2 py-3 rounded-xl bg-[#e87a45] hover:bg-[#c65a34] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Official PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
