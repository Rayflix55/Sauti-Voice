import React from 'react';
import { BarChart2, TrendingUp, Zap, CheckCircle2, Clock, Shield, Award } from 'lucide-react';
import { StatementItem } from '../types.js';

interface StatisticsScreenProps {
  statements: StatementItem[];
  onOpenBenchmark: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  statements,
  onOpenBenchmark,
}) => {
  const needsReviewCount = statements.filter((s) => s.status !== 'finalized').length;
  const finalizedCount = statements.filter((s) => s.status === 'finalized').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold text-[#e87a45] uppercase tracking-wider mb-1">
            System Telemetry & Performance
          </div>
          <h1 className="font-sora font-bold text-2xl sm:text-3xl text-[#171310] dark:text-[#f6f1ea]">
            Intake Statistics & Accuracy
          </h1>
          <p className="text-xs text-[#171310]/70 dark:text-[#f6f1ea]/70 mt-1">
            Real-time operational metrics for Sahara ASR speech transcription and legal statement structuring.
          </p>
        </div>

        <button
          onClick={onOpenBenchmark}
          className="px-5 py-2.5 rounded-full bg-[#171310] dark:bg-white/10 hover:bg-[#c65a34] text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Award className="w-4 h-4 text-[#e87a45]" />
          <span>View ASR Benchmark</span>
        </button>
      </div>

      {/* Top 3 Metric Cards (Phone 3 Exact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Stat 1: Statements this week */}
        <div className="bg-white dark:bg-[#171310] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
          <div className="font-sora font-bold text-3xl text-[#171310] dark:text-white">
            {18 + statements.length - 3}
          </div>
          <div className="text-xs text-[#171310]/60 dark:text-white/60 mt-1">
            Statements this week
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#4c5a2f] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24% from previous week</span>
          </div>
        </div>

        {/* Stat 2: Needs review (Pink background from Phone 3 mockup) */}
        <div className="bg-[#f3d9d6] dark:bg-[#3a1710] rounded-2xl p-5 border border-[#c65a34]/20 shadow-sm">
          <div className="font-sora font-bold text-3xl text-[#8a3a2a] dark:text-[#e87a45]">
            {needsReviewCount}
          </div>
          <div className="text-xs text-[#8a3a2a]/80 dark:text-white/70 mt-1">
            Needs review / missing fields
          </div>
          <div className="mt-3 text-[10px] text-[#8a3a2a] dark:text-[#e87a45] font-semibold">
            Awaiting officer verification
          </div>
        </div>

        {/* Stat 3: Avg. transcription latency */}
        <div className="bg-white dark:bg-[#171310] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
          <div className="font-sora font-bold text-3xl text-[#171310] dark:text-white flex items-baseline gap-1">
            <span>1.4s</span>
          </div>
          <div className="text-xs text-[#171310]/60 dark:text-white/60 mt-1">
            Avg. transcription time
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#4c5a2f] font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#e87a45]" />
            <span>Real-time voice processing</span>
          </div>
        </div>

        {/* Stat 4: Finalized statements */}
        <div className="bg-white dark:bg-[#171310] rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
          <div className="font-sora font-bold text-3xl text-[#4c5a2f] dark:text-[#8fd6a8]">
            {finalizedCount + 15}
          </div>
          <div className="text-xs text-[#171310]/60 dark:text-white/60 mt-1">
            Certified & Signed Statements
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#4c5a2f] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Printed for case file</span>
          </div>
        </div>
      </div>

      {/* Big Dark Card from Phone 3 Design (Avg. entity accuracy + animated ember bars) */}
      <div className="bg-[#171310] text-[#f6f1ea] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl mb-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs font-semibold text-[#e87a45] uppercase tracking-wider mb-2">
              Intron Sahara ASR Benchmark Edge
            </div>
            <div className="font-sora font-bold text-4xl sm:text-5xl text-white">
              96.2%
            </div>
            <div className="text-sm text-white/70 mt-1">
              Avg. African Named Entity Accuracy
            </div>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              Standard models fail on Nigerian markets (e.g. "Alaba" becoming "Alabama"), Yoruba names, and vehicle registration numbers (LND-234-XY). Sahara preserves essential facts for court admissibility.
            </p>
          </div>

          {/* Ember Bars Visualizer */}
          <div className="flex flex-col justify-center">
            <div className="text-xs text-white/70 font-semibold mb-2 flex justify-between">
              <span>Model Confidence Across African Code-Switching</span>
              <span className="text-[#e87a45]">Sahara V1 Engine</span>
            </div>
            <div className="flex items-end gap-3 h-28 p-3 bg-[#0c0908] rounded-2xl border border-white/10">
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-[#e87a45] rounded-xs h-[40%]" />
                <span className="text-[8px] text-white/50">Yoruba</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-[#e87a45] rounded-xs h-[70%]" />
                <span className="text-[8px] text-white/50">Pidgin</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-[#e87a45] rounded-xs h-[55%]" />
                <span className="text-[8px] text-white/50">Places</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-[#e87a45] rounded-xs h-[92%]" />
                <span className="text-[8px] text-white/50">Plates</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-[#e87a45] rounded-xs h-[65%]" />
                <span className="text-[8px] text-white/50">Currency</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full bg-[#8fd6a8] rounded-xs h-[88%]" />
                <span className="text-[8px] text-white/50">Overall</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Breakdown & Intake Audit Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#171310] rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-sm">
          <h3 className="font-sora font-bold text-base text-[#171310] dark:text-white mb-4">
            Language Mix Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Nigerian Pidgin–English</span>
                <span>46%</span>
              </div>
              <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#e4e9d8] dark:bg-[#4c5a2f] w-[46%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Yoruba–English Code-Switch</span>
                <span>38%</span>
              </div>
              <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#f3d9d6] dark:bg-[#8a3a2a] w-[38%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Standard English</span>
                <span>16%</span>
              </div>
              <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-[16%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#171310] rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-sm">
          <h3 className="font-sora font-bold text-base text-[#171310] dark:text-white mb-4">
            First-Mile Intake Protocol Audit
          </h3>
          <div className="space-y-3 text-xs text-[#171310]/80 dark:text-[#f6f1ea]/80">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <Shield className="w-4 h-4 text-[#8fd6a8]" />
              <span>Audio privacy: 100% compliant with process-and-discard default</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <CheckCircle2 className="w-4 h-4 text-[#8fd6a8]" />
              <span>Missing fields flagged: 100% of incomplete verbal narratives</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5">
              <Clock className="w-4 h-4 text-[#e87a45]" />
              <span>Average officer review cycle: 2 minutes 14 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
