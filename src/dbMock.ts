import { UserProfile, Submission, Comment, Challenge, UserNotification } from "./types";

// Helper to load from localStorage or fall back to default rich seeds
const LOCAL_STORAGE_KEY = "designrank_db_v2";

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: "admin-1",
    displayName: "Workspace Admin",
    email: "admin@workspace.com",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Head Platform Administrator and Design Competition Curator.",
    specialties: ["Brand Identity", "Motion Graphics", "Advertising Design"],
    portfolioUrl: "https://workspace.com",
    totalSubmissions: 0,
    achievementBadges: [],
    competitionWins: 0,
    role: "Admin",
    createdAt: new Date("2026-01-01").toISOString()
  }
];

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "challenge-active-1",
    title: "Retro-Futurism Soda Rebrand",
    description: "Reimagine a classic 80s soda brand for the year 2050. The design should capture nostalgic vaporwave aesthetics combined with ultra-clean futuristic layout guidelines, custom typography, or structural logo modifications.",
    rules: [
      "Must utilize a maximum of 4 distinct color schemes.",
      "The submission must provide a primary front-facing mockup of the packaging container.",
      "Include a fully custom typographic lockup for the logo.",
      "All visual elements must be original vectors or illustrations."
    ],
    startDate: new Date("2026-06-15T00:00:00Z").toISOString(),
    endDate: new Date("2026-06-22T23:59:59Z").toISOString(),
    prize: "$1,500 + Homepage Spotlight Placement & Official Digital Winner Certificate",
    status: "active"
  }
];

const DEFAULT_SUBMISSIONS: Submission[] = [];

const DEFAULT_COMMENTS: Comment[] = [];

const DEFAULT_NOTIFICATIONS: UserNotification[] = [];

export interface DesignRankDatabase {
  users: UserProfile[];
  submissions: Submission[];
  comments: Comment[];
  challenges: Challenge[];
  notifications: UserNotification[];
  likes: { [key: string]: boolean }; // key = "userId_submissionId"
  follows: { [key: string]: boolean }; // key = "followerId_followedId"
}

export class DbManager {
  private static data: DesignRankDatabase = DbManager.loadOrCreate();

