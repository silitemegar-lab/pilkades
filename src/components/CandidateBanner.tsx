import React from 'react';
import { CANDIDATES, RTResult } from '../types';
import { CheckCircle, Award, BarChart3, Users } from 'lucide-react';

interface CandidateBannerProps {
  rtResults: RTResult[];
  filterDusun?: string;
  isUserView?: boolean;
}

export const CandidateBanner: React.FC<CandidateBannerProps> = ({
  rtResults,
  filterDusun,
  isUserView = false,
}) => {
  // Compute totals
  const filtered = filterDusun && filterDusun !== 'ALL'
    ? rtResults.filter((r) => r.dusun === filterDusun)
    : rtResults;

  const totalDpt = filtered.reduce((acc, r) => acc + r.totalDpt, 0);
  const votesLatif = filtered.reduce((acc, r) => acc + r.votesLatif, 0);
  const votesMunjilin = filtered.reduce((acc, r) => acc + r.votesMunjilin, 0);
  const votesSigit = filtered.reduce((acc, r) => acc + r.votesSigit, 0);
  const votesMakful = filtered.reduce((acc, r) => acc + r.votesMakful, 0);
  const invalidVotes = filtered.reduce((acc, r) => acc + r.invalidVotes, 0);
  const totalVotesCast = votesLatif + votesMunjilin + votesSigit + votesMakful + invalidVotes;

  const getVotesForCandidate = (id: string) => {
    switch (id) {
      case 'ahmad_latif_usman':
        return votesLatif;
      case 'munjilin':
        return votesMunjilin;
      case 'sigit':
        return votesSigit;
      case 'makful':
        return votesMakful;
      default:
        return 0;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Kandidat Calon Kepala Desa</span>
          </h2>
          <p className="text-xs text-slate-500">
            {filterDusun && filterDusun !== 'ALL'
              ? `Hasil perolehan suara di wilayah ${filterDusun} (${filtered.length} RT)`
              : `Hasil perolehan suara total seluruh desa (28 RT / 4 Dusun)`}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Total DPT: <strong>{totalDpt.toLocaleString('id-ID')}</strong></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Suara Masuk: <strong>{totalVotesCast.toLocaleString('id-ID')}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Candidates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {CANDIDATES.map((candidate) => {
          const votes = getVotesForCandidate(candidate.id);
          const percent = totalVotesCast > 0 ? ((votes / totalVotesCast) * 100).toFixed(1) : '0.0';
          const isMain = candidate.isMainCandidate;

          return (
            <div
              key={candidate.id}
              id={`candidate-card-${candidate.ballotNumber}`}
              className={`relative rounded-xl p-4 transition-all duration-200 ${
                isMain
                  ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {isMain && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle className="w-3 h-3" />
                  Jagoan Kita
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                      isMain
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {candidate.ballotNumber}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold leading-tight ${isMain ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {candidate.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      No. Urut {candidate.ballotNumber} &bull; {candidate.nickname}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    {votes.toLocaleString('id-ID')}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isMain ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(2, parseFloat(percent)))}%`,
                      backgroundColor: candidate.color,
                    }}
                  />
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 italic line-clamp-1">
                "{candidate.tagline}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
