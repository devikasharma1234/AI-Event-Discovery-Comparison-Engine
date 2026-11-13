
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
