import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Download,
  Trash2,
  Edit3,
  Calendar,
  User,
  Clock,
} from 'lucide-react';
import { StatementItem } from '../types.js';
import { generateStatementPDF } from '../utils/pdfGenerator.js';

interface StatementsScreenProps {
  statements: StatementItem[];
  onSelectStatement: (statement: StatementItem) => void;
  onNewIntake: () => void;
  onDeleteStatement: (id: string) => void;
}

export const StatementsScreen: React.FC<StatementsScreenProps> = ({
  statements,
  onSelectStatement,
  onNewIntake,
  onDeleteStatement,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'in_review' | 'finalized'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filtered = statements.filter((stmt) => {
    const matchesTab = activeTab === 'all' || stmt.status === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (stmt.complainant_name && stmt.complainant_name.toLowerCase().includes(query)) ||
      stmt.case_number.toLowerCase().includes(query) ||
      (stmt.location && stmt.location.toLowerCase().includes(query)) ||
      stmt.narrative.toLowerCase().includes(query);

    return matchesTab && matchesQuery;
  });

  const getProgressPercent = (stmt: StatementItem) => {
    if (stmt.status === 'finalized') return 100;
    const missingCount = stmt.missing_fields?.length || 0;
    if (missingCount === 0) return 90;
    return Math.max(30, Math.round(((5 - missingCount) / 5) * 100));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold text-[#e87a45] uppercase tracking-wider mb-1">
            Station Case Files
          </div>
          <h1 className="font-sora font-bold text-2xl sm:text-3xl text-[#171310] dark:text-[#f6f1ea]">
            Citizen Statements
          </h1>
          <p className="text-xs text-[#171310]/70 dark:text-[#f6f1ea]/70 mt-1">
            Browse, review, and export verified complaint statements taken at the front desk.
          </p>
        </div>

        <button
          onClick={onNewIntake}
          className="px-5 py-2.5 rounded-full bg-[#e87a45] hover:bg-[#c65a34] text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint Intake</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Exact Tabs from Phone 2 Design */}
        <div className="flex items-center gap-2 bg-[#171310] p-1.5 rounded-full text-xs font-medium w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-[#c65a34] text-white font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            All ({statements.length})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'draft' ? 'bg-[#c65a34] text-white font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Draft ({statements.filter((s) => s.status === 'draft').length})
          </button>
          <button
            onClick={() => setActiveTab('in_review')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'in_review' ? 'bg-[#c65a34] text-white font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            In Review ({statements.filter((s) => s.status === 'in_review').length})
          </button>
          <button
            onClick={() => setActiveTab('finalized')}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === 'finalized' ? 'bg-[#c65a34] text-white font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Finalized ({statements.filter((s) => s.status === 'finalized').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search by name, case ref, place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-black/10 dark:border-white/10 dark:bg-[#171310] dark:text-white text-xs outline-none focus:border-[#e87a45]"
          />
        </div>
      </div>

      {/* Statements Cards Grid (styled as in Phone 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((stmt) => {
          const progress = getProgressPercent(stmt);
          const isFinalized = stmt.status === 'finalized';

          return (
            <div
              key={stmt.id}
              className="bg-white dark:bg-[#171310] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#e87a45] uppercase tracking-wider block">
                      {stmt.case_number}
                    </span>
                    <h3 className="font-sora font-bold text-sm text-[#171310] dark:text-white mt-0.5">
                      {stmt.complainant_name || 'Anonymous Complainant'} — {stmt.location || 'Incident Report'}
                    </h3>
                  </div>

                  <span
                    className={`text-[8px] font-bold px-2.5 py-0.5 rounded-full ${
                      stmt.language_detected === 'Yoruba–English'
                        ? 'bg-[#f3d9d6] text-[#8a3a2a]'
                        : stmt.language_detected === 'Pidgin–English'
                        ? 'bg-[#e4e9d8] text-[#4c5a2f]'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                    }`}
                  >
                    {stmt.language_detected}
                  </span>
                </div>

                {/* Description / Missing status from design */}
                <p className="text-xs text-[#171310]/70 dark:text-[#f6f1ea]/70 leading-relaxed mb-3">
                  {stmt.missing_fields && stmt.missing_fields.length > 0 ? (
                    <span className="text-[#c65a34] font-medium">
                      Missing: {stmt.missing_fields[0].replace(' — please verify', '').replace(' — please confirm', '')}.
                    </span>
                  ) : (
                    <span>All required fields confirmed and signed.</span>
                  )}
                </p>

                {/* Narrative snippet */}
                <div className="text-[11px] text-[#171310]/60 dark:text-[#f6f1ea]/60 italic bg-[#f6f1ea]/60 dark:bg-black/20 p-2.5 rounded-xl line-clamp-2 mb-3">
                  "{stmt.narrative}"
                </div>
              </div>

              {/* Bottom metadata & progress bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-[#171310]/50 dark:text-[#f6f1ea]/50 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(stmt.created_at).toLocaleDateString()}</span>
                  </span>
                  <span>{progress}% complete</span>
                </div>

                {/* Copper progress bar from Phone 2 design */}
                <div className="h-[4px] bg-[#eee] dark:bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#c65a34] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-xs">
                  <button
                    onClick={() => onSelectStatement(stmt)}
                    className="flex items-center gap-1 text-[#171310] dark:text-white font-semibold hover:text-[#e87a45] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#e87a45]" />
                    <span>Review & Edit</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateStatementPDF(stmt)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#f6f1ea] dark:bg-white/10 text-[#171310] dark:text-white font-medium hover:bg-[#c65a34] hover:text-white transition-all cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => onDeleteStatement(stmt.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors cursor-pointer"
                      title="Delete Statement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#171310] rounded-3xl border border-black/5 dark:border-white/10 p-8">
          <FileText className="w-12 h-12 text-[#171310]/30 dark:text-white/30 mx-auto mb-3" />
          <h3 className="font-sora font-bold text-base text-[#171310] dark:text-white">
            No statements found
          </h3>
          <p className="text-xs text-[#171310]/60 dark:text-[#f6f1ea]/60 mt-1">
            Try adjusting your search query or record a new complaint.
          </p>
          <button
            onClick={onNewIntake}
            className="mt-4 px-5 py-2 rounded-full bg-[#e87a45] text-white text-xs font-semibold"
          >
            Record First Statement
          </button>
        </div>
      )}
    </div>
  );
};
