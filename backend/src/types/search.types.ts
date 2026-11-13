
export interface SearchFilters {
  city?: string;
  category?: string;
  budget?: number;
  people: number;
  age?: number;
  date?: string;
}

export interface MatchedTicketListing {
  platform: string;
  price: number;
  bookingUrl: string;
  isDemo: boolean;
  totalCost: number;
}

export interface RecommendationFilters extends SearchFilters {
  preferences?: string[];
}

export interface RecommendationScores {
  budget: number;
  rating: number;
  preference: number;
  date: number;
  total: number;
}
