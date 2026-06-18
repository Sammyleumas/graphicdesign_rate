import React from "react";
import { ThumbsUp, MessageSquare, Eye, Award, Sparkles } from "lucide-react";
import { Submission } from "../types";

interface SubmissionCardProps {
  submission: Submission;
  onSelect: (sub: Submission) => void;
  onLikeToggle?: (subId: string, authorId: string) => void;
  isLiked?: boolean;
}

export default function SubmissionCard({
  submission,
  onSelect,
  onLikeToggle,
  isLiked = false
}: SubmissionCardProps) {
  const scoreColor = (score?: number) => {
    if (!score) return "text-gray-400 border-gray-400 bg-gray-400/5";
    if (score >= 90) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    if (score >= 80) return "text-teal-400 border-teal-500/30 bg-teal-500/10";
    return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
  };

  return (
    <div
      className="group relative bg-[#141414] rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col"
    >
      {/* Visual Image Cover */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0b0d] cursor-pointer" onClick={() => onSelect(submission)}>
        <img
          src={submission.images[0] || "https://images.unsplash.com/photo-1541462608141-2a5573baf94a?auto=format&fit=crop&w=800&h=600&q=80"}
          alt={submission.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-xs text-gray-300 line-clamp-2 mb-2 font-mono">{submission.description}</p>
        </div>

        {/* Category Badge Top Left */}
        <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-gray-300 text-[10px] font-mono font-medium px-2 py-1 rounded border border-white/5">
          {submission.category}
        </span>

        {/* Dynamic Highlight Badge (Score > 90) */}
        {submission.scores && submission.scores.overall >= 90 && (
          <span className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-md text-amber-300 text-[10px] font-mono font-medium px-2 py-1 rounded border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            JURY GOLD
          </span>
        )}
      </div>

      {/* Card Content details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Title with Score Badge */}
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelect(submission)}
              className="text-base font-display font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
            >
              {submission.title}
            </h3>
            
            {submission.scores && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-bold ${scoreColor(submission.scores.overall)} animate-pulse`}>
                <Award className="w-3.5 h-3.5" />
                <span>{submission.scores.overall}</span>
              </div>
            )}
          </div>

          {/* Designer Profile mini */}
          <div className="flex items-center gap-2 mt-3 mb-4">
            <img
              src={submission.userPhotoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80"}
              alt={submission.userDisplayName}
              className="w-5 h-5 rounded-full object-cover border border-white/5"
            />
            <span className="text-xs text-gray-400 hover:text-white transition-colors">
              {submission.userDisplayName}
            </span>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {/* Software used pills */}
          <span className="text-[10px] text-gray-500 font-mono line-clamp-1 max-w-[50%]">
            {submission.software || "Generic Canvas"}
          </span>

          {/* Social Stats */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400 font-mono">
              <Eye className="w-3.5 h-3.5" />
              {submission.viewsCount}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400 font-mono">
              <MessageSquare className="w-3.5 h-3.5" />
              {submission.commentsCount}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onLikeToggle) onLikeToggle(submission.id, submission.userId);
              }}
              className={`flex items-center gap-1 text-xs font-mono transition-colors ${
                isLiked ? "text-pink-500 hover:text-pink-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-pink-500" : ""}`} />
              {submission.likesCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
