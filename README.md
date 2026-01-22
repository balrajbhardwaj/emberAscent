# Ember Ascent

UK 11+ exam preparation platform for Year 4-5 students.

## Features

### For Children (Free)
- 🎯 Unlimited practice questions aligned with National Curriculum
- 📊 Ember Score (0-100) for difficulty assessment
- 💡 Three difficulty levels: Foundation, Standard, Challenge
- ⚡ Quick Byte - Daily 4-question mini-session
- 📈 Basic progress tracking

### For Parents (Ascent Tier - Paid)
- 📊 Advanced analytics dashboard with detailed insights
- 🏥 Learning Health Check - Detects rushing, fatigue, stagnant topics
- 📈 Growth tracking across subjects and difficulty levels
- 🎯 Performance heatmaps and benchmarking
- 📉 Detailed session analysis with time tracking

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ember-ascent
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                  # Next.js app router pages
  /(auth)            # Authentication pages (login, signup, setup)
  /(dashboard)       # Protected dashboard pages
    /practice        # Practice sessions with time tracking
    /progress        # Progress overview
    /analytics2      # Advanced analytics (Ascent tier)
    /bookmarks       # Saved questions
    /settings        # User settings
  /(marketing)       # Public marketing pages (pricing, transparency)
  /api               # API routes
    /adaptive        # Adaptive difficulty system
    /analytics       # Analytics endpoints (learning-health)
    /reports         # Report generation
/components          # React components
  /ui                # shadcn/ui components
  /analytics         # Analytics dashboard components
  /practice          # Practice session components
  /progress          # Progress tracking components
/hooks               # Custom React hooks
/lib                 # Utility functions
  /supabase          # Supabase client configuration
  /scoring           # Ember Score calculations
  /analytics         # Analytics data processing
  /adaptive          # Adaptive learning algorithms
/types               # TypeScript type definitions
/supabase            # Supabase migrations and config
  /migrations        # Database schema migrations
/scripts             # Maintenance and testing scripts
```

## Development

### Code Style

- Use functional components with hooks
- Named exports for components
- TypeScript interfaces over types
- snake_case for database columns
- camelCase for TypeScript variables

### Adding UI Components

Install shadcn/ui components:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

### Database

- All tables use RLS (Row Level Security)
- Parents can only access their children's data
- Standard columns: id (uuid), created_at, updated_at

## License

Private - All rights reserved
