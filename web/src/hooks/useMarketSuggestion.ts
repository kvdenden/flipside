import { useQuery } from "@tanstack/react-query";

const fetchSuggestion = async (prediction: string) => {
  const response = await fetch(`/api/markets/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prediction }),
  });
  if (response.ok) {
    const { result } = await response.json();

    const { title, description } = result;
    const expirationDate = Date.parse(result.expirationDate);

    return { title, description, expirationDate };
  }

  return;
};

export default function useMarketSuggestion(prediction: string) {
  return useQuery({ queryKey: ["market-suggest", prediction], queryFn: () => fetchSuggestion(prediction) });
}
