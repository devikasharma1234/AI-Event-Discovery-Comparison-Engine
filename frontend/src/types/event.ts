
export interface SearchFilters {
  city?: string;
  category?: string;
  budget?: number;
  people: number;
  children?: number;
  age?: number;
  date?: string;
  endDate?: string;
  preferences?: string[];
}

export interface TicketListing {
  platform: string;
  price: number | null;
  officialListing?: boolean;
  bookingUrl: string;
  isDemo: boolean;
  totalCost?: number;
}

export interface ScoreBreakdown {
  budget: number;
  rating: number;
  preference: number;
  date: number;
  total: number;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  venue: string;
  date: string;
  durationMinutes: number | null;
  minAge: number | null;
  dateOnly?: boolean;
  schedule?: string;
  address?: string[];
  startingPrice?: number | null;
  demoPrice?: number;
  detailsLoaded?: boolean;
  source?: string;
  imageUrl: string;
  tags: string[];
  rating: number | null;
  ticketListings: TicketListing[];
  cheapestTotalCost: number | null;
  recommendationScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreWeights?: Omit<ScoreBreakdown, "total">;
  explanation: string;
}

export interface AIChatResponse {
  success: boolean;
  message?: string;
  reply: string;
  extractedFilters?: Record<string, unknown>;
  activeFilters: SearchFilters;
  needsClarification?: boolean;
  mode: "ai" | "basic";
  count: number;
  recommendations: Event[];
}
