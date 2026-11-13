
const futureDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(18, 0, 0, 0);
  return date;
};

export const dummyEvents = [
  {
    title: "Delhi Indie Music Night",
    description:
      "An evening featuring independent musicians and live performances.",
    category: "Music",
    city: "Delhi",
    venue: "Demo Music Arena",
    date: futureDate(7),
    durationMinutes: 120,
    minAge: 12,
    imageUrl: "",
    tags: ["indie", "live music", "concert"],
    rating: 4.5,
    ticketListings: [
      {
        platform: "DemoTickets",
        price: 499,
        bookingUrl: "https://example.com",
        isDemo: true,
      },
      {
        platform: "EventHub Demo",
        price: 549,
        bookingUrl: "https://example.com",
        isDemo: true,
      },
    ],
  },
  {
    title: "Chandigarh Comedy Evening",
    description:
      "A fun stand-up comedy night with emerging comedians.",
    category: "Comedy",
    city: "Chandigarh",
    venue: "Demo Comedy Club",
    date: futureDate(10),
    durationMinutes: 90,
    minAge: 16,
    imageUrl: "",
    tags: ["standup", "comedy", "entertainment"],
    rating: 4.3,
    ticketListings: [
      {
        platform: "DemoTickets",
        price: 399,
        bookingUrl: "https://example.com",
        isDemo: true,
      },
    ],
  },
  {
    title: "Mumbai Family Movie Festival",
    description:
      "A family-friendly screening event with animated films.",
    category: "Movies",
    city: "Mumbai",
    venue: "Demo Cinema Hall",
    date: futureDate(5),
    durationMinutes: 150,
    minAge: 0,
    imageUrl: "",
    tags: ["movies", "family", "kids"],
    rating: 4.6,
    ticketListings: [
      {
        platform: "CinemaDemo",
        price: 250,
        bookingUrl: "https://example.com",
        isDemo: true,
      },
    ],
  },
  {
    title: "Delhi Food and Culture Festival",
    description:
      "Explore regional cuisines, performances and cultural activities.",
    category: "Festival",
    city: "Delhi",
    venue: "Demo Exhibition Grounds",
    date: futureDate(14),
    durationMinutes: 240,
    minAge: 0,
    imageUrl: "",
    tags: ["food", "culture", "family"],
    rating: 4.4,
    ticketListings: [
      {
        platform: "FestivalDemo",
        price: 299,
        bookingUrl: "https://example.com",
        isDemo: true,
      },
    ],
  },
  {
    title: "Mumbai Electronic Music Experience",
    description:
      "An electronic dance music event with DJs and live sets.",
    category: "Music",
    city: "Mumbai",
    venue: "Demo Arena Mumbai",
    date: futureDate(20),
    durationMinutes: 180,
    minAge: 18,
    imageUrl: "",
    tags: ["edm", "dj", "nightlife"],
    rating: 4.7,
    ticketListings: [
      {
        platform: "DemoTickets",
        price: 899,
        bookingUrl: "https://example.com",
        isDemo: true,
      },
    ],
  },
];
