import React, { useState, useEffect } from "react";
import { Sparkles, Bell, Search, LogIn, LogOut, LayoutGrid, Trophy, User, Filter, AlertCircle } from "lucide-react";
import { UserProfile, UserNotification, CATEGORIES } from "../types";
import { DbManager } from "../dbMock";

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectTab: (tab: "discovery" | "challenges" | "leaderboard" | "dashboard") => void;
  selectedTab: "discovery" | "challenges" | "leaderboard" | "dashboard";
  onFilterChange: (filters: { query: string; category: string; minScore: number }) => void;
}

export default function Navbar({
  currentUser,
  onOpenAuth,
  onLogout,
  onSelectTab,
  selectedTab,
  onFilterChange
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minScore, setMinScore] = useState(0);

  // Notifications State
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const list = DbManager.getNotifications(currentUser.uid);
      setNotifications(list);
    } else {
      setNotifications([]);
    }
  }, [currentUser, showNotifications]);

  // Handle changes and propagate filters up to feed
  useEffect(() => {
    onFilterChange({
      query: searchQuery.trim(),
      category: selectedCategory,
      minScore: minScore
    });
  }, [searchQuery, selectedCategory, minScore]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      DbManager.markAllAsRead(currentUser.uid);
      setNotifications(DbManager.getNotifications(currentUser.uid));
    }
  };

  const handleClearNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    DbManager.clearNotification(id);
    if (currentUser) {
      setNotifications(DbManager.getNotifications(currentUser.uid));
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0A0A0A]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab("discovery")}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
        >
          <div className="w-[34px] h-[34px] bg-indigo-600 rounded-lg flex items-center justify-center font-black text-sm tracking-tighter italic text-white font-display group-hover:scale-105 transition-transform shadow-lg shadow-indigo-650/20">
            DR
          </div>
          <span className="text-lg font-display font-extrabold tracking-tight text-white uppercase group-hover:text-indigo-400 transition-colors">
            DesignRank <span className="text-indigo-450 font-normal normal-case text-xs px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md font-mono tracking-wide">pro</span>
          </span>
        </div>

        {/* Real-time Discovery Search Bar Filters (Only show in discovery view) */}
        {selectedTab === "discovery" && (
          <div className="hidden md:flex items-center gap-2 max-w-lg flex-1 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                id="navbar-search-field"
                type="text"
                placeholder="Search creative artworks, designers, tools..."
                value={searchQuery}
                aria-label="Search"
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-sans transition-all"
              />
            </div>
            
            {/* Category selection */}
            <select
              value={selectedCategory}
              id="navbar-category-select"
              aria-label="Select Category"
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#141414] text-xs text-gray-400 border border-white/5 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Global Nav tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab("discovery")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              selectedTab === "discovery" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Explore</span>
          </button>
          
          <button
            onClick={() => onSelectTab("challenges")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              selectedTab === "challenges" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Challenges</span>
          </button>

          <button
            onClick={() => onSelectTab("leaderboard")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              selectedTab === "leaderboard" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Leaderboards</span>
          </button>
        </nav>

        {/* Session / Authenticated Notifications controls */}
        <div className="flex items-center gap-2 sm:gap-4 ml-2 relative">
          
          {/* Notifications dropdown bell */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>

              {/* Feed popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#141414] rounded-2xl border border-white/5 shadow-2xl overflow-hidden p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Critique Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-indigo-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-xs text-gray-500">Alert box is standard clean.</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded text-xs space-y-1 relative border transition-colors ${
                            notif.read ? "bg-black/10 border-white/5 text-gray-400" : "bg-indigo-500/5 border-indigo-500/10 text-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-[11px] block pr-4">{notif.title}</span>
                            <button
                              onClick={(e) => handleClearNotif(notif.id, e)}
                              className="text-gray-500 hover:text-white"
                            >
                              ×
                            </button>
                          </div>
                          <p className="leading-relaxed text-[11px] font-sans">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profiles triggers */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div
                onClick={() => onSelectTab("dashboard")}
                className="flex items-center gap-1.5 p-1 bg-white/5 hover:bg-white/10 rounded-full sm:rounded-lg cursor-pointer transition-colors"
                title="View Dashboard"
              >
                <img
                  src={currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80"}
                  alt={currentUser.displayName}
                  className="w-6.5 h-6.5 rounded-full object-cover border border-indigo-500/15"
                />
                <span className="text-xs text-white max-w-[80px] truncate font-medium hidden sm:inline">
                  {currentUser.displayName.split(" ")[0]}
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 rounded-full transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Workspace Access</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
