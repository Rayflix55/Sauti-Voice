import React from 'react';
import { Mic, FileText, BarChart2, Award, Home, ShieldCheck } from 'lucide-react';

interface InAppHeaderProps {
  currentTab: 'record' | 'statements' | 'statistics' | 'benchmark';
  onSelectTab: (tab: 'record' | 'statements' | 'statistics' | 'benchmark') => void;
  onGoToLanding: () => void;
  statementsCount: number;
}

export const InAppHeader: React.FC<InAppHeaderProps> = ({
  currentTab,
  onSelectTab,
  onGoToLanding,
  statementsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#171310] border-b border-[#3a1710]/40 text-[#f6f1ea] px-4 sm:px-8 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div
            onClick={onGoToLanding}
            className="flex items-center gap-2 font-sora font-bold text-lg text-white hover:text-[#e87a45] cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#c65a34] flex items-center justify-center text-white shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            </div>
            <span>sauti</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#3a1710] text-[#e87a45] border border-[#7a2f1c]">
              Legal Intake
            </span>
          </div>

          <button
            onClick={onGoToLanding}
            className="sm:hidden text-xs text-[#f6f1ea]/70 hover:text-white flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Landing</span>
          </button>
        </div>

        {/* In-App Tabs Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0c0908] p-1 rounded-full border border-white/10 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onSelectTab('record')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              currentTab === 'record'
                ? 'bg-[#e87a45] text-white shadow-sm font-semibold'
                : 'text-[#f6f1ea]/70 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Intake</span>
          </button>

          <button
            onClick={() => onSelectTab('statements')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              currentTab === 'statements'
                ? 'bg-[#e87a45] text-white shadow-sm font-semibold'
                : 'text-[#f6f1ea]/70 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Statements</span>
            {statementsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                currentTab === 'statements' ? 'bg-white/20 text-white' : 'bg-[#3a1710] text-[#e87a45]'
              }`}>
                {statementsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('statistics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              currentTab === 'statistics'
                ? 'bg-[#e87a45] text-white shadow-sm font-semibold'
                : 'text-[#f6f1ea]/70 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Statistics</span>
          </button>

          <button
            onClick={() => onSelectTab('benchmark')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              currentTab === 'benchmark'
                ? 'bg-[#e87a45] text-white shadow-sm font-semibold'
                : 'text-[#f6f1ea]/70 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Benchmark</span>
          </button>
        </div>

        {/* Right Status */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3a1710]/60 text-[#f6f1ea]/80 border border-[#7a2f1c]/40">
            <span className="w-2 h-2 rounded-full bg-[#8fd6a8] animate-pulse" />
            <span>Sahara ASR Online</span>
          </div>

          <button
            onClick={onGoToLanding}
            className="text-[#f6f1ea]/70 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>
        </div>
      </div>
    </header>
  );
};
