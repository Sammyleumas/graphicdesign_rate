import React, { useState, useEffect } from "react";
import { Award, Trophy, Heart, Eye, ArrowUpRight, ShieldCheck, Star } from "lucide-react";
import { Submission, UserProfile } from "../types";
import { DbManager } from "../dbMock";

interface LeaderboardProps {
  onSelectSubmission: (sub: Submission) => void;
}

type TabType = "week" | "month" | "all_time";
type DisplayMode = "designers" | "artworks";

export default function Leaderboard({ onSelectSubmission }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("week");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("designers");

  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [topSubmissions, setTopSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    // 1. Gather Users and Sort for Leaderboard
    const users = DbManager.getUsers();
    
    // Sort logic depends on tab selection
    let sortedUsers = [...users];
    if (activeTab === "week") {
      // Sort primarily by weekly challenge wins + scores index
      sortedUsers.sort((a, b) => b.competitionWins - a.competitionWins || b.totalSubmissions - a.totalSubmissions);
    } else if (activeTab === "month") {
      sortedUsers.sort((a, b) => b.totalSubmissions - a.totalSubmissions || b.competitionWins - a.competitionWins);
    } else {
      sortedUsers.sort((a, b) => (b.competitionWins * 10 + b.totalSubmissions) - (a.competitionWins * 10 + a.totalSubmissions));
    }

    setTopUsers(sortedUsers.filter(u => u.role !== "Admin")); // Hide admin from designers boards

    // 2. Gather Submissions and Sort (Artworks board)
    const subs = DbManager.getSubmissions();
    let sortedSubs = [...subs];
    if (activeTab === "week") {
      // Weekly trending submissions (Highest viewCount or overall score)
      sortedSubs.sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0));
    } else if (activeTab === "month") {
      sortedSubs.sort((a, b) => b.likesCount - a.likesCount);
    } else {
      sortedSubs.sort((a, b) => b.viewsCount - a.viewsCount);
    }

    setTopSubmissions(sortedSubs);
  }, [activeTab, displayMode]);

  return (
    <div className="w-full space-y-8 animate-fade-in font-sans">
      
      {/* Visual Board Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            Platform Leaderboards
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time standings computed through mathematical AI-scoring matrices on strict technical specifications.
          </p>
        </div>

        {/* Tab display options */}
        <div className="flex items-center gap-2 bg-[#12141a] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setDisplayMode("designers")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              displayMode === "designers"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Elite Designers
          </button>
          <button
            onClick={() => setDisplayMode("artworks")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              displayMode === "artworks"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Trending Artworks
          </button>
        </div>
      </div>

      {/* Leaderboard filters (Weekly, Monthly, All-time) */}
      <div className="flex items-center gap-4 bg-white/[0.01] p-3 rounded-lg border border-white/5">
        <span className="text-xs text-gray-500 uppercase font-mono tracking-wider">Historical Windows:</span>
        <div className="flex gap-2">
          {(["week", "month", "all_time"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded transition-all capitalize font-medium ${
                activeTab === tab
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {tab === "all_time" ? "All Time" : `This ${tab}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Boards Section */}
      {displayMode === "designers" ? (
        <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1A1A1A] border-b border-white/5 text-xs text-gray-400 font-mono">
            <div className="col-span-2">Rank</div>
            <div className="col-span-5 md:col-span-6">Designer Profile</div>
            <div className="col-span-3 md:col-span-2 text-center">Achievements</div>
            <div className="col-span-2 text-right">Wins / Projects</div>
          </div>

          <div className="divide-y divide-white/5">
            {topUsers.map((user, idx) => {
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
              
              return (
                <div key={user.uid} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/[0.01] transition-colors">
                  
                  {/* Rank Column */}
                  <div className="col-span-2 flex items-center gap-2">
                    {medal ? (
                      <span className="text-xl md:text-2xl">{medal}</span>
                    ) : (
                      <span className="text-sm font-mono font-bold text-gray-500 block pl-1">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Profile Column */}
                  <div className="col-span-5 md:col-span-6 flex items-center gap-3">
                    <img src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80"} alt={user.displayName} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-white/5" />
                    
                    <div>
                      <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                        {user.displayName}
                        {user.role === "Judge" && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono px-1 py-0.5 rounded tracking-wide uppercase">
                            JUDGE BOARD
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 max-w-sm hidden md:block">
                        {user.bio || "Crafting vector interfaces and logo systems."}
                      </p>
                    </div>
                  </div>

                  {/* Badges Column */}
                  <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-1.5">
                    {user.achievementBadges && user.achievementBadges.length > 0 ? (
                      <div className="flex gap-1">
                        {user.achievementBadges.slice(0, 3).map(badge => {
                          const icon = badge === "original_creator" ? "🎨" : badge === "gold_standard" ? "🌟" : badge === "weekly_winner" ? "👑" : "🏆";
                           return (
                            <span key={badge} className="text-base" title={badge.replace("_", " ")}>
                              {icon}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-650 font-mono italic">No badges</span>
                    )}
                  </div>

                  {/* Submissions Stats Column */}
                  <div className="col-span-2 text-right">
                    <div className="text-sm font-mono font-semibold text-white">
                      {user.competitionWins} <span className="text-gray-500 text-xs font-normal">Wins</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono font-medium">
                      {user.totalSubmissions} submissions
                    </div>
                  </div>

                </div>
              );
            })}

            {topUsers.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-500 font-mono">
                No designers ranked in this historical scope yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topSubmissions.map((sub, idx) => (
            <div key={sub.id} className="relative group">
              {/* Placement overlay on art */}
              <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/85 flex items-center justify-center font-mono font-bold text-xs text-amber-400 border border-amber-500/30">
                #{idx + 1}
              </div>

              <div
                onClick={() => onSelectSubmission(sub)}
                className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 hover:shadow-xl transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-video w-full bg-black overflow-hidden">
                  <img src={sub.images[0]} alt={sub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-sm text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {sub.title}
                    </h3>
                    <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ★ {sub.scores?.overall || "80"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-gray-400">{sub.userDisplayName}</span>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {sub.viewsCount}</span>
                      <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-pink-500" /> {sub.likesCount}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {topSubmissions.length === 0 && (
            <div className="col-span-3 py-16 text-center text-xs text-gray-500 font-mono bg-[#141414] border border-white/5 rounded-3xl">
              No trending artworks available currently.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
