/**
 * Bulk Update Feature Status HTML
 * 
 * This script generates the complete feature metadata for all features
 * including tier (free/paid/na), priority (critical/normal), and descriptions.
 */

const featureMetadata = {
  // AUTHENTICATION MODULE
  "User Registration": {
    tier: "free",
    priority: "critical",
    description: "Core authentication flow allowing parents to create accounts with email/password. Includes comprehensive validation, automatic profile creation, and error handling for duplicate accounts. Essential for platform access and child profile management. Uses Supabase Auth with RLS policies for security."
  },
  "User Login": {
    tier: "free",
    priority: "critical",
    description: "Secure login system with session management and intelligent redirection. Automatically detects if user needs to complete onboarding or can proceed to practice. Session persistence ensures users remain logged in across browser sessions. Implements middleware protection for authenticated routes."
  },
  "Password Recovery": {
    tier: "free",
    priority: "normal",
    description: "Self-service password reset functionality using email-based token system. Parents can request password reset link, receive secure token via email, and set new password through protected reset page. Tokens expire after set time for security. Leverages Supabase Auth password recovery flow."
  },
  "Onboarding": {
    tier: "free",
    priority: "critical",
    description: "First-time user setup flow for creating initial child profile. Collects minimal data per ICO Children's Code: first name only, year group (3-6), and exam target school. Fun emoji-based avatar selection for child engagement. Validates input and redirects to practice dashboard. Data minimization ensures GDPR compliance."
  },
  
  // PRACTICE MODULE
  "Quick Byte (Daily 4-question mode)": {
    tier: "free",
    priority: "critical",
    description: "Daily practice mode featuring exactly 4 questions across subjects. Designed for consistent, bite-sized learning without overwhelming children. Immediate feedback after each answer with explanations. Tracks daily completion for streak mechanics. Questions selected by adaptive engine based on child's year group and performance history."
  },
  "Mock Tests": {
    tier: "free",
    priority: "critical",
    description: "Full-length timed practice exams simulating real 11+ test conditions. Five template types: Standard (balanced), Maths Focus, English Focus, Verbal Reasoning Focus, and Quick (20 mins). Features countdown timer with warning states, question flagging, grid navigator, and comprehensive results analysis with recommendations. Auto-submits on timer expiry."
  },
  "Focus Sessions": {
    tier: "free",
    priority: "critical",
    description: "Topic-specific practice allowing children to drill down on particular subjects or areas. Parents and children can select subject, topic, difficulty level, and question count. Questions adapt based on performance. Ideal for targeted improvement after identifying weaknesses in analytics. Supports bookmarking difficult questions for review."
  },
  "Adaptive Engine": {
    tier: "free",
    priority: "critical",
    description: "Core AI-powered question selection algorithm tracking per-topic performance and dynamically adjusting difficulty. Uses Ember Score (60-100 difficulty rating) and child's historical accuracy to select optimal next questions. Implements spaced repetition for topics not practiced recently. Ensures balanced subject distribution and appropriate challenge level."
  },
  
  // ANALYTICS MODULE (All Ascent Tier)
  "Weakness Heatmap": {
    tier: "paid",
    priority: "normal",
    description: "Visual grid showing topic-level performance with color-coded accuracy rates. Green (>80%), yellow (60-80%), red (<60%). Allows drill-down to subtopics and National Curriculum objectives. Parents can click topics to start targeted Focus Sessions. Updates in real-time as child completes practice. Ascent tier exclusive feature."
  },
  "Learning Health Check": {
    tier: "paid",
    priority: "normal",
    description: "Advanced behavioral analysis detecting rush patterns (answering too quickly), fatigue indicators (declining accuracy over session), and stagnant topics (no improvement over time). Provides actionable insights for parents to optimize practice timing and identify when breaks are needed. Uses statistical analysis of answer timing and accuracy trends."
  },
  "Readiness Score": {
    tier: "paid",
    priority: "normal",
    description: "Composite 0-100 score predicting exam readiness based on multiple factors: subject mastery, consistency, mock test performance, topic coverage, and time management. Components weighted appropriately with transparent breakdown. Historical tracking shows improvement over time. Updated after each practice session. Helps parents gauge preparation level objectively."
  },
  "Growth Tracking": {
    tier: "paid",
    priority: "normal",
    description: "Time-series charts visualizing performance trends across subjects over weeks and months. Shows accuracy improvements, question count growth, and difficulty progression. Includes peer benchmarking (anonymized, aggregate data) to contextualize progress. Helps identify plateaus and celebrate growth milestones. Export to PDF for school applications."
  },
  "Study Plans & Recommendations": {
    tier: "paid",
    priority: "normal",
    description: "AI-generated personalized action items based on child's performance patterns. Four recommendation types: urgent weaknesses, practice more, avoid burnout, and celebrate strengths. Priority-based ordering with specific next-action guidance. Weekly email reports (infrastructure ready) will summarize recommendations for parents."
  },
  
  // PROGRESS MODULE
  "Session History": {
    tier: "free",
    priority: "normal",
    description: "Complete log of all practice sessions with filtering by type (Quick Byte/Mock/Focus), subject, date range, and score. Each entry shows questions attempted, accuracy, time spent, and session type. Click to review detailed Q&A breakdown with explanations for incorrect answers. Parents can track practice volume and consistency."
  },
  "Topic Progress": {
    tier: "free",
    priority: "normal",
    description: "Subject and topic breakdown showing completion percentages and accuracy rates. Visualizes which areas have sufficient practice vs gaps. Difficulty distribution chart shows exposure to Foundation, Standard, and Challenge questions. Helps guide Focus Session topic selection. Updated real-time as child practices."
  },
  "Bookmarks": {
    tier: "free",
    priority: "normal",
    description: "Save difficult or interesting questions for later review. Children can flag questions during practice; parents can view bookmarked questions list anytime. Each bookmark shows question text, child's answer, correct answer, and explanation. One-click removal. Useful for targeted review before exams or Focus Sessions on challenging questions."
  },
  
  // GAMIFICATION MODULE
  "Achievements System": {
    tier: "free",
    priority: "normal",
    description: "20 seeded achievements across 4 categories (Practice, Mastery, Speed, Milestones) with 4 rarity levels (Common, Rare, Epic, Legendary). Auto-detection of 7 criteria types: first_session, streak milestones, total_correct, subject_mastery, speed records, perfect_session, first_mock. Unlock notifications with gold gradient styling. Category filtering in achievements page."
  },
  "Streak Tracking": {
    tier: "free",
    priority: "normal",
    description: "Daily practice streak counter with visual flame icon that grows and changes color (bronze→silver→gold→platinum). 30-day calendar visualization showing practice days. At-risk warnings if yesterday missed (grace period before streak loss). Ascent tier users get 3 streak freezes to protect streaks during holidays/illness. Encourages consistency."
  },
  
  // SETTINGS MODULE
  "Profile Management": {
    tier: "free",
    priority: "normal",
    description: "Parent account settings: update name, email, password. Email notification preferences for weekly reports, achievement unlocks, and milestone alerts. Profile updates validated and reflected immediately. Password changes require current password confirmation for security. Email changes trigger verification flow."
  },
  "Child Management": {
    tier: "free",
    priority: "critical",
    description: "Add multiple child profiles (siblings), edit existing profiles (name, avatar, year group, target school), switch active child (dropdown in navigation), soft delete child profiles (archived, not permanently deleted). Each child has isolated practice data via RLS policies. Parents see all children's progress in unified dashboard."
  },
  "Subscription Management": {
    tier: "na",
    priority: "normal",
    description: "View current tier (Free/Ascent) and feature comparison. Upgrade to Ascent via Stripe integration (planned). Manage billing details, payment methods, invoices. Cancel subscription (maintains access until period end, then downgrades to Free). Prorated refunds for cancellations. Stripe webhook handling for subscription events."
  },
  
  // ADMIN MODULE
  "User Management": {
    tier: "na",
    priority: "normal",
    description: "Admin dashboard for viewing all users with search and filtering (email, tier, registration date). Impersonation tool for support (logged in audit_log with start/end times, reason). View user's children, sessions, and subscription status. Manually upgrade/downgrade subscriptions. Audit log tracks all admin actions with IP address and timestamp."
  },
  "Question Management": {
    tier: "na",
    priority: "critical",
    description: "Review user-reported errors via feedback system. Edit question content (text, options, correct answer, explanations, curriculum tags) with version history. Update Ember scores after edits (runs recalculation). Bulk import questions from JSON/CSV with validation. Export question sets for backup. Approve new questions from reviewers."
  },
  "Analytics Dashboard": {
    tier: "na",
    priority: "normal",
    description: "Platform-wide metrics: total users, active users (7/30 days), questions answered today/week/month, average session length, tier distribution (Free vs Ascent). Revenue tracking from Stripe (MRR, churn rate, LTV). Top performing questions by accuracy. User engagement heatmaps. Export reports for business analysis."
  },
  
  // REVIEWER MODULE
  "Review Queue": {
    tier: "na",
    priority: "normal",
    description: "Question reviewer dashboard showing assigned questions pending review. Review interface displays question, all options, correct answer, explanations, curriculum alignment, and AI rationale. Reviewers submit feedback: approve (publish), reject (return to author), or needs-work (request revisions). Timed sessions for quality control (10 questions/hour target)."
  },
  "Review History": {
    tier: "na",
    priority: "normal",
    description: "Log of completed reviews with filters by date, decision (approved/rejected/needs-work), and subject. Shows reviewer stats: approval rate, average time per review, total reviews. Earnings tracker summing payment for approved reviews (£0.50/question). Payment history with invoice generation. Admin can audit reviewer quality and accuracy."
  },
  "Stats Dashboard": {
    tier: "na",
    priority: "normal",
    description: "Reviewer performance metrics: reviews completed count, accuracy rate (admin approvals of reviewer decisions), average review time, earnings this month/all-time. Leaderboard comparing reviewers (anonymized). Payment status (pending, processing, paid). Badges for milestone reviews (100, 500, 1000 reviews). Helps gamify reviewer engagement."
  },
  
  // MARKETING MODULE
  "Landing Page": {
    tier: "na",
    priority: "critical",
    description: "Public-facing homepage with compelling value proposition: 'Free 11+ prep for every child. Advanced analytics for parents who want more.' Feature highlights with screenshots. Social proof (testimonials, user count). Clear CTA buttons for signup and login. Mobile-responsive design. Fast load times. SEO optimized for '11+ practice' keywords."
  },
  "Pricing Page": {
    tier: "na",
    priority: "critical",
    description: "Side-by-side comparison of Free vs Ascent tier features. Transparent pricing (£14.99/month or £149/year). Emphasizes free tier capabilities to build trust. Clear explanation of what Ascent unlocks (analytics, insights, reports). No hidden fees messaging. Monthly/annual toggle. FAQ section addressing common questions. CTA to upgrade or start free."
  },
  "Transparency Pages": {
    tier: "na",
    priority: "normal",
    description: "Dedicated pages explaining platform philosophy: question creation process (AI generation + human review), Ember Score methodology, adaptive algorithm logic, data usage policies, child safety measures (ICO Children's Code compliance). Builds trust with parents by demystifying 'black box' of edtech. Links to privacy policy and security practices."
  },
  "Why Analytics Page": {
    tier: "na",
    priority: "normal",
    description: "Educational content explaining value of analytics for exam preparation: identifying hidden weaknesses, tracking growth objectively, optimizing study time, avoiding burnout through health checks. Sample insights previews with anonymized examples. Testimonials from parents about analytics impact. Soft sell for Ascent upgrade. Helps justify paid tier value."
  }
};

console.log("Feature metadata ready for", Object.keys(featureMetadata).length, "features");
console.log(JSON.stringify(featureMetadata, null, 2));
