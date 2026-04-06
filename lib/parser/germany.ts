export function detectMerchat(text: string): string {
  const upper = text.toUpperCase();

  if (upper.includes("REWE")) return "rewe";
  if (upper.includes("ALDI")) return "aldi";
  if (upper.includes("LIDL")) return "lidl";
  if (upper.includes("EDEKA")) return "edeka";
  if (upper.includes("NETTO")) return "netto";
  if (upper.includes("PENNY")) return "penny";
  if (upper.includes("NORMA")) return "norma";
  if (upper.includes("KAUFLAND")) return "kaufland";
  return "unknown";
}

export function extractTotal(text: string): number | null {
  const lines = text.split("\n");

  for (const line of lines) {
    if (
      line.toUpperCase().includes("SUMME") ||
      line.toUpperCase().includes("ZO ZAHLEN")
    ) {
      const match = line.match(/(\d+,\d{2})/);

      if (match) {
        return parseFloat(match[1].replace(",", "."));
      }
    }
  }

  return null;
}

export function extractDateTime(text: string) {
  const match = text.match(/(\d{2}\.\d{2}\.\d{4})\s*(\d{2}:\d{2})?/);

  if (!match) {
    return { date: null, time: null };
  }

  const [_, dateRaw, time] = match;

  const [day, month, year] = dateRaw.split(".");

  return {
    date: `${year}-${month}-${day}`,
    time: time || null,
  };
}

export function extractItems(text: string) {
  const lines = text.split("\n");

  const items: { name: string; price: number }[] = [];

  for (const line of lines) {
    const match = line.match(/(.+?)\s+(\d+,\d{2})/);

    if (!match) continue;

    const name = match[1].trim();

    const price = parseFloat(match[2].replace(",", "."));

    if (
      name.toUpperCase().includes("SUMME") ||
      name.toUpperCase().includes("ZAHLEN")
    ) {
      continue;
    }

    items.push({ name, price });
  }

  return items;
}
