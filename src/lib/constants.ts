export const CATEGORIES = [
  'all', 'faith', 'hope', 'love', 'peace', 'gratitude', 'courage', 'wisdom', 'joy',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Nature-themed images for each category (using Unsplash)
export const categoryImages: Record<string, string> = {
  faith: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800',
  hope: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
  love: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
  peace: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  gratitude: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
  courage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  wisdom: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800',
  joy: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800',
};

export const causeConfig: Record<string, { label: string; icon: string }> = {
  general_fund: { label: 'General Fund', icon: 'heart' },
  missions: { label: 'Missions', icon: 'globe' },
  youth_ministry: { label: 'Youth Ministry', icon: 'people' },
  community_outreach: { label: 'Community Outreach', icon: 'hand-left' },
  building_fund: { label: 'Building Fund', icon: 'home' },
  worship: { label: 'Worship', icon: 'musical-notes' },
  education: { label: 'Education', icon: 'book' },
  disaster_relief: { label: 'Disaster Relief', icon: 'shield-checkmark' },
};

export const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];
