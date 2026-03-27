const STOPWORDS = new Set([
  "the","and","for","that","with","this","from","have","about","just","they","you","your","into","http","https","are","was","were","will","would","there","their"
]);

export function cleanPostText(input: string): string {
  return input
    .replace(/https?:\/\/\S+/g, " ")
    .toLowerCase()
    .replace(/[!?.,]{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTokens(input: string): string[] {
  return cleanPostText(input)
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter((w) => !STOPWORDS.has(w))
    .filter((w) => /[#$@a-z0-9]/.test(w));
}

export function formatRelativeHours(nanos: number): string {
  const hours = Math.max(1, Math.floor((Date.now() * 1e6 - nanos) / 3.6e12));
  return `${hours} hours ago`;
}
