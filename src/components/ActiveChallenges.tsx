import React, { useState, useEffect } from "react";
import { Timer, Trophy, HelpCircle, FileText, UploadCloud, Sparkles, CheckSquare } from "lucide-react";
import { Challenge, Submission, UserProfile } from "../types";
import { DbManager } from "../dbMock";
import SubmissionCard from "./SubmissionCard";

interface ActiveChallengesProps {
  currentUser: UserProfile | null;
  onSelectSubmission: (sub: Submission) => void;
  onOpenUpload: (challengeId: string) => void;
}

export default function ActiveChallenges({
  currentUser,
  onSelectSubmission,
  onOpenUpload
}: ActiveChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState<Submission[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const list = DbManager.getChallenges();
    setChallenges(list);
    
    const active = list.find(c => c.status === "active") || null;
    setActiveChallenge(active);
    
    const past = list.filter(c => c.status === "completed");
    setCompletedChallenges(past);

    if (active) {
      // Get submissions specific to this active challenge
      const subs = DbManager.getSubmissions().filter(s => s.challengeId === active.id);
      setChallengeSubmissions(subs);
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!activeChallenge) return;

    const timer = setInterval(() => {
      const difference = +new Date(activeChallenge.endDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeChallenge]);

  return (
    <div className="w-full space-y-12 animate-fade-in font-sans">
      
      {/* Banner + Hero challenge Section */}
      {activeChallenge ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#111] rounded-3xl border border-white/5 p-6 md:p-10 flex flex-col lg:flex-row gap-8 items-center">
          {/* Abstract glows */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
          
          <div className="flex-1 space-y-6 relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Live Weekly Challenge
            </span>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight uppercase">
                {activeChallenge.title}
              </h1>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl">
                {activeChallenge.description}
              </p>
            </div>

            {/* Countdown timers */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-3xl font-display font-bold text-white shadow-inner">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <span className="text-[10px] text-gray-550 uppercase font-mono mt-1 font-bold">Days</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-3xl font-display font-bold text-white">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <span className="text-[10px] text-gray-550 uppercase font-mono mt-1 font-bold">Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-3xl font-display font-bold text-indigo-400 animate-pulse">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <span className="text-[10px] text-gray-550 uppercase font-mono mt-1 font-bold">Minutes</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-3xl font-display font-bold text-gray-400">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <span className="text-[10px] text-gray-550 uppercase font-mono mt-1 font-bold">Seconds</span>
              </div>
            </div>

            {/* Submitting to active challenge CTA */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onOpenUpload(activeChallenge.id)}
                className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm transition-all hover:bg-slate-205 uppercase tracking-wider cursor-pointer"
              >
                Submit Your Entry
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[380px] bg-[#141414] rounded-3xl border border-white/5 p-6 space-y-6 self-stretch flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Submission Guidelines
              </h3>
              
              <ul className="space-y-2.5 text-xs text-gray-300">
                {activeChallenge.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-indigo-450 font-bold">•</span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Winner Prize reward</span>
                <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {activeChallenge.prize}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#141414] rounded-3xl border border-dashed border-white/5">
          <p className="text-gray-400 text-sm">No active design challenges running today.</p>
        </div>
      )}

      {/* Active Submissions section */}
      {activeChallenge && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                Challenge Submissions ({challengeSubmissions.length})
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Benchmarks are determined exclusively by AI-evaluation criteria. Likes or comments are decorative.
              </p>
            </div>
          </div>

          {challengeSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-black/10 border border-white/5 rounded-xl text-center space-y-2">
              <Timer className="w-10 h-10 text-gray-600" />
              <p className="text-sm text-gray-400">No submissions uploaded for this campaign yet.</p>
              <p className="text-xs text-gray-500">Be the first to benchmark your rebrand!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {challengeSubmissions.map(sub => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  onSelect={onSelectSubmission}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Historical Winners Spotlight section */}
      <div className="space-y-6 pt-6">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
            🏆 Winner Recognition & Archives
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse through previous weekly challenge champions styled in the Spotlight Registry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedChallenges.map(hist => (
            <div key={hist.id} className="bg-[#141414] rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row gap-6 items-start hover:border-white/10 hover:shadow-xl transition-all">
              
              {/* Box Image preview */}
              {hist.winnerSubmissionImage && (
                <div className="w-full md:w-36 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-black border border-white/5 shrink-0">
                  <img src={hist.winnerSubmissionImage} alt={hist.winnerSubmissionTitle} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Box Info details */}
              <div className="flex-1 space-y-3">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  COMPLETED CAMPAIGN
                </span>
                
                <div>
                  <h3 className="text-xs text-gray-400 font-mono">Theme: {hist.title}</h3>
                  <h4 className="text-sm font-display font-bold text-white mt-0.5">
                    {hist.winnerSubmissionTitle || "Archived Design Masterpiece"}
                  </h4>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 fill-amber-400/20" />
                    Weekly Winner: {hist.winnerDisplayName}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Award: {hist.prize}
                  </p>
                </div>
              </div>

            </div>
          ))}

          {completedChallenges.length === 0 && (
            <div className="col-span-2 py-12 text-center bg-[#111] border border-white/5 rounded-3xl">
              <span className="text-xs text-gray-550">Spotlight archives are empty. Winner records will trigger after challenge timelines close.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
