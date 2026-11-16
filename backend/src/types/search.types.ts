
export interface SearchFilters {
  city?: string | undefined;
  category?: string | undefined;
  budget?: number | undefined;
  people: number;
  children?: number | undefined;
  age?: number | undefined;
  date?: string | undefined;
  endDate?: string | undefined;
}

export interface MatchedTicketListing {
  platform: string;
  price: number;
  bookingUrl: string;
  isDemo: boolean;
  totalCost: number;
}

export interface RecommendationFilters extends SearchFilters {
  preferences?: string[] | undefined;
}

export interface RecommendationScores {
  budget: number;
  rating: number;
  preference: number;
  date: number;
  total: number;
}
