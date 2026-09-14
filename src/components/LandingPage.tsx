import React, { useState } from 'react';
import { Shield, Sparkles, Scale, BookOpen, ChevronRight, X, ArrowRight, Check } from 'lucide-react';

interface LandingPageProps {
  onStartApp: (initialTab?: 'record' | 'statements' | 'statistics' | 'benchmark') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApp }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen text-[#f6f1ea] selection:bg-[#c65a34] selection:text-white" style={{ background: '#0d0705' }}>
      {/* ============ HERO SECTION (Exact voice.ai / Sauti structure) ============ */}
      <div
        className="relative overflow-hidden px-6 sm:px-12 pt-7 pb-16 min-h-[820px]"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 15% 15%, rgba(198,90,52,0.55), transparent 55%),
            radial-gradient(ellipse 80% 60% at 85% 85%, rgba(122,47,28,0.5), transparent 55%),
            linear-gradient(160deg, #2a120c 0%, #170b08 60%, #0d0705 100%)
          `,
        }}
      >
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between max-w-[1240px] mx-auto mb-16 sm:mb-20">
          <div
            className="flex items-center gap-2.5 font-sora font-bold text-xl tracking-tight cursor-pointer"
            onClick={() => onStartApp('record')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f6f1ea"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            <span>sauti</span>
          </div>

          <div className="hidden md:flex gap-8 text-[14.5px] text-[#f6f1ea]/75 font-medium">
            <button
              onClick={() => setActiveModal('how-it-works')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => setActiveModal('institutions')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              For institutions
            </button>
            <button
              onClick={() => onStartApp('benchmark')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Benchmark
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>

          <button
            onClick={() => onStartApp('record')}
            className="bg-[#f6f1ea] text-[#171310] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg whitespace-nowrap cursor-pointer"
          >
            Start Free
          </button>
        </nav>

        {/* Hero Grid */}
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 items-center">
          <div>
            <div className="text-[12.5px] font-semibold tracking-[0.16em] uppercase text-[#f6f1ea]/60 mb-5 max-w-[380px] leading-relaxed">
              THE VOICE AI PLATFORM POWERING CODE-SWITCHED COMPLAINT INTAKE, STATEMENT STRUCTURING, AND CIVIC ACCESS TO JUSTICE
            </div>

            <h1 className="font-sora font-bold text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] tracking-[-0.01em] mb-7 text-white">
              Every Spoken Complaint, Captured Exactly As It Was Said
            </h1>

            <div className="flex gap-2.5 flex-wrap mb-8">
              <div className="border border-[#f6f1ea]/25 rounded-full px-4 py-2 text-[13.5px] text-[#f6f1ea]/85 bg-[#f6f1ea]/[0.04] backdrop-blur-sm">
                Code-Switch AI
              </div>
              <div className="border border-[#f6f1ea]/25 rounded-full px-4 py-2 text-[13.5px] text-[#f6f1ea]/85 bg-[#f6f1ea]/[0.04] backdrop-blur-sm">
                Statement Builder
              </div>
              <div className="border border-[#f6f1ea]/25 rounded-full px-4 py-2 text-[13.5px] text-[#f6f1ea]/85 bg-[#f6f1ea]/[0.04] backdrop-blur-sm">
                Consent-First
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onStartApp('record')}
                className="bg-[#e87a45] hover:bg-[#c65a34] text-white px-7 py-3 rounded-full font-semibold text-[15px] flex items-center gap-2 shadow-xl hover:shadow-[#e87a45]/30 transition-all cursor-pointer"
              >
                <span>Launch Intake App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartApp('statements')}
                className="border border-[#f6f1ea]/30 hover:border-white/60 text-[#f6f1ea] px-6 py-3 rounded-full text-sm font-medium transition-colors cursor-pointer"
              >
                View Statements (3)
              </button>
            </div>
          </div>

          {/* Hero Visual: 3 Staggered Phone Mockups & Floating Glass Cards */}
          <div className="relative h-[640px] hidden md:block select-none">
            {/* Phone 1: Welcome & Speech Quality */}
            <div
              onClick={() => onStartApp('record')}
              className="absolute w-[220px] h-[460px] rounded-[32px] bg-[#0c0908] p-2 shadow-[0_40px_90px_rgba(0,0,0,0.55)] cursor-pointer hover:scale-105 transition-transform duration-300 z-10"
              style={{ left: 0, top: '70px', transform: 'rotate(-9deg)' }}
            >
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-[#f6f1ea] text-[#171310] flex flex-col relative p-1">
                <div className="flex justify-between text-[9px] px-3.5 pt-2.5 pb-1 opacity-60">
                  <span>9:41</span>
                  <span>●●●●</span>
                </div>

                <div className="m-2.5 rounded-[18px] bg-[#171310] text-[#f6f1ea] p-3.5 flex-none relative h-[150px]">
                  <div className="absolute top-2.5 right-2.5 bg-[#f6f1ea] text-[#171310] rounded-[10px] px-2 py-1 text-[8px] font-semibold">
                    96% Match
                  </div>
                  <div className="w-[52px] h-[52px] rounded-full border-4 border-[#f6f1ea]/15 border-t-[#e87a45] flex items-center justify-center text-[11px] font-bold mt-4">
                    94%
                  </div>
                  <div className="absolute right-3.5 bottom-3.5 flex items-end gap-[3px]">
                    <div className="w-[5px] h-2 bg-[#e87a45] rounded-xs animate-pulse" />
                    <div className="w-[5px] h-3.5 bg-[#e87a45] rounded-xs animate-pulse delay-75" />
                    <div className="w-[5px] h-2.5 bg-[#e87a45] rounded-xs animate-pulse delay-100" />
                    <div className="w-[5px] h-5 bg-[#e87a45] rounded-xs animate-pulse delay-150" />
                    <div className="w-[5px] h-4 bg-[#e87a45] rounded-xs animate-pulse delay-200" />
                  </div>
                </div>

                <div className="font-sora font-bold text-[15px] text-center mt-5 px-4 text-[#171310]">
                  Welcome to Sauti!
                </div>
                <div className="text-[9.5px] text-center opacity-60 mt-2 px-6 leading-relaxed text-[#171310]">
                  Turn spoken testimony into structured, accurate legal statements.
                </div>
                <div className="mx-5 mt-4 bg-[#171310] text-[#f6f1ea] text-center py-2.5 rounded-full text-[11px] font-semibold hover:bg-black transition-colors">
                  Record Intake
                </div>
              </div>
            </div>

            {/* Phone 2: Statements List */}
            <div
              onClick={() => onStartApp('statements')}
              className="absolute w-[220px] h-[460px] rounded-[32px] bg-[#0c0908] p-2 shadow-[0_40px_90px_rgba(0,0,0,0.55)] cursor-pointer hover:scale-105 transition-transform duration-300 z-20"
              style={{ left: '150px', top: '0px', transform: 'rotate(3deg)' }}
            >
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-[#f6f1ea] text-[#171310] flex flex-col relative p-1">
                <div className="flex justify-between text-[9px] px-3.5 pt-2.5 pb-1 opacity-60">
                  <span>9:41</span>
                  <span>●●●●</span>
                </div>

                <div className="px-4 pt-2 pb-1 font-sora font-bold text-base text-[#171310]">Statements</div>
                <div className="flex gap-3 px-4 py-2 text-[9.5px] text-[#171310]/50">
                  <span className="text-[#171310] font-bold border-b-2 border-[#171310] pb-1">Draft</span>
                  <span>In Review</span>
                  <span>Finalized</span>
                </div>

                {/* Card 1 */}
                <div className="mx-3.5 my-2 bg-white rounded-[14px] p-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-black/5">
                  <div className="text-[10.5px] font-bold mb-1 text-[#171310]">Amaka Okafor — Theft Report</div>
                  <div className="text-[8.5px] text-[#171310]/60 leading-tight mb-2">
                    Missing: location of incident. Awaiting officer confirmation.
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-[8px] bg-[#f3d9d6] text-[#8a3a2a]">
                      Yoruba–English
                    </span>
                    <span className="text-[8px] opacity-50">Today</span>
                  </div>
                  <div className="h-[3px] bg-[#eee] rounded-xs mt-2 overflow-hidden">
                    <div className="h-full bg-[#c65a34] w-[60%]" />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="mx-3.5 my-1 bg-white rounded-[14px] p-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-black/5">
                  <div className="text-[10.5px] font-bold mb-1 text-[#171310]">Tunde Bello — Assault Report</div>
                  <div className="text-[8.5px] text-[#171310]/60 leading-tight mb-2">
                    All required fields confirmed and signed.
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-bold px-2 py-0.5 rounded-[8px] bg-[#e4e9d8] text-[#4c5a2f]">
                      Pidgin–English
                    </span>
                    <span className="text-[8px] opacity-50">Yesterday</span>
                  </div>
                  <div className="h-[3px] bg-[#eee] rounded-xs mt-2 overflow-hidden">
                    <div className="h-full bg-[#c65a34] w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Phone 3: Statistics */}
            <div
              onClick={() => onStartApp('statistics')}
              className="absolute w-[220px] h-[460px] rounded-[32px] bg-[#0c0908] p-2 shadow-[0_40px_90px_rgba(0,0,0,0.55)] cursor-pointer hover:scale-105 transition-transform duration-300 z-0"
              style={{ left: '290px', top: '110px', transform: 'rotate(13deg)' }}
            >
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-[#f6f1ea] text-[#171310] flex flex-col relative p-1">
                <div className="flex justify-between text-[9px] px-3.5 pt-2.5 pb-1 opacity-60">
                  <span>9:41</span>
                  <span>●●●●</span>
                </div>

                <div className="px-4 pt-2.5 pb-2 font-sora font-bold text-[15px] text-[#171310]">Statistics</div>

                <div className="flex gap-2 px-3.5 mb-2">
                  <div className="flex-1 bg-white rounded-xl p-2 shadow-[0_6px_16px_rgba(0,0,0,0.05)]">
                    <div className="font-sora font-bold text-[15px] text-[#171310]">18</div>
                    <div className="text-[7.5px] opacity-60">Statements this week</div>
                  </div>
                  <div className="flex-1 bg-[#f3d9d6] rounded-xl p-2 shadow-[0_6px_16px_rgba(0,0,0,0.05)]">
                    <div className="font-sora font-bold text-[15px] text-[#8a3a2a]">2</div>
                    <div className="text-[7.5px] text-[#8a3a2a]/80">Needs review</div>
                  </div>
                </div>

                <div className="mx-3.5 mb-2 bg-[#171310] text-[#f6f1ea] rounded-xl p-3">
                  <div className="font-sora font-bold text-[18px]">96.2%</div>
                  <div className="text-[8px] opacity-60 mt-0.5">Avg. entity accuracy (Sahara)</div>
                  <div className="flex items-end gap-1.5 h-[34px] mt-2">
                    <div className="flex-1 bg-[#e87a45] rounded-xs opacity-90 h-[40%]" />
                    <div className="flex-1 bg-[#e87a45] rounded-xs opacity-90 h-[70%]" />
                    <div className="flex-1 bg-[#e87a45] rounded-xs opacity-90 h-[55%]" />
                    <div className="flex-1 bg-[#e87a45] rounded-xs opacity-90 h-[90%]" />
                    <div className="flex-1 bg-[#e87a45] rounded-xs opacity-90 h-[65%]" />
                  </div>
                </div>

                <div className="flex gap-2 px-3.5">
                  <div className="flex-1 bg-white rounded-xl p-2 shadow-[0_6px_16px_rgba(0,0,0,0.05)]">
                    <div className="font-sora font-bold text-[15px] text-[#171310]">1.4s</div>
                    <div className="text-[7.5px] opacity-60">Avg. transcription time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Glass Card 1 (Live Transcription) */}
            <div
              className="absolute top-5 right-0 bg-white/[0.08] border border-white/20 backdrop-blur-md rounded-2xl p-3.5 w-[195px] text-[11.5px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-30 pointer-events-none"
            >
              <div className="font-semibold mb-2 text-xs text-white">Live Transcription</div>
              <div className="flex items-center gap-2 text-white/90 text-[11px]">
                <div className="flex gap-0.5 items-center">
                  <div className="w-[2.5px] h-1.5 bg-[#e87a45] rounded-xs animate-pulse" />
                  <div className="w-[2.5px] h-3 bg-[#e87a45] rounded-xs animate-pulse delay-75" />
                  <div className="w-[2.5px] h-2 bg-[#e87a45] rounded-xs animate-pulse delay-100" />
                  <div className="w-[2.5px] h-4 bg-[#e87a45] rounded-xs animate-pulse delay-150" />
                  <div className="w-[2.5px] h-2.5 bg-[#e87a45] rounded-xs animate-pulse delay-200" />
                  <div className="w-[2.5px] h-3.5 bg-[#e87a45] rounded-xs animate-pulse delay-300" />
                </div>
                <span>Detecting: Yoruba–English</span>
              </div>
            </div>

            {/* Floating Glass Card 2 (Statement Check) */}
            <div
              className="absolute bottom-8 right-5 bg-white/[0.08] border border-white/20 backdrop-blur-md rounded-2xl p-3.5 w-[195px] text-[11.5px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-30 pointer-events-none"
            >
              <div className="font-semibold mb-2.5 text-xs text-white">Statement Check</div>
              <div className="flex justify-between mb-1.5 text-[11px]">
                <span className="text-white/80">Complainant name</span>
                <span className="text-[#8fd6a8] font-bold">✓</span>
              </div>
              <div className="flex justify-between mb-1.5 text-[11px]">
                <span className="text-white/80">Date & time</span>
                <span className="text-[#8fd6a8] font-bold">✓</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/80">Location</span>
                <span className="text-[#e87a45] font-semibold">Missing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Narrative & Challenge Track Section */}
      <div className="max-w-[1240px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#171310] border border-white/10 rounded-2xl p-8 hover:border-[#c65a34]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c65a34]/20 border border-[#c65a34]/40 flex items-center justify-center text-[#e87a45] mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-sora font-bold text-xl mb-3 text-white">Code-Switched ASR</h3>
            <p className="text-sm text-[#f6f1ea]/70 leading-relaxed">
              Powered by Intron Sahara, trained specifically on authentic African accents, Nigerian Pidgin, and Yoruba-English code-switching that standard speech models garble.
            </p>
          </div>

          <div className="bg-[#171310] border border-white/10 rounded-2xl p-8 hover:border-[#c65a34]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c65a34]/20 border border-[#c65a34]/40 flex items-center justify-center text-[#e87a45] mb-5">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-sora font-bold text-xl mb-3 text-white">First-Mile Legal Intake</h3>
            <p className="text-sm text-[#f6f1ea]/70 leading-relaxed">
              Turns unstructured, emotional speech into formal police & legal aid statements with automatic missing field detection ("Location not mentioned — please verify").
            </p>
          </div>

          <div className="bg-[#171310] border border-white/10 rounded-2xl p-8 hover:border-[#c65a34]/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#c65a34]/20 border border-[#c65a34]/40 flex items-center justify-center text-[#e87a45] mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-sora font-bold text-xl mb-3 text-white">Ethics & Consent-First</h3>
            <p className="text-sm text-[#f6f1ea]/70 leading-relaxed">
              Default process-and-discard policy for citizen audio. Human officer review gate prevents unsupervised AI filing, preserving chain-of-custody integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Info Modals / Drawers */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171310] border border-white/15 rounded-2xl max-w-xl w-full p-6 sm:p-8 text-[#f6f1ea] relative shadow-2xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-[#f6f1ea]/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'how-it-works' && (
              <div>
                <h2 className="font-sora font-bold text-2xl mb-4 text-white">How Sauti Works</h2>
                <div className="space-y-4 text-sm text-[#f6f1ea]/80 leading-relaxed">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e87a45] text-white flex items-center justify-center font-bold text-xs flex-none">1</span>
                    <p><strong>Citizen Speaks Naturally:</strong> Complainant narrates incident in English, Pidgin, or Yoruba-English without intimidation.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e87a45] text-white flex items-center justify-center font-bold text-xs flex-none">2</span>
                    <p><strong>Sahara ASR Engine:</strong> Transcribes dialect and code-switched terms accurately, preserving Nigerian landmarks, names, and plate numbers.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e87a45] text-white flex items-center justify-center font-bold text-xs flex-none">3</span>
                    <p><strong>LLM Legal Structuring:</strong> Organizes testimony into complainant, date/time, location, narrative, witnesses, and flags any missing required details.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e87a45] text-white flex items-center justify-center font-bold text-xs flex-none">4</span>
                    <p><strong>Officer Sign-off & PDF Export:</strong> Intake officer amends missing details with the citizen, confirms accuracy, and exports an official signed statement PDF.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'institutions' && (
              <div>
                <h2 className="font-sora font-bold text-2xl mb-4 text-white">For Police & Legal Aid Desks</h2>
                <p className="text-sm text-[#f6f1ea]/80 mb-4 leading-relaxed">
                  Sauti bridges the documentation gap at station front desks, community legal clinics, and human rights commissions across Nigeria and West Africa.
                </p>
                <div className="space-y-2.5 text-sm text-[#f6f1ea]/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#8fd6a8]" />
                    <span>Eliminates handwriting ambiguity and lost details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#8fd6a8]" />
                    <span>Saves 80% officer intake drafting time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#8fd6a8]" />
                    <span>Standardizes evidentiary record for prosecution</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <h2 className="font-sora font-bold text-2xl mb-4 text-white">Privacy & Ethics Policy</h2>
                <div className="space-y-3 text-sm text-[#f6f1ea]/80 leading-relaxed">
                  <p>
                    <strong>Process-and-Discard Audio:</strong> By default, citizen voice audio is processed in-memory for transcription and immediately purged from the server unless the citizen gives explicit consent for model evaluation.
                  </p>
                  <p>
                    <strong>Human Oversight Required:</strong> AI never signs or finalizes a legal complaint. The reviewing officer must confirm and sign off before formal generation.
                  </p>
                  <p>
                    <strong>Confidentiality:</strong> Intron Sahara API transmissions utilize end-to-end TLS encryption compliant with Nigerian Data Protection Act (NDPA).
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setActiveModal(null);
                  onStartApp('record');
                }}
                className="bg-[#e87a45] hover:bg-[#c65a34] text-white px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
              >
                Go to App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
