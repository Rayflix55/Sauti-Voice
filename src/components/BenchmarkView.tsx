import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, Download, FileText, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { BenchmarkItem, BenchmarkSummary } from '../types.js';

export const BenchmarkView: React.FC = () => {
  const [summaries, setSummaries] = useState<BenchmarkSummary[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string>('clip_01_alaba_burglary.wav');

  const fetchBenchmarkData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/benchmark');
      if (res.ok) {
        const data = await res.json();
        setSummaries(data.summaries);
        setRows(data.rows);
      }
    } catch (err) {
      console.error('Failed to load benchmark data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarkData();
  }, []);

  const uniqueClips = Array.from(new Set(rows.map((r) => r.filename)));

  const clipRows = rows.filter((r) => r.filename === selectedClip);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-semibold text-[#e87a45] uppercase tracking-wider mb-1">
            Sahara CodeSwitch Africa Challenge
          </div>
          <h1 className="font-sora font-bold text-2xl sm:text-3xl text-[#171310] dark:text-[#f6f1ea]">
            ASR Model Benchmark Report
          </h1>
          <p className="text-xs text-[#171310]/70 dark:text-[#f6f1ea]/70 mt-1">
            Evaluating Intron Sahara against OpenAI Whisper and Google Speech-to-Text on Nigerian code-switched complaints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBenchmarkData}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-white dark:bg-[#171310] border border-black/10 dark:border-white/10 text-xs font-semibold text-[#171310] dark:text-white flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-Run Benchmark</span>
          </button>
        </div>
      </div>

      {/* Summary Table Card */}
      <div className="bg-white dark:bg-[#171310] rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-bold text-base sm:text-lg text-[#171310] dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#e87a45]" />
            <span>Model Performance Summary</span>
          </h2>
          <span className="text-[10px] text-[#171310]/60 dark:text-white/60">
            Across 6 Standardized Legal Narratives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider bg-[#f6f1ea] dark:bg-[#0c0908] text-[#171310]/80 dark:text-white/80">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">ASR Model</th>
                <th className="py-3 px-4">Overall WER</th>
                <th className="py-3 px-4">Code-Switched WER</th>
                <th className="py-3 px-4">Named Entity Accuracy</th>
                <th className="py-3 px-4 rounded-r-xl">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {summaries.map((s, idx) => {
                const isSahara = s.model.includes('Sahara');
                return (
                  <tr
                    key={idx}
                    className={`${
                      isSahara
                        ? 'bg-[#c65a34]/5 font-semibold dark:bg-[#c65a34]/10'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      <span className="font-bold text-[#171310] dark:text-white">{s.model}</span>
                      {isSahara && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#e87a45] text-white">
                          Winner
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isSahara ? 'text-[#4c5a2f] dark:text-[#8fd6a8] font-bold' : ''}>
                        {s.avg_wer_overall}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isSahara ? 'text-[#4c5a2f] dark:text-[#8fd6a8] font-bold' : ''}>
                        {s.avg_wer_code_switched}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isSahara
                            ? 'text-[#4c5a2f] dark:text-[#8fd6a8] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-950/40'
                            : ''
                        }`}
                      >
                        {s.avg_entity_accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{s.avg_latency_ms}ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive / Qualitative Side-by-Side Comparison */}
      <div className="bg-white dark:bg-[#171310] rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-sora font-bold text-base text-[#171310] dark:text-white">
              Qualitative Side-by-Side Comparison
            </h3>
            <p className="text-xs text-[#171310]/70 dark:text-[#f6f1ea]/70 mt-0.5">
              Inspect how each ASR engine translates specific Nigerian landmarks, names, and code-switched terms.
            </p>
          </div>

          {/* Clip selector */}
          <select
            value={selectedClip}
            onChange={(e) => setSelectedClip(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[#f6f1ea] dark:bg-[#0c0908] border border-black/10 dark:border-white/15 outline-none"
          >
            {uniqueClips.map((clip) => (
              <option key={clip} value={clip}>
                {clip}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {clipRows.map((r, i) => {
            const isSahara = r.model.includes('Sahara');
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border transition-all ${
                  isSahara
                    ? 'bg-[#c65a34]/5 border-[#c65a34]/40 dark:bg-[#c65a34]/10'
                    : 'bg-[#f6f1ea]/50 dark:bg-white/[0.03] border-black/5 dark:border-white/5'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#171310] dark:text-white">{r.model}</span>
                    {isSahara && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#f3d9d6] text-[#8a3a2a] font-bold">
                        Top Entity Accuracy
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>WER: {(r.wer * 100).toFixed(1)}%</span>
                    <span>Entity Match: {(r.entity_match_rate * 100).toFixed(1)}%</span>
                    <span className="text-black/50 dark:text-white/50">{r.latency_ms}ms</span>
                  </div>
                </div>

                <p className="text-xs text-[#171310]/80 dark:text-white/90 leading-relaxed font-mono bg-white dark:bg-[#0c0908] p-3 rounded-xl border border-black/5 dark:border-white/10">
                  "{r.transcript}"
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLI Instruction Card */}
      <div className="bg-[#171310] text-[#f6f1ea] rounded-3xl p-6 border border-white/10 shadow-lg">
        <h3 className="font-sora font-bold text-sm text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#e87a45]" />
          <span>Standalone Benchmark CLI Script</span>
        </h3>
        <p className="text-xs text-white/70 mb-3 leading-relaxed">
          The standalone benchmarking script requested in the challenge is located at <code>benchmark/run_benchmark.ts</code> and can be run or automated on any folder of audio clips:
        </p>
        <div className="bg-[#0c0908] p-3 rounded-xl font-mono text-xs text-[#8fd6a8] border border-white/10 flex items-center justify-between">
          <span>npx tsx benchmark/run_benchmark.ts</span>
        </div>
      </div>
    </div>
  );
};
