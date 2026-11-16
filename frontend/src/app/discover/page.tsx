import DiscoverWorkspace from "../../components/DiscoverWorkspace";
import { cities } from "../../lib/presentation";

export default async function Discover({ searchParams }: {
  searchParams: Promise<{ city?: string; personalized?: string }>;
}) {
  const query = await searchParams;
  const city = cities.find((value) => value === query.city) ?? "";
  const personalized = query.personalized === "1";
  return <DiscoverWorkspace key={JSON.stringify([city, personalized])} city={city} personalized={personalized} />;
}
