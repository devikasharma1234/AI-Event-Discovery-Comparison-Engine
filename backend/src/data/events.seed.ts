
const futureDate = (daysFromNow: number): Date => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const date = new Date(`${today}T18:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
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
        platform: "BookMyShow", price: 499, bookingUrl: "https://in.bookmyshow.com/",
        isDemo: true,
      },
      {
        platform: "District", price: 549, bookingUrl: "https://www.district.in/",
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
        platform: "BookMyShow", price: 399, bookingUrl: "https://in.bookmyshow.com/",
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
        platform: "BookMyShow", price: 250, bookingUrl: "https://in.bookmyshow.com/",
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
        platform: "District", price: 299, bookingUrl: "https://www.district.in/",
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
        platform: "BookMyShow", price: 899, bookingUrl: "https://in.bookmyshow.com/",
        isDemo: true,
      },
    ],
  },

{
  title: "Delhi Acoustic Sessions",
  description:
    "An intimate evening of acoustic music and emerging artists.",
  category: "Music",
  city: "Delhi",
  venue: "Demo Acoustic Studio",
  date: futureDate(9),
  durationMinutes: 100,
  minAge: 10,
  imageUrl: "",
  tags: ["acoustic", "indie", "live music"],
  rating: 4.8,
  ticketListings: [
    {
      platform: "BookMyShow", price: 450, bookingUrl: "https://in.bookmyshow.com/",
      isDemo: true,
    },
  ],
},
{
  title: "Delhi Classical Music Evening",
  description:
    "A classical instrumental music performance.",
  category: "Music",
  city: "Delhi",
  venue: "Demo Cultural Centre",
  date: futureDate(12),
  durationMinutes: 120,
  minAge: 8,
  imageUrl: "",
  tags: ["classical", "instrumental", "culture"],
  rating: 4.9,
  ticketListings: [
    {
      platform: "District", price: 350, bookingUrl: "https://www.district.in/",
      isDemo: true,
    },
  ],
},
{
  title: "City Lights Cricket",
  description: "A floodlit T20 exhibition with local clubs, a lively crowd, and food stalls.",
  category: "Sports",
  city: "Chandigarh",
  venue: "Sector 16 Cricket Stadium",
  date: futureDate(8),
  durationMinutes: 180,
  minAge: 0,
  imageUrl: "",
  tags: ["cricket", "sports", "family"],
  rating: 4.6,
  ticketListings: [{ platform: "BookMyShow", price: 325, bookingUrl: "https://in.bookmyshow.com/", isDemo: true }],
},
{
  title: "Sunday Street Food Social",
  description: "Try regional street food and watch live folk performances at an outdoor market.",
  category: "Festival",
  city: "Delhi",
  venue: "Dilli Haat, INA",
  date: futureDate(7 - futureDate(0).getUTCDay()),
  durationMinutes: 160,
  minAge: 0,
  imageUrl: "",
  tags: ["food", "family", "culture"],
  rating: 4.7,
  ticketListings: [
    { platform: "BookMyShow", price: 300, bookingUrl: "https://in.bookmyshow.com/", isDemo: true },
    { platform: "District", price: 350, bookingUrl: "https://www.district.in/", isDemo: true },
  ],
},
{
  title: "Open-Air Movie Club",
  description: "Bring the family to an open-air screening of an animated feature.",
  category: "Movies",
  city: "Delhi",
  venue: "Garden of Five Senses",
  date: futureDate(7 - futureDate(0).getUTCDay() + 7),
  durationMinutes: 110,
  minAge: 0,
  imageUrl: "",
  tags: ["movies", "family", "outdoors"],
  rating: 4.5,
  ticketListings: [{ platform: "BookMyShow", price: 350, bookingUrl: "https://in.bookmyshow.com/", isDemo: true }],
},
  {
    title: "Bengaluru After Hours Jazz",
    description: "A small-room jazz concert with an opening set from a local instrumental trio.",
    category: "Music", city: "Bengaluru", venue: "Indiranagar Arts Studio",
    date: futureDate(6), durationMinutes: 110, minAge: 12, imageUrl: "",
    tags: ["jazz", "live music", "concert"], rating: 4.7,
    ticketListings: [{ platform: "District", price: 599, bookingUrl: "https://www.district.in/", isDemo: true }],
  },
  {
    title: "Hyderabad Punchline Social",
    description: "An evening of stand-up with a rotating lineup of Hyderabad comedians.",
    category: "Comedy", city: "Hyderabad", venue: "Jubilee Hills Comedy Room",
    date: futureDate(8), durationMinutes: 90, minAge: 16, imageUrl: "",
    tags: ["comedy", "standup"], rating: 4.4,
    ticketListings: [{ platform: "BookMyShow", price: 449, bookingUrl: "https://in.bookmyshow.com/", isDemo: true }],
  },
  {
    title: "Jaipur Craft and Food Courtyard",
    description: "Browse local crafts and Rajasthan street food alongside live folk music.",
    category: "Festival", city: "Jaipur", venue: "Jawahar Kala Kendra Courtyard",
    date: futureDate(9), durationMinutes: 180, minAge: 0, imageUrl: "",
    tags: ["food", "culture", "family"], rating: 4.8,
    ticketListings: [{ platform: "District", price: 275, bookingUrl: "https://www.district.in/", isDemo: true }],
  },
  {
    title: "Chennai Stories on Screen",
    description: "A family-friendly showcase of animated shorts followed by a filmmaker conversation.",
    category: "Movies", city: "Chennai", venue: "Adyar Screening Room",
    date: futureDate(11), durationMinutes: 100, minAge: 0, imageUrl: "",
    tags: ["movies", "cinema", "family"], rating: 4.5,
    ticketListings: [{ platform: "BookMyShow", price: 320, bookingUrl: "https://in.bookmyshow.com/", isDemo: true }],
  },
  {
    title: "Kolkata Riverside Football Cup",
    description: "Watch local clubs compete in an evening five-a-side football showcase.",
    category: "Sports", city: "Kolkata", venue: "Maidan Community Ground",
    date: futureDate(12), durationMinutes: 150, minAge: 0, imageUrl: "",
    tags: ["sports", "football", "family"], rating: 4.6,
    ticketListings: [{ platform: "District", price: 350, bookingUrl: "https://www.district.in/", isDemo: true }],
  },
];

export const demoCatalog = dummyEvents.map((event, index) => ({
  ...event,
  _id: (index + 1).toString(16).padStart(24, "0"),
}));
