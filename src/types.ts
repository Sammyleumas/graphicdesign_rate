export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  specialties: string[];
  socials?: {
    google?: string;
    linkedin?: string;
    facebook?: string;
    github?: string;
    twitter?: string;
  };
  portfolioUrl?: string;
  totalSubmissions: number;
  rankingHistory?: Array<{ date: string; rank: number; score: number }>;
  achievementBadges?: string[];
  competitionWins: number;
  role: "Designer" | "Admin" | "Judge" | "Visitor";
  createdAt: any;
}

export interface ScoreBreakdown {
  creativity: number;       // 30% weight
  visualAppeal: number;     // 25% weight
  uxFunctionality: number;  // 20% weight
  technical: number;        // 15% weight
  brandComm: number;        // 10% weight
  overall: number;          // 0 - 100
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  images: string[];          // Base64 encoded or external URLs
  category: string;
  tags: string[];
  software: string;
  createdAt: any;
  challengeId?: string;       // Connected weekly challenge (if any)
  commentsCount: number;
  likesCount: number;
  viewsCount: number;
  scores?: ScoreBreakdown;
  aiFeedback?: {
    feedback: string;       // Markdown feedback
    strengths: string[];
    improvements: string[];
  };
}

export interface Comment {
  id: string;
  submissionId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: any;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string[];
  startDate: any;
  endDate: any;
  winnerUserId?: string;
  winnerDisplayName?: string;
  winnerSubmissionId?: string;
  winnerSubmissionTitle?: string;
  winnerSubmissionImage?: string;
  prize: string;
  status: "active" | "completed" | "draft";
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "comment" | "like" | "follow" | "weekly_result" | "deadline" | "win";
  read: boolean;
  createdAt: any;
}

export const CATEGORIES = [
  "Logo Design",
  "Brand Identity",
  "Social Media Design",
  "UI/UX Design",
  "Web Design",
  "Packaging Design",
  "Motion Graphics",
  "Print Design",
  "Illustration",
  "Advertising Design"
];

export const SOFTWARE_OPTIONS = [
  "Figma",
  "Adobe Illustrator",
  "Adobe Photoshop",
  "Adobe After Effects",
  "Adobe InDesign",
  "Blender",
  "Procreate",
  "Canva",
  "Sketch",
  "Pixellab"
];

export const AVAILABLE_BADGES = [
  { id: "original_creator", label: "Original Creator", desc: "Uploaded your first design project", icon: "🎨" },
  { id: "gold_standard", label: "Gold Standard", desc: "Achieved an overall score > 90%", icon: "🌟" },
  { id: "critique_champion", label: "Critique Champion", desc: "Left 10 or more feedback comments", icon: "💬" },
  { id: "top_voter", label: "Top Designer", desc: "Accumulated more than 50 positive likes", icon: "🏆" },
  { id: "weekly_winner", label: "Weekly Winner", desc: "Won an official weekly theme challenge", icon: "👑" },
  { id: "veteran_designer", label: "Elite Designer", desc: "Published 5 or more design projects", icon: "🛡️" }
];