  private static loadOrCreate(): DesignRankDatabase {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Ensure structure is correct
        if (parsed.users && parsed.submissions) {
          return parsed;
        }
      } catch (e) {
        console.error("Corrupted database found in local storage, recreating standard seed data.");
      }
    }
    const standard: DesignRankDatabase = {
      users: DEFAULT_USERS,
      submissions: DEFAULT_SUBMISSIONS,
      comments: DEFAULT_COMMENTS,
      challenges: DEFAULT_CHALLENGES,
      notifications: DEFAULT_NOTIFICATIONS,
      likes: {},
      follows: {}
    };
    DbManager.save(standard);
    return standard;
  }

  private static save(d: DesignRankDatabase) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(d));
    DbManager.data = d;
  }

  // User APIs
  static getUsers(): UserProfile[] {
    return DbManager.data.users;
  }

  static getUser(uid: string): UserProfile | undefined {
    return DbManager.data.users.find(u => u.uid === uid);
  }

  static saveUserProfile(profile: UserProfile): UserProfile {
    const list = [...DbManager.data.users];
    const index = list.findIndex(u => u.uid === profile.uid);
    if (index >= 0) {
      list[index] = profile;
    } else {
      list.push(profile);
    }
    DbManager.save({ ...DbManager.data, users: list });
    return profile;
  }

  static updateUserRole(uid: string, role: "Designer" | "Admin" | "Judge" | "Visitor"): UserProfile | undefined {
    const list = [...DbManager.data.users];
    const index = list.findIndex(u => u.uid === uid);
    if (index >= 0) {
      list[index] = { ...list[index], role };
      DbManager.save({ ...DbManager.data, users: list });
      return list[index];
    }
    return undefined;
  }

  // Submissions APIs
  static getSubmissions(): Submission[] {
    return DbManager.data.submissions;
  }

  static getSubmission(id: string): Submission | undefined {
    return DbManager.data.submissions.find(s => s.id === id);
  }

  static incrementViews(id: string) {
    const list = DbManager.data.submissions.map(s => {
      if (s.id === id) {
        return { ...s, viewsCount: s.viewsCount + 1 };
      }
      return s;
    });
    DbManager.save({ ...DbManager.data, submissions: list });
  }

  static addSubmission(sub: Submission): Submission {
    const submissions = [sub, ...DbManager.data.submissions];
    
    // Increment totalSubmission metrics for user
    const users = DbManager.data.users.map(u => {
      if (u.uid === sub.userId) {
        const total = u.totalSubmissions + 1;
        // Check standard badges
        const badges = [...(u.achievementBadges || [])];
        if (!badges.includes("original_creator")) {
          badges.push("original_creator");
        }
        if (total >= 5 && !badges.includes("veteran_designer")) {
          badges.push("veteran_designer");
        }
        if (sub.scores && sub.scores.overall >= 90 && !badges.includes("gold_standard")) {
          badges.push("gold_standard");
        }
        return { ...u, totalSubmissions: total, achievementBadges: badges };
      }
      return u;
    });

    DbManager.save({ ...DbManager.data, submissions, users });
    return sub;
  }

  static deleteSubmission(id: string) {
    const sub = DbManager.getSubmission(id);
    if (!sub) return;

    const submissions = DbManager.data.submissions.filter(s => s.id !== id);
    const comments = DbManager.data.comments.filter(c => c.submissionId !== id);

    // Decrement from user
    const users = DbManager.data.users.map(u => {
      if (u.uid === sub.userId) {
        return { ...u, totalSubmissions: Math.max(0, u.totalSubmissions - 1) };
      }
      return u;
    });

    DbManager.save({ ...DbManager.data, submissions, comments, users });
  }

  // Comments APIs
  static getComments(submissionId: string): Comment[] {
    return DbManager.data.comments.filter(c => c.submissionId === submissionId);
  }

  static addComment(comment: Comment, submissionAuthorId: string) {
    const comments = [comment, ...DbManager.data.comments];
    
    // Update submission count
    const submissions = DbManager.data.submissions.map(s => {
      if (s.id === comment.submissionId) {
        return { ...s, commentsCount: s.commentsCount + 1 };
      }
      return s;
    });

    // Add notification to author
    const notifs = [...DbManager.data.notifications];
    if (comment.userId !== submissionAuthorId) {
      notifs.unshift({
        id: `notif-${Math.random().toString(36).substr(2, 9)}`,
        userId: submissionAuthorId,
        title: "New Commentary",
        message: `${comment.userDisplayName} left a professional comment on your design.`,
        type: "comment",
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // Check comment badging
    const userCommentsCount = comments.filter(c => c.userId === comment.userId).length;
    let users = [...DbManager.data.users];
    if (userCommentsCount >= 10) {
      users = users.map(u => {
        if (u.uid === comment.userId) {
          const badges = [...(u.achievementBadges || [])];
          if (!badges.includes("critique_champion")) {
            badges.push("critique_champion");
          }
          return { ...u, achievementBadges: badges };
        }
        return u;
      });
    }

    DbManager.save({ ...DbManager.data, comments, submissions, notifications: notifs, users });
  }

  static deleteComment(id: string) {
    const comment = DbManager.data.comments.find(c => c.id === id);
    if (!comment) return;

    const comments = DbManager.data.comments.filter(c => c.id !== id);
    const submissions = DbManager.data.submissions.map(s => {
      if (s.id === comment.submissionId) {
        return { ...s, commentsCount: Math.max(0, s.commentsCount - 1) };
      }
      return s;
    });

    DbManager.save({ ...DbManager.data, comments, submissions });
  }

  // Likes System
  static getLikeStatus(userId: string, submissionId: string): boolean {
    return !!DbManager.data.likes[`${userId}_${submissionId}`];
  }

  static toggleLike(userId: string, submissionId: string, authorId: string) {
    const key = `${userId}_${submissionId}`;
    const likes = { ...DbManager.data.likes };
    let wasLiked = false;

    if (likes[key]) {
      delete likes[key];
    } else {
      likes[key] = true;
      wasLiked = true;
    }

    // Update submissions likes count
    const submissions = DbManager.data.submissions.map(s => {
      if (s.id === submissionId) {
        return { ...s, likesCount: s.likesCount + (wasLiked ? 1 : -1) };
      }
      return s;
    });

    // Notify author on like
    const notifs = [...DbManager.data.notifications];
    if (wasLiked && userId !== authorId) {
      const user = DbManager.getUser(userId);
      notifs.unshift({
        id: `notif-${Math.random().toString(36).substr(2, 9)}`,
        userId: authorId,
        title: "Design Liked",
        message: `${user?.displayName || "A designer"} liked your project artwork!`,
        type: "like",
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    DbManager.save({ ...DbManager.data, likes, submissions, notifications: notifs });
  }

  // Follows System
  static getFollowStatus(followerId: string, followedId: string): boolean {
    return !!DbManager.data.follows[`${followerId}_${followedId}`];
  }

  static toggleFollow(followerId: string, followedId: string) {
    const key = `${followerId}_${followedId}`;
    const follows = { ...DbManager.data.follows };
    let wasFollowed = false;

    if (follows[key]) {
      delete follows[key];
    } else {
      follows[key] = true;
      wasFollowed = true;
    }

    // Add notification
    const notifs = [...DbManager.data.notifications];
    if (wasFollowed) {
      const follower = DbManager.getUser(followerId);
      notifs.unshift({
        id: `notif-${Math.random().toString(36).substr(2, 9)}`,
        userId: followedId,
        title: "New Follower",
        message: `${follower?.displayName || "A designer"} is now following your design updates.`,
        type: "follow",
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    DbManager.save({ ...DbManager.data, follows, notifications: notifs });
  }

  // Challenges/Competition APIs
  static getChallenges(): Challenge[] {
    return DbManager.data.challenges;
  }

  static addChallenge(item: Challenge): Challenge {
    const list = [item, ...DbManager.data.challenges];
    DbManager.save({ ...DbManager.data, challenges: list });
    return item;
  }

  static finishChallengeAndSetWinner(challengeId: string, submissionId: string) {
    const sub = DbManager.getSubmission(submissionId);
    if (!sub) return;

    const challenges = DbManager.data.challenges.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          status: "completed" as const,
          winnerUserId: sub.userId,
          winnerDisplayName: sub.userDisplayName,
          winnerSubmissionId: sub.id,
          winnerSubmissionTitle: sub.title,
          winnerSubmissionImage: sub.images[0]
        };
      }
      return c;
    });

    // Increment user competitionWins & badge
    const users = DbManager.data.users.map(u => {
      if (u.uid === sub.userId) {
        const winsUpdated = u.competitionWins + 1;
        const badges = [...(u.achievementBadges || [])];
        if (!badges.includes("weekly_winner")) {
          badges.push("weekly_winner");
        }
        return { ...u, competitionWins: winsUpdated, achievementBadges: badges };
      }
      return u;
    });

    // Notify user
    const notifs = [...DbManager.data.notifications];
    notifs.unshift({
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      userId: sub.userId,
      title: "Weekly Challenge Winner!",
      message: `Congratulations! Your project '${sub.title}' won the '${DbManager.getChallengeTitle(challengeId)}' theme!`,
      type: "win",
      read: false,
      createdAt: new Date().toISOString()
    });

    DbManager.save({ ...DbManager.data, challenges, users, notifications: notifs });
  }

  private static getChallengeTitle(id: string): string {
    const c = DbManager.data.challenges.find(ch => ch.id === id);
    return c ? c.title : "Weekly Theme";
  }

  // Notifications API
  static getNotifications(userId: string): UserNotification[] {
    return DbManager.data.notifications.filter(n => n.userId === userId);
  }

  static markAllAsRead(userId: string) {
    const list = DbManager.data.notifications.map(n => {
      if (n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    DbManager.save({ ...DbManager.data, notifications: list });
  }

  static clearNotification(id: string) {
    const list = DbManager.data.notifications.filter(n => n.id !== id);
    DbManager.save({ ...DbManager.data, notifications: list });
  }
}
