import React, { useState } from "react";
import { X, Mail, Lock, User, Github, Sparkles, LogIn } from "lucide-react";
import { UserProfile } from "../types";
import { DbManager } from "../dbMock";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Designer" | "Admin" | "Judge" | "Visitor">("Designer");
  const [resetSent, setResetSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isForgotPassword) {
      setResetSent(true);
      return;
    }

    if (isSignUp) {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        alert("Please complete all fields.");
        return;
      }
      
      const newProfile: UserProfile = {
        uid: `user-${Math.random().toString(36).substr(2, 9)}`,
        displayName: fullName.trim(),
        email: email.trim().toLowerCase(),
        photoURL: `https://images.unsplash.com/photo-${["1535713875002-d1d0cf377fde", "1570295999919-56ceb5ecca61", "1580489944761-15a19d654956", "1438761681033-6461ffad8d80"][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&w=150&h=150&q=80`,
        bio: "Creative digital graphic designer joining the DesignRank ecosystem.",
        specialties: ["Brand Identity", "UI/UX Design"],
        portfolioUrl: "",
        totalSubmissions: 0,
        achievementBadges: [],
        competitionWins: 0,
        role: selectedRole,
        createdAt: new Date().toISOString()
      };

      DbManager.saveUserProfile(newProfile);
      onSuccess(newProfile);
      onClose();
    } else {
      if (!email.trim() || !password.trim()) {
        alert("Please supply email and password.");
        return;
      }

      // Check existing accounts
      const allUsers = DbManager.getUsers();
      const existing = allUsers.find(u => u.email === email.trim().toLowerCase());
      if (existing) {
        onSuccess(existing);
        onClose();
      } else {
        // Create an automated quick account to avoid login walls!
        const autoName = email.split("@")[0];
        const defaultProf: UserProfile = {
          uid: `user-${Math.random().toString(36).substr(2, 9)}`,
          displayName: autoName.charAt(0).toUpperCase() + autoName.slice(1),
          email: email.trim().toLowerCase(),
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
          bio: "Passionate visual artist.",
          specialties: ["Logo Design"],
          totalSubmissions: 0,
          achievementBadges: [],
          competitionWins: 0,
          role: selectedRole,
          createdAt: new Date().toISOString()
        };
        DbManager.saveUserProfile(defaultProf);
        onSuccess(defaultProf);
        onClose();
      }
    }
  };

  const handleSocialClick = (platform: string) => {
    // Generate a beautiful instant profile based on social authorization!
    const names: { [key: string]: string } = {
      Google: "Julian Drake (Google)",
      LinkedIn: "Amara Okereke (LinkedIn)",
      Facebook: "Sophia Martinez (Facebook)"
    };
    const emails: { [key: string]: string } = {
      Google: "julian.drake@gmail.com",
      LinkedIn: "amara.okereke@linkedin.com",
      Facebook: "sophia.mtz@fb.com"
    };
    const photos: { [key: string]: string } = {
      Google: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      LinkedIn: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      Facebook: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
    };

    const newProfile: UserProfile = {
      uid: `oauth-${platform.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
      displayName: names[platform],
      email: emails[platform],
      photoURL: photos[platform],
      bio: `Professional designer registered via social SSO authorization of ${platform}.`,
      specialties: ["UI/UX Design", "Web Design", "Packaging Design"],
      totalSubmissions: 0,
      achievementBadges: ["original_creator"],
      competitionWins: 0,
      role: "Designer",
      createdAt: new Date().toISOString()
    };

    DbManager.saveUserProfile(newProfile);
    onSuccess(newProfile);
    onClose();
  };

  return (
    <div id="auth_modal_container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#12141a] rounded-xl border border-white/5 shadow-2xl overflow-hidden p-6 md:p-8">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand visual header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/10">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {isForgotPassword ? "Account Recovery" : isSignUp ? "Join DesignRank" : "Sign in to DesignRank"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isForgotPassword
              ? "We'll send you verification parameters to recover access."
              : isSignUp
              ? "Create your account and benchmark with AI design scoring!"
              : "Access design rankings, leaderboards, & weekly challenges."}
          </p>
        </div>

        {/* Forgotten password state */}
        {isForgotPassword ? (
          <div className="space-y-4">
            {resetSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center font-sans space-y-2">
                <span className="text-xl">✉️</span>
                <p className="text-sm font-medium text-emerald-400">Password Reset Email Dispatched!</p>
                <p className="text-xs text-gray-400">Please check your inbox at {email} and follow instructions to reset your password.</p>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="mt-4 px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-white"
                >
                  Return to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="recovery-email" className="block text-xs font-medium text-gray-400 mb-2 font-mono uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alex.designer@company.com"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-[#0d0f12] border border-white/10 rounded-lg text-white font-sans text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  Send OTP Recovery Link
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-xs text-indigo-400 hover:underline"
                >
                  Review sign-in options
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            


            {/* SSO Social Logins */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSocialClick("Google")}
                className="py-2.5 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] bg-[#0d0f12] rounded-lg text-xs font-semibold text-gray-300 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-sm">🌐</span>
                Google
              </button>
              <button
                onClick={() => handleSocialClick("LinkedIn")}
                className="py-2.5 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] bg-[#0d0f12] rounded-lg text-xs font-semibold text-gray-300 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-sm">💼</span>
                LinkedIn
              </button>
              <button
                onClick={() => handleSocialClick("Facebook")}
                className="py-2.5 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] bg-[#0d0f12] rounded-lg text-xs font-semibold text-gray-300 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-sm">👥</span>
                Facebook
              </button>
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="h-[1px] bg-white/5 flex-1"></div>
              <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Or credentials</span>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            {/* Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-medium text-gray-400 mb-1 font-mono uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      id="reg-fullname"
                      type="text"
                      placeholder="Elena Vance"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-[#0d0f12] border border-white/10 rounded-lg text-white font-sans text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-gray-400 mb-1 font-mono uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="elena.v@designrank.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-[#0d0f12] border border-white/10 rounded-lg text-white font-sans text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="login-password" className="block text-xs font-medium text-gray-400 font-mono uppercase">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 bg-[#0d0f12] border border-white/10 rounded-lg text-white font-sans text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="reg-role-select" className="block text-xs font-medium text-gray-400 mb-1.5 font-mono uppercase">Platform Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["Designer", "Visitor", "Admin", "Judge"] as const).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`py-2 border text-xs font-medium rounded-lg transition-all ${
                          selectedRole === role
                            ? "border-indigo-500 bg-indigo-500/10 text-white"
                            : "border-white/5 bg-[#0d0f12] text-gray-400 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <LogIn className="w-4 h-4" />
                {isSignUp ? "Create Workspace Account" : "Access Platform"}
              </button>
            </form>

            {/* Switch sign-up/sign-in */}
            <div className="text-center mt-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {isSignUp ? "Already registered? Sign in" : "No account yet? Create free account"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
