export function demoDelay(duration = 600) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export async function fetchDemoUrl(url: string) {
  await demoDelay(700);
  const parsed = new URL(url);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Use a complete http:// or https:// URL.");
  }
  if (parsed.hostname.includes("fail") || parsed.hostname.includes("invalid")) {
    throw new Error("We couldn’t fetch this page. Check the URL and try again.");
  }

  return {
    url,
    domain: parsed.hostname,
    title: "Digital campaign planning: a practical guide",
  };
}
