import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SubmissionCard from "./components/SubmissionCard";
import SubmissionDetail from "./components/SubmissionDetail";
import ActiveChallenges from "./components/ActiveChallenges";
import Leaderboard from "./components/Leaderboard";
import Dashboard from "./components/Dashboard";
import AuthModal from "./components/AuthModal";
import UploadModal from "./components/UploadModal";
import { DbManager } from "./dbMock";
import { Submission, UserProfile, CATEGORIES } from "./types";
import {
  Sparkles,
  Trophy,
  Award,
  UploadCloud,
  ArrowRight,
  Star,
  CheckCircle,
  MessageCircle,
  Users
} from "lucide-react";

export default function App() {
  // Session Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Layout Tab state
  const [selectedTab, setSelectedTab] = useState<"discovery" | "challenges" | "leaderboard" | "dashboard">("discovery");

  // Selection Detail state
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Search & Filter state
  const [searchFilters, setSearchFilters] = useState({ query: "", category: "", minScore: 0 });

  // Modal display states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetChallengeId, setTargetChallengeId] = useState<string | undefined>(undefined);

  // Feed Submissions list
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);

  // Reload trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Autologin on start for effortless exploration in preview iframe!
  useEffect(() => {
    // Attempt load cached session or log admin-1 (Workspace Admin) to make app fully-active instantly!
    const saved = localStorage.getItem("designrank_session");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        // Fallback to active model Workspace Admin
        const defaultUser = DbManager.getUser("admin-1") || null;
        setCurrentUser(defaultUser);
      }
    } else {
      // Auto-populate active admin profile for the user!
      const defaultUser = DbManager.getUser("admin-1") || null;
      setCurrentUser(defaultUser);
    }
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem("designrank_session", JSON.stringify(profile));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("designrank_session");
    setSelectedTab("discovery");
    setSelectedSubmissionId(null);
  };

  const loadFeed = () => {
    const list = DbManager.getSubmissions();
    setAllSubmissions(list);
  };

  useEffect(() => {
    loadFeed();
  }, [refreshTrigger]);

  // Toggle Like API wrapper
  const handleLikeToggle = (subId: string, authorId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    DbManager.toggleLike(currentUser.uid, subId, authorId);
    setRefreshTrigger(prev => prev + 1);
  };

  // Delete submission callback
  const handleDeleteSubmission = (id: string) => {
    DbManager.deleteSubmission(id);
    setSelectedSubmissionId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter & Search computations on submissions list
  const filteredSubmissions = allSubmissions.filter(sub => {
    const matchesQuery =
      sub.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      sub.userDisplayName.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      sub.software.toLowerCase().includes(searchFilters.query.toLowerCase());

    const matchesCategory = searchFilters.category === "" || sub.category === searchFilters.category;
    const matchesScore = (sub.scores?.overall || 0) >= searchFilters.minScore;

    return matchesQuery && matchesCategory && matchesScore;
  });

  const featuredDesignerProfiles = DbManager.getUsers().filter(u => u.role !== "Admin");

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#f1f5f9] select-none bg-designer-mesh">
      
      {/* Global Navbar Header */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onSelectTab={(tab) => {
          setSelectedTab(tab);
          setSelectedSubmissionId(null); // Back to listings
        }}
        selectedTab={selectedTab}
        onFilterChange={setSearchFilters}
      />

      {/* Main Body Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SUBMISSION DETAIL VIEW */}
        {selectedSubmissionId ? (
          <SubmissionDetail
            submissionId={selectedSubmissionId}
            currentUser={currentUser}
            onBack={() => setSelectedSubmissionId(null)}
            onLikeToggle={handleLikeToggle}
            isLiked={currentUser ? DbManager.getLikeStatus(currentUser.uid, selectedSubmissionId) : false}
            onDeleteSubmission={handleDeleteSubmission}
          />
        ) : (
          /* TAB ROUTING */
          <>
            {/* 1. DISCOVERY FEED TABS */}
            {selectedTab === "discovery" && (
              <div className="space-y-12 animate-fade-in font-sans">
                
                {/* Hero Platform Billboard / Banner Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/5 rounded-3xl p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Subtle blur highlights */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-650/10 rounded-full blur-[120px] transform translate-x-20 -translate-y-20"></div>
                  
                  <div className="space-y-4 max-w-xl relative">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Benchmark Your Visual Skills
                    </span>
                    
                    <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-none uppercase">
                      Community-Powered <span className="text-indigo-400 block mt-1">Design Authority</span>
                    </h1>
                    
                    <p className="text-sm text-gray-400 leading-relaxed font-sans">
                      Upload your digital illustrations, branding, UI/UX systems, or graphics canvas and obtain instantaneous detailed scoring feedback generated by our expert AI evaluation system.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            setShowAuthModal(true);
                          } else {
                            setTargetChallengeId(undefined);
                            setShowUploadModal(true);
                          }
                        }}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm transition-all hover:bg-slate-200 uppercase tracking-wider cursor-pointer"
                      >
                        Analyze My Design
                      </button>

                      <button
                        onClick={() => setSelectedTab("challenges")}
                        className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        Weekly Challenges
                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                      </button>
                    </div>
                  </div>

                  {/* Testimonial slider / Interactive platform stats */}
                  <div className="w-full md:w-80 bg-[#141414] border border-white/5 rounded-3xl p-6 space-y-4 font-mono">
                    <span className="text-[10px] text-gray-550 uppercase tracking-widest block font-bold">Your Companion Performance</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="text-2xl font-bold text-white block">4.8k+</span>
                        <span className="text-[9px] text-gray-500 font-sans uppercase">Designs Scored</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="text-2xl font-bold text-white block">98.4%</span>
                        <span className="text-[9px] text-gray-500 font-sans uppercase">Accuracy Ratio</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="text-2xl font-bold text-white block">1.2k+</span>
                        <span className="text-[9px] text-gray-500 font-sans uppercase">Artists registered</span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="text-2xl font-bold text-indigo-400 block">Week 24</span>
                        <span className="text-[9px] text-gray-500 font-sans uppercase font-bold text-indigo-455">Active Series</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submissions Section Header */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                        <Trophy className="w-6 h-6 text-indigo-400" />
                        Explore Rated Artworks
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Displaying designs evaluated strictly based on mathematical design qualities.
                      </p>
                    </div>
                  </div>

                  {/* Submissions grid */}
                  {filteredSubmissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] font-sans">
                      <span className="text-xl mb-2">🔍</span>
                      <p className="text-gray-400 text-sm">No artworks match your specified search criteria.</p>
                      <button
                        onClick={() => setSearchFilters({ query: "", category: "", minScore: 0 })}
                        className="mt-3 text-xs text-indigo-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSubmissions.map(sub => (
                        <SubmissionCard
                          key={sub.id}
                          submission={sub}
                          onSelect={(subItem) => setSelectedSubmissionId(subItem.id)}
                          onLikeToggle={handleLikeToggle}
                          isLiked={currentUser ? DbManager.getLikeStatus(currentUser.uid, sub.id) : false}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Spotlight Designers Row */}
                <div className="space-y-6 pt-6 font-sans">
                  <div>
                    <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-1.5">
                      <Users className="w-5 h-5 text-indigo-400" />
                      Featured Elite Designers
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Platform profiles with highest win-rates and design quality indices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredDesignerProfiles.map(item => (
                      <div key={item.uid} className="bg-[#141414] rounded-3xl border border-white/5 p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                        <img src={item.photoURL} alt={item.displayName} className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10" />
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-1">
                            {item.displayName}
                            {item.competitionWins > 0 && <span className="text-amber-400" title="Challenge winner">👑</span>}
                          </h4>
                          <p className="text-[10px] text-gray-500 line-clamp-1 truncate max-w-xs">{item.bio}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-indigo-400 font-mono font-medium">
                            <span>★ {item.competitionWins} wins</span>
                            <span>•</span>
                            <span>{item.totalSubmissions} projects</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials registry section */}
                <div className="bg-[#111] rounded-3xl border border-white/5 p-6 md:p-8 space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-display font-bold text-white">Loved by Graphic Professionals</h3>
                    <p className="text-xs text-gray-400">Read opinions from active designers benchmarked in this series.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 relative">
                      <p className="text-xs text-gray-300 italic leading-relaxed">
                        "The mathematical breakdowns of visual contrast and accessibility ratios is mind-blowing. The AI gave critiques regarding font spacing that completely level-up user readability inside my fintech cards."
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="text-xs font-semibold text-white">Yuki Sato</div>
                        <span className="text-[10px] text-gray-500 font-mono">Sr. UI/UX Designer</span>
                      </div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 relative">
                      <p className="text-xs text-gray-300 italic leading-relaxed">
                        "Unlike standard social layouts where popularity rules, DesignRank rates artwork objectively. I won the rebrand challenge strictly because of typographic harmony indices. Extremely fair platform."
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="text-xs font-semibold text-white">Dave Kowalski</div>
                        <span className="text-[10px] text-gray-500 font-mono">Creative Artist</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. WEEKLY CHALLENGES TAB */}
            {selectedTab === "challenges" && (
              <ActiveChallenges
                currentUser={currentUser}
                onSelectSubmission={(subItem) => setSelectedSubmissionId(subItem.id)}
                onOpenUpload={(chId) => {
                  setTargetChallengeId(chId);
                  setShowUploadModal(true);
                }}
              />
            )}

            {/* 3. LEADERBOARD TAB */}
            {selectedTab === "leaderboard" && (
              <Leaderboard
                onSelectSubmission={(subItem) => setSelectedSubmissionId(subItem.id)}
              />
            )}

            {/* 4. DASHBOARD TAB */}
            {selectedTab === "dashboard" && currentUser && (
              <Dashboard
                currentUser={currentUser}
                onSelectSubmission={(subItem) => setSelectedSubmissionId(subItem.id)}
                onRefreshDashboard={() => {
                  setRefreshTrigger(prev => prev + 1);
                }}
                onChallengeCreated={() => {
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
            )}
          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0b0d] py-6 text-center text-xs text-gray-500 font-mono select-none">
        <p>© {new Date().getFullYear()} DesignRank – Community-Powered Graphic Platform.</p>
        <p className="text-[10px] text-gray-600 mt-1">AI-benchmark engines processed by Google Gemini 2.5 models.</p>
      </footer>

      {/* USER AUTH MODAL OVERLAY */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* DESIGN UPLOAD MODAL OVERLAY */}
      {showUploadModal && currentUser && (
        <UploadModal
          userId={currentUser.uid}
          userDisplayName={currentUser.displayName}
          userPhotoURL={currentUser.photoURL}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(newSub) => {
            setShowUploadModal(false);
            setSelectedSubmissionId(newSub.id); // Open newly uploaded and evaluated project immediately!
            setRefreshTrigger(prev => prev + 1);
          }}
          activeChallengeId={targetChallengeId}
        />
      )}

    </div>
  );
}
