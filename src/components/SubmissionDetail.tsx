import React, { useState } from "react";
import { ArrowLeft, Send, Sparkles, AlertCircle, Trash2, ShieldAlert, BadgeCheck, MessageSquare, Heart, ThumbsUp, Eye, Wrench } from "lucide-react";
import Markdown from "react-markdown";
import { Submission, Comment, UserProfile } from "../types";
import { DbManager } from "../dbMock";

interface SubmissionDetailProps {
  submissionId: string;
  currentUser: UserProfile | null;
  onBack: () => void;
  onLikeToggle: (subId: string, authorId: string) => void;
  isLiked: boolean;
  onDeleteSubmission?: (id: string) => void;
}

export default function SubmissionDetail({
  submissionId,
  currentUser,
  onBack,
  onLikeToggle,
  isLiked,
  onDeleteSubmission
}: SubmissionDetailProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const loadData = () => {
    const sub = DbManager.getSubmission(submissionId);
    if (sub) {
      // Increment views count dynamically when user enters details page!
      DbManager.incrementViews(submissionId);
      const updatedSub = DbManager.getSubmission(submissionId);
      setSubmission(updatedSub || sub);
      if (updatedSub && updatedSub.images?.length > 0) {
        setActiveImage(updatedSub.images[0]);
      }
      const list = DbManager.getComments(submissionId);
      setComments(list);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [submissionId]);

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-designer-mesh">
        <p className="text-gray-400">Project details loading or not found...</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 rounded text-sm text-white">
          Back to feed
        </button>
      </div>
    );
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please authenticate or log in to post a critique comment.");
      return;
    }
    if (!newCommentText.trim()) return;

    const comm: Comment = {
      id: `comm-${Math.random().toString(36).substr(2, 9)}`,
      submissionId: submissionId,
      userId: currentUser.uid,
      userDisplayName: currentUser.displayName,
      userPhotoURL: currentUser.photoURL,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    DbManager.addComment(comm, submission.userId);
    setNewCommentText("");
    loadData(); // refresh comments and count
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    if (confirm("Are you sure you want to delete this comment?")) {
      DbManager.deleteComment(commentId);
      loadData();
    }
  };

  const handleDeleteSub = () => {
    if (!currentUser) return;
    if (confirm("WARNING: Are you sure you want to permanently delete this design project from the platform?")) {
      if (onDeleteSubmission) {
        onDeleteSubmission(submission.id);
      } else {
        DbManager.deleteSubmission(submission.id);
        onBack();
      }
    }
  };

  const scores = submission.scores || {
    creativity: 80,
    visualAppeal: 80,
    uxFunctionality: 80,
    technical: 80,
    brandComm: 80,
    overall: 80
  };

  const scoreLabels = [
    { label: "Creativity & Originality", val: scores.creativity, weight: "30%", desc: "Concept, uniqueness, innovation" },
    { label: "Visual Appeal", val: scores.visualAppeal, weight: "25%", desc: "Contrast, balance, spacing, typography" },
    { label: "User Experience & Functionality", val: scores.uxFunctionality, weight: "20%", desc: "Readability, clarity, user focus" },
    { label: "Technical Execution", val: scores.technical, weight: "15%", desc: "Precision, alignment, finish, resolution" },
    { label: "Brand Communication", val: scores.brandComm, weight: "10%", desc: "Identity coherence, crowd message delivery" }
  ];

  const getOverallColor = (score: number) => {
    if (score >= 90) return "from-amber-400 to-orange-500 text-amber-100";
    if (score >= 80) return "from-emerald-400 to-teal-500 text-emerald-100";
    return "from-indigo-400 to-purple-500 text-indigo-100";
  };

  return (
    <div id="sub_detail_view" className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Discovery Portal
        </button>

        <div className="flex items-center gap-3">
          {currentUser && (currentUser.uid === submission.userId || currentUser.role === "Admin") && (
            <button
              onClick={handleDeleteSub}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 border border-red-500/30 hover:bg-red-950/70 text-red-400 hover:text-red-300 rounded-lg text-xs font-mono transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
          {/* Gallery Column (7/12) */}
        <div className="lg:col-span-7 space-y-4 font-sans">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black/40">
            <img
              src={activeImage || "https://images.unsplash.com/photo-1541462608141-2a5573baf94a?auto=format&fit=crop&w=800&h=600&q=80"}
              alt={submission.title}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Sub-thumb selector */}
          {submission.images && submission.images.length > 1 && (
            <div className="flex gap-2">
              {submission.images.map((img, idx) => (
                <button
                   key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 aspect-video rounded-xl overflow-hidden border transition-all ${
                    activeImage === img ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details abstract metadata */}
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wider uppercase">
                  {submission.category}
                </span>
                <h1 className="text-2xl font-display font-bold text-white mt-1">
                  {submission.title}
                </h1>
              </div>

              {/* Like / Toggle Button in details */}
              <button
                onClick={() => onLikeToggle(submission.id, submission.userId)}
                className={`px-4 py-2 rounded-full border text-xs font-mono font-medium transition-all duration-300 flex items-center gap-1.5 ${
                  isLiked
                    ? "border-pink-500/50 bg-pink-500/15 text-pink-400 shadow-lg shadow-pink-500/5"
                    : "border-white/10 hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-400 text-gray-300"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-pink-500" : ""}`} />
                <span>{isLiked ? "Saved to Favorites" : "Add to Favorites"}</span>
              </button>
            </div>

            <p className="text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
              {submission.description || "The project description has not been fully customized by the artist."}
            </p>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5 text-xs text-gray-400">
              <div>
                <span className="text-gray-500">Artist Name:</span>{" "}
                <span className="text-white font-medium">{submission.userDisplayName}</span>
              </div>
              <div>
                <span className="text-gray-500">Created At:</span>{" "}
                <span className="text-white font-medium">{new Date(submission.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Digital Tools:</span>{" "}
                <span className="text-white font-mono">{submission.software || "Other Canvas"}</span>
              </div>
            </div>

            {submission.tags && submission.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {submission.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Scoring bento panel (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Big overall score pill */}
          <div className={`p-6 rounded-3xl bg-gradient-to-br ${getOverallColor(scores.overall)} border border-white/10 glow-indigo text-center relative overflow-hidden flex flex-col items-center justify-center`}>
            {/* Absolute accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
            
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#000]/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-bounce text-[#000]" />
              AI Weighted Score Card
            </span>
            <div className="text-7xl font-display font-black tracking-tight my-2 text-white">
              {scores.overall}
              <span className="text-2xl text-white/50 font-sans font-normal ml-0.5">/100</span>
            </div>
            
            {scores.overall >= 90 ? (
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20">
                💎 elite level
              </span>
            ) : scores.overall >= 80 ? (
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20">
                ⭐ expert standard
              </span>
            ) : (
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20">
                🎨 rising designer
              </span>
            )}
          </div>

          {/* Score breakdown metrics progress bars */}
          <div className="bg-[#141414] rounded-3xl border border-white/5 p-6 space-y-5">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
              Scoring Breakdown Metrics
            </h3>

            <div className="space-y-4">
              {scoreLabels.map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300 font-sans">{item.label}</span>
                    <div className="flex items-center gap-1 text-white font-bold">
                      <span>{item.val}</span>
                      <span className="text-gray-500 font-normal text-[9px]">({item.weight})</span>
                    </div>
                  </div>
                  
                  {/* Custom progress bar */}
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                      style={{ width: `${item.val}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI strengths & areas of improvements info panel */}
          {submission.aiFeedback && (
            <div className="grid grid-cols-1 gap-4 font-sans">
              {/* Strengths */}
              <div className="bg-emerald-950/15 border border-emerald-500/10 rounded-3xl p-5 space-y-2.5 animate-fade-in">
                <span className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  Key Strengths
                </span>
                <ul className="space-y-2">
                  {submission.aiFeedback.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-gray-350 leading-normal flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-amber-950/15 border border-amber-500/10 rounded-3xl p-5 space-y-2.5 animate-fade-in">
                <span className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Areas for Improvement
                </span>
                <ul className="space-y-2">
                  {submission.aiFeedback.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-gray-355 leading-normal flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Critiques markdown content panel & comments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 font-sans">
        
        {/* Full AI Report (7/12) */}
        {submission.aiFeedback && (
          <div className="lg:col-span-7 bg-[#141414] rounded-3xl border border-white/5 p-6 md:p-8 animate-fade-in">
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Professional Jury Report
            </h3>

            <div className="markdown-body prose prose-invert prose-xs text-gray-305 max-w-none text-sm space-y-4">
              <Markdown>{submission.aiFeedback.feedback}</Markdown>
            </div>
          </div>
        )}

        {/* Live Critique Feed (5/12) */}
        <div className="lg:col-span-5 bg-[#141414] rounded-3xl border border-white/5 p-6 flex flex-col justify-between animate-fade-in">
          <div>
            <h3 className="text-base font-display font-bold text-white mb-4 border-b border-white/5 pb-3 flex items-center gap-1.5 font-mono">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Designer Discussions ({comments.length})
            </h3>

            {/* Critique Comment Form */}
            {currentUser ? (
              <form onSubmit={handlePostComment} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Provide professional feedback..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    required
                    className="flex-1 px-4 py-2 bg-black border border-white/10 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-white/[0.02] rounded-lg text-center text-xs text-gray-400 mb-6 border border-dashed border-white/5">
                🔑 Please log in to take part in this design critique.
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="py-12 text-center font-sans space-y-1">
                <p className="text-gray-500 text-sm">No community comments yet.</p>
                <p className="text-xs text-gray-600">Be the first to leave constructive feedback!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {comments.map(c => {
                  const isAdminOrAuthorOfComment = currentUser && (currentUser.uid === c.userId || currentUser.role === "Admin");
                  return (
                    <div key={c.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-1.5 hover:border-white/10 transition-colors relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={c.userPhotoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80"} alt={c.userDisplayName} className="w-4.5 h-4.5 rounded-full object-cover" />
                          <span className="text-xs font-semibold text-white">{c.userDisplayName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                          {isAdminOrAuthorOfComment && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Delete Comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{c.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
