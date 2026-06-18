import React, { useState, useEffect } from "react";
import { UserProfile, Submission, Challenge, CATEGORIES } from "../types";
import { DbManager } from "../dbMock";
import { Trash2, Shield, PlusCircle, Award, LayoutGrid, Users, Calendar, BarChart2, Star, CheckSquare } from "lucide-react";

interface DashboardProps {
  currentUser: UserProfile;
  onSelectSubmission: (sub: Submission) => void;
  onRefreshDashboard: () => void;
  onChallengeCreated?: () => void;
}

export default function Dashboard({
  currentUser,
  onSelectSubmission,
  onRefreshDashboard,
  onChallengeCreated
}: DashboardProps) {
  const [activeMenu, setActiveMenu] = useState<"analytics" | "users" | "campaign" | "mod">("analytics");
  const [designerSubs, setDesignerSubs] = useState<Submission[]>([]);
  const [allSubs, setAllSubs] = useState<Submission[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Challenge Builder state
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeRules, setChallengeRules] = useState("");
  const [challengePrize, setChallengePrize] = useState("$1,000 + Winner Placement");

  const loadData = () => {
    const subs = DbManager.getSubmissions();
    setAllSubs(subs);
    setDesignerSubs(subs.filter(s => s.userId === currentUser.uid));
    
    const users = DbManager.getUsers();
    setAllUsers(users);

    const chs = DbManager.getChallenges();
    setChallenges(chs);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Analytics Calculations
  const averageOverallScore = designerSubs.length > 0
    ? Math.round(designerSubs.reduce((acc, sub) => acc + (sub.scores?.overall || 0), 0) / designerSubs.length)
    : 0;

  const totalLikesAccrued = designerSubs.reduce((acc, s) => acc + s.likesCount, 0);
  const totalViewsAccrued = designerSubs.reduce((acc, s) => acc + s.viewsCount, 0);

  const handleRoleChange = (uid: string, role: any) => {
    DbManager.updateUserRole(uid, role);
    loadData();
    onRefreshDashboard();
    alert(`Success: Updated user role to ${role}`);
  };

  const handleDeleteSub = (id: string) => {
    if (confirm("Are you sure you want to delete this design?")) {
      DbManager.deleteSubmission(id);
      loadData();
      onRefreshDashboard();
    }
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim() || !challengeDesc.trim()) {
      alert("Please fill in Challenge Title and Description.");
      return;
    }

    const rulesList = challengeRules
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    // Disable past active campaigns
    const updatedChallenges = DbManager.getChallenges().map(ch => {
      if (ch.status === "active") {
        return { ...ch, status: "completed" as const };
      }
      return ch;
    });

    const newChallenge: Challenge = {
      id: `challenge-${Math.random().toString(36).substr(2, 9)}`,
      title: challengeTitle.trim(),
      description: challengeDesc.trim(),
      rules: rulesList.length > 0 ? rulesList : ["Must upload vector illustration on the platform."],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      prize: challengePrize.trim(),
      status: "active"
    };

    DbManager.addChallenge(newChallenge);
    
    // Clear Form
    setChallengeTitle("");
    setChallengeDesc("");
    setChallengeRules("");
    setChallengePrize("$1,000 + Winner Placement");
    
    loadData();
    if (onChallengeCreated) onChallengeCreated();
    alert("Wonderful: New Weekly Design Challenge has been published live!");
  };

  const handleSetWinner = (challengeId: string, subId: string) => {
    if (confirm("Confirm setting this submission as the official Winner for this challenge?")) {
      DbManager.finishChallengeAndSetWinner(challengeId, subId);
      loadData();
      if (onChallengeCreated) onChallengeCreated();
      alert("Success: The Weekly Challenge has been evaluated and the Winner spotlighted!");
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in font-sans">
      
      {/* Upper Profile Identity Dashboard Bar */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111] rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row gap-6 justify-between items-center bg-designer-mesh">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
            alt={currentUser.displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-display font-extrabold text-white uppercase tracking-tight">{currentUser.displayName}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border border-indigo-500/30 bg-indigo-500/10 text-indigo-400`}>
                {currentUser.role} Dashboard
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">{currentUser.bio || "Active designer on the DesignRank platform."}</p>
          </div>
        </div>

        {/* Dashboard Menu Buttons */}
        {currentUser.role === "Admin" && (
          <div className="flex flex-wrap gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setActiveMenu("analytics")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeMenu === "analytics" ? "bg-indigo-650 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveMenu("users")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeMenu === "users" ? "bg-indigo-650 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              Membership
            </button>
            <button
              onClick={() => setActiveMenu("mod")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeMenu === "mod" ? "bg-indigo-650 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              Moderation
            </button>
            <button
              onClick={() => setActiveMenu("campaign")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeMenu === "campaign" ? "bg-indigo-650 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              Campaign setups
            </button>
          </div>
        )}
      </div>

      {/* Main Panel Content switching */}
      {activeMenu === "analytics" && (
        <div className="space-y-8">
          
          {/* Stat metrics widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#141414] rounded-3xl border border-white/5 p-5 space-y-1 hover:border-white/10 transition-colors">
              <span className="text-[10px] text-gray-400 font-mono uppercase block tracking-wider">Overall Uploads</span>
              <p className="text-2xl md:text-3xl font-display font-black text-white">
                {currentUser.role === "Admin" ? allSubs.length : designerSubs.length}
              </p>
            </div>
            <div className="bg-[#141414] rounded-3xl border border-white/5 p-5 space-y-1 hover:border-white/10 transition-colors">
              <span className="text-[10px] text-gray-400 font-mono uppercase block tracking-wider">Average Jury Score</span>
              <p className="text-2xl md:text-3xl font-display font-black text-[#6366f1] animate-pulse">
                {currentUser.role === "Admin" ? 91 : averageOverallScore}/100
              </p>
            </div>
            <div className="bg-[#141414] rounded-3xl border border-white/5 p-5 space-y-1 hover:border-white/10 transition-colors">
              <span className="text-[10px] text-gray-400 font-mono uppercase block tracking-wider">Total Design Likes</span>
              <p className="text-2xl md:text-3xl font-display font-black text-white">
                {currentUser.role === "Admin" ? allSubs.reduce((a, s) => a + s.likesCount, 0) : totalLikesAccrued}
              </p>
            </div>
            <div className="bg-[#141414] rounded-3xl border border-white/5 p-5 space-y-1 hover:border-white/10 transition-colors">
              <span className="text-[10px] text-gray-400 font-mono uppercase block tracking-wider">Portfolio Views</span>
              <p className="text-2xl md:text-3xl font-display font-black text-white font-mono">
                {currentUser.role === "Admin" ? allSubs.reduce((a, s) => a + s.viewsCount, 0) : totalViewsAccrued}
              </p>
            </div>
          </div>

          {/* Users uploads timeline list (Personal Portfolio Manager) */}
          <div className="space-y-4">
            <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="w-5 h-5 text-indigo-400" />
              {currentUser.role === "Admin" ? "Master Uploads Database" : "My Design Submissions Portfolio"}
            </h2>

            <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1A1A1A] border-b border-white/5 text-xs text-gray-400 font-mono">
                <div className="col-span-8 md:col-span-6">Artwork and Categories</div>
                <div className="col-span-2 text-center">Jury Score</div>
                <div className="col-span-2 text-right hidden md:block">Engagement</div>
                <div className="col-span-4 md:col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-white/5">
                {(currentUser.role === "Admin" ? allSubs : designerSubs).map(sub => (
                  <div key={sub.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.01]">
                    
                    <div className="col-span-8 md:col-span-6 flex items-center gap-3">
                      <div className="w-12 md:w-16 aspect-video bg-black rounded overflow-hidden border border-white/10 shrink-0">
                        <img src={sub.images[0]} alt={sub.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-semibold text-white truncate max-w-xs md:max-w-md">{sub.title}</h4>
                        <span className="text-[10px] text-gray-500 font-mono">{sub.category}</span>
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="inline-block px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded font-mono text-xs text-indigo-400 font-bold">
                        {sub.scores?.overall || "80"}
                      </span>
                    </div>

                    <div className="col-span-2 text-right hidden md:block text-xs text-gray-400 font-mono">
                      <span>👍 {sub.likesCount}</span> <span className="text-gray-600">/</span> <span>👁️ {sub.viewsCount}</span>
                    </div>

                    <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectSubmission(sub)}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-[10px] font-medium transition-colors"
                      >
                        Inspect
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSub(sub.id)}
                        className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors"
                        title="Delete Artwork"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}

                {(currentUser.role === "Admin" ? allSubs : designerSubs).length === 0 && (
                  <div className="py-12 text-center text-xs text-gray-500 font-mono">
                    Portfolio index currently empty. Submit your first artwork on the platforms!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin User Management Panel */}
      {currentUser.role === "Admin" && activeMenu === "users" && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Platform Membership Directory
          </h2>

          <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1A1A1A] border-b border-white/5 text-xs text-gray-400 font-mono">
              <div className="col-span-6 md:col-span-5">Member Name / Specialties</div>
              <div className="col-span-3 text-center">Submissions / Wins</div>
              <div className="col-span-3 md:col-span-2 text-center">Verified Role</div>
              <div className="col-span-3 md:col-span-2 text-right">Modify Access</div>
            </div>

            <div className="divide-y divide-white/5">
              {allUsers.map(user => (
                <div key={user.uid} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.01]">
                  
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-semibold text-xs md:text-sm text-white">{user.displayName}</h4>
                      <p className="text-[10px] text-gray-505 font-mono">{user.email}</p>
                    </div>
                  </div>

                  <div className="col-span-3 text-center text-xs text-gray-300 font-mono">
                    <span>{user.totalSubmissions} (P)</span> <span className="text-gray-650">/</span> <span>{user.competitionWins} (W)</span>
                  </div>

                  <div className="col-span-3 md:col-span-2 text-center text-xs font-semibold text-indigo-400">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25">
                      {user.role}
                    </span>
                  </div>

                  <div className="col-span-3 md:col-span-2 text-right">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.uid, e.target.value)}
                      className="bg-black text-xs text-gray-300 border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Designer">Designer</option>
                      <option value="Judge">Judge</option>
                      <option value="Admin">Admin</option>
                      <option value="Visitor">Visitor</option>
                    </select>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Content Moderation Panel */}
      {currentUser.role === "Admin" && activeMenu === "mod" && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            Content Moderation Auditing
          </h2>

          <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1A1A1A] border-b border-white/5 text-xs text-gray-400 font-mono">
              <div className="col-span-8">Design Submission</div>
              <div className="col-span-2 text-center">Overall Index</div>
              <div className="col-span-2 text-right">Moderation action</div>
            </div>

            <div className="divide-y divide-white/5">
              {allSubs.map(sub => (
                <div key={sub.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.01]">
                  
                  <div className="col-span-8 flex items-center gap-3">
                    <div className="w-14 aspect-video bg-black rounded overflow-hidden shrink-0 border border-white/5">
                      <img src={sub.images[0]} alt={sub.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-semibold text-white">{sub.title}</h4>
                      <p className="text-[10px] text-gray-500">Artist: {sub.userDisplayName}</p>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="text-xs font-mono font-bold text-indigo-400">{sub.scores?.overall || "80"}</span>
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleDeleteSub(sub.id)}
                      className="px-2.5 py-1 border border-red-500/20 hover:border-red-500 bg-red-950/10 hover:bg-red-950/50 text-red-400 text-[10px] font-mono rounded-lg transition-all cursor-pointer"
                    >
                      Delete Project
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Design Challenge Setup */}
      {currentUser.role === "Admin" && activeMenu === "campaign" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Create Campaign Form */}
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 space-y-6">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Launch New Challenge
            </h3>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 font-mono uppercase">Challenge Name</label>
                <input
                  type="text"
                  placeholder="e.g. Retro-Futurism Soda Rebrand"
                  value={challengeTitle}
                  onChange={e => setChallengeTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 font-mono uppercase">Campaign Description</label>
                <textarea
                  placeholder="Describe the aesthetic direction, client expectations, target audiences, and theme guidelines..."
                  value={challengeDesc}
                  onChange={e => setChallengeDesc(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 font-mono uppercase">Guides & Criteria (One per line)</label>
                <textarea
                  placeholder="e.g., Use exactly 4 color combinations&#10;e.g., Present a high-resolution render design mockup"
                  value={challengeRules}
                  onChange={e => setChallengeRules(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 font-mono uppercase">Grand Winner Prize Reward</label>
                <input
                  type="text"
                  placeholder="e.g. $1,500 Cash prize & spotlight badge"
                  value={challengePrize}
                  onChange={e => setChallengePrize(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono rounded-lg transition-colors shadow-lg"
              >
                Publish Campaign Live
              </button>
            </form>
          </div>

          {/* Manage Closed Challenges & Selection */}
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 space-y-6">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Manage Challenges & Declare Winners
            </h3>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {challenges.map(ch => (
                <div key={ch.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-display">{ch.title}</h4>
                      <p className="text-[9px] text-gray-500 font-mono">ID: {ch.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${
                      ch.status === "active"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                    }`}>
                      {ch.status}
                    </span>
                  </div>

                  {ch.status === "active" ? (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider block">
                        🏆 Select Winner from active challenge sub-database:
                      </span>
                      
                      <div className="space-y-1">
                        {allSubs.filter(s => s.challengeId === ch.id).length === 0 ? (
                          <p className="text-[10px] text-gray-650 italic">No submissions submitted for this challenge yet.</p>
                        ) : (
                          allSubs
                              .filter(s => s.challengeId === ch.id)
                              .map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => handleSetWinner(ch.id, sub.id)}
                                className="w-full p-2 bg-black border border-white/5 hover:border-indigo-500/40 rounded-lg text-left transition-all flex items-center justify-between text-xs cursor-pointer"
                              >
                                <span className="text-white truncate font-medium max-w-[70%]">{sub.title}</span>
                                <span className="text-amber-400 font-mono font-bold text-[10px] shrink-0">★ {sub.scores?.overall} (by {sub.userDisplayName})</span>
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400 font-mono">
                      <p className="text-emerald-400">Winner: {ch.winnerDisplayName}</p>
                      <p className="truncate text-[11px] text-gray-500">Winning Submission: {ch.winnerSubmissionTitle}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
