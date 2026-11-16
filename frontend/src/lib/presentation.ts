const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const money = (value: number) => currency.format(value);

export const eventDate = (date: string, withTime = false) =>
  new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withTime && { hour: "numeric", minute: "2-digit" }),
  });

export const categories = [
  { value: "", label: "All events", art: "music" },
  { value: "Music", label: "Music", art: "music" },
  { value: "Comedy", label: "Comedy", art: "comedy" },
  { value: "Movies", label: "Movies", art: "movies" },
  { value: "Festival", label: "Festivals", art: "festival" },
  { value: "Sports", label: "Sports", art: "sports" },
];

export const cities = ["Bengaluru", "Chandigarh", "Chennai", "Delhi", "Hyderabad", "Jaipur", "Kolkata", "Mumbai"];
