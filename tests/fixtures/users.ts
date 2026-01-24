/**
 * Test User Fixtures
 * 
 * Predefined test users for different scenarios
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  tier: 'free' | 'ascent';
  children?: TestChild[];
}

export interface TestChild {
  id: string;
  name: string;
  yearGroup: number;
  avatar: string;
  targetSchool?: string;
}

/**
 * Test users aligned with your existing test accounts
 */
export const TEST_USERS: Record<string, TestUser> = {
  // Free tier user - Sarah Thompson
  freeUser: {
    id: 'b1111111-1111-1111-1111-111111111111',
    email: 'test.sarah@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'Sarah Thompson',
    tier: 'free',
    children: [
      {
        id: 'c1111111-1111-1111-1111-111111111111',
        name: 'Oliver',
        yearGroup: 5,
        avatar: '👦',
        targetSchool: 'Aylesbury Grammar School',
      },
    ],
  },

  // Premium tier user - Emma Parker
  ascentUser: {
    id: 'b2222222-2222-2222-2222-222222222222',
    email: 'test.emma@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'Emma Parker',
    tier: 'ascent',
    children: [
      {
        id: 'c2222221-2222-2222-2222-222222222222',
        name: 'Lucas',
        yearGroup: 6,
        avatar: '👦',
        targetSchool: 'St Pauls School',
      },
      {
        id: 'c2222222-2222-2222-2222-222222222222',
        name: 'Mia',
        yearGroup: 5,
        avatar: '👧',
        targetSchool: 'St Pauls School',
      },
    ],
  },

  // Premium tier user - James Wilson (multiple children)
  multiChildUser: {
    id: 'b3333333-3333-3333-3333-333333333333',
    email: 'test.james@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'James Wilson',
    tier: 'ascent',
    children: [
      {
        id: 'c3333331-3333-3333-3333-333333333333',
        name: 'Sophia',
        yearGroup: 6,
        avatar: '👧',
        targetSchool: 'Kings College School',
      },
      {
        id: 'c3333332-3333-3333-3333-333333333333',
        name: 'Harry',
        yearGroup: 4,
        avatar: '👦',
      },
    ],
  },

  // User without children (for onboarding flow tests)
  noChildrenUser: {
    id: 'b4444444-4444-4444-4444-444444444444',
    email: 'test.newuser@emberascent.dev',
    password: 'TestPassword123!',
    fullName: 'New User',
    tier: 'free',
    children: [],
  },
};

/**
 * Sample question data for testing
 */
export const TEST_QUESTIONS = {
  mathematics: {
    id: 'q-math-001',
    subject: 'mathematics',
    topic: 'fractions',
    difficulty: 'standard',
    yearGroup: 5,
    questionText: 'What is 3/4 + 1/4?',
    optionA: '1',
    optionB: '4/8',
    optionC: '1/2',
    optionD: '3/8',
    optionE: null,
    correctAnswer: 'A',
    explanation: '3/4 + 1/4 = 4/4 = 1',
    emberScore: 85,
  },
  english: {
    id: 'q-eng-001',
    subject: 'english',
    topic: 'vocabulary',
    difficulty: 'foundation',
    yearGroup: 4,
    questionText: 'Choose the word closest in meaning to "happy".',
    optionA: 'sad',
    optionB: 'joyful',
    optionC: 'angry',
    optionD: 'tired',
    optionE: null,
    correctAnswer: 'B',
    explanation: 'Joyful and happy have similar meanings.',
    emberScore: 90,
  },
};
