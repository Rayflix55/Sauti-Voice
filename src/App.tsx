import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage.js';
import { InAppHeader } from './components/InAppHeader.js';
import { RecordScreen } from './components/RecordScreen.js';
import { ReviewScreen } from './components/ReviewScreen.js';
import { StatementsScreen } from './components/StatementsScreen.js';
import { StatisticsScreen } from './components/StatisticsScreen.js';
import { BenchmarkView } from './components/BenchmarkView.js';
import { INITIAL_STATEMENTS } from './data/sampleNarratives.js';
import { StatementItem } from './types.js';

export default function App() {
  // Navigation state
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [appTab, setAppTab] = useState<'record' | 'statements' | 'statistics' | 'benchmark'>('record');
  const [activeStatementForReview, setActiveStatementForReview] = useState<StatementItem | null>(null);

  // App data state
  const [statements, setStatements] = useState<StatementItem[]>(INITIAL_STATEMENTS);

  // Transitions
  const handleStartApp = (initialTab: 'record' | 'statements' | 'statistics' | 'benchmark' = 'record') => {
    setAppTab(initialTab);
    setActiveStatementForReview(null);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLanding = () => {
    setViewMode('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatementCreated = (newStatement: StatementItem) => {
    setStatements((prev) => [newStatement, ...prev]);
    setActiveStatementForReview(newStatement);
    setAppTab('record');
  };

  const handleUpdateStatement = (updated: StatementItem) => {
    setStatements((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setActiveStatementForReview(updated);
  };

  const handleDeleteStatement = (id: string) => {
    setStatements((prev) => prev.filter((s) => s.id !== id));
    if (activeStatementForReview?.id === id) {
      setActiveStatementForReview(null);
    }
  };

  const handleSelectStatementForReview = (statement: StatementItem) => {
    setActiveStatementForReview(statement);
    setAppTab('statements');
  };

  // Render Landing Page if in landing view
  if (viewMode === 'landing') {
    return <LandingPage onStartApp={handleStartApp} />;
  }

  // Otherwise render In-App Workspace
  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#171310] dark:bg-[#0d0705] dark:text-[#f6f1ea] selection:bg-[#c65a34] selection:text-white flex flex-col font-inter">
      {/* Top Header */}
      <InAppHeader
        currentTab={appTab}
        onSelectTab={(tab) => {
          setActiveStatementForReview(null);
          setAppTab(tab);
        }}
        onGoToLanding={handleGoToLanding}
        statementsCount={statements.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1">
        {/* If an active statement is being reviewed, show ReviewScreen */}
        {activeStatementForReview ? (
          <ReviewScreen
            statement={activeStatementForReview}
            onUpdateStatement={handleUpdateStatement}
            onBack={() => setActiveStatementForReview(null)}
          />
        ) : (
          <>
            {appTab === 'record' && (
              <RecordScreen onStatementCreated={handleStatementCreated} />
            )}

            {appTab === 'statements' && (
              <StatementsScreen
                statements={statements}
                onSelectStatement={handleSelectStatementForReview}
                onNewIntake={() => {
                  setActiveStatementForReview(null);
                  setAppTab('record');
                }}
                onDeleteStatement={handleDeleteStatement}
              />
            )}

            {appTab === 'statistics' && (
              <StatisticsScreen
                statements={statements}
                onOpenBenchmark={() => setAppTab('benchmark')}
              />
            )}

            {appTab === 'benchmark' && <BenchmarkView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/10 py-6 px-4 sm:px-8 text-center text-xs text-[#171310]/50 dark:text-[#f6f1ea]/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-sora font-semibold">
            <span>Sauti Legal Intake Platform</span>
            <span>•</span>
            <span>Sahara CodeSwitch Africa Challenge</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleGoToLanding} className="hover:underline cursor-pointer">
              Marketing Landing Page
            </button>
            <span>•</span>
            <span>Consent-First Voice Intake</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
