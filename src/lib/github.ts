// Fetches public GitHub stats for the dashboard. Cached for a day so we stay
// well under the unauthenticated rate limit (a GITHUB_TOKEN, if set, raises it).

export interface GitHubStats {
  username: string;
  publicRepos: number;
  totalStars: number;
  followers: number;
  topRepos: { name: string; stars: number; url: string }[];
}

/** Pulls a username out of a GitHub profile URL or a bare handle. */
export function parseGitHubUsername(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim().replace(/\/+$/, "");
  const match = trimmed.match(/github\.com\/([^/?#]+)/i);
  const handle = match ? match[1] : trimmed.startsWith("http") ? null : trimmed;
  return handle || null;
}

export async function getGitHubStats(username: string | null): Promise<GitHubStats | null> {
  if (!username) return null;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-dashboard",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 86_400 } }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
        headers,
        next: { revalidate: 86_400 },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) return null;

    const user = await userRes.json();
    const repos: Array<{ name: string; stargazers_count: number; html_url: string; fork: boolean }> =
      await reposRes.json();

    const owned = repos.filter((r) => !r.fork);
    const totalStars = owned.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const topRepos = [...owned]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({ name: r.name, stars: r.stargazers_count, url: r.html_url }));

    return {
      username,
      publicRepos: user.public_repos ?? owned.length,
      totalStars,
      followers: user.followers ?? 0,
      topRepos,
    };
  } catch (error) {
    console.error("GitHub stats error:", error);
    return null;
  }
}
