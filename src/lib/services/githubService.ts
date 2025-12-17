// GitHub API Service for fetching PRs and code review comments

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubReviewComment {
  id: number;
  body: string;
  created_at: string;
  updated_at: string;
  path: string;
  line: number;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface GitHubPRWithComments extends GitHubPullRequest {
  review_comments: GitHubReviewComment[];
}

/**
 * Parse GitHub repo URL to extract owner and repo name
 * Example: https://github.com/coton-d3v/agregata-api -> { owner: 'coton-d3v', repo: 'agregata-api' }
 */
export function parseGitHubRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1].replace('.git', ''),
      };
    }

    return null;
  } catch (error) {
    console.error('Invalid GitHub repo URL:', repoUrl, error);
    return null;
  }
}

/**
 * Fetch all pull requests for a repository
 */
export async function fetchPullRequests(
  repoUrl: string,
  token?: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubPullRequest[]> {
  const repoInfo = parseGitHubRepoUrl(repoUrl);

  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL');
  }

  const { owner, repo } = repoInfo;
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url,
        message: errorData.message,
        documentation_url: errorData.documentation_url
      });
      throw new Error(
        `GitHub API error (${response.status}): ${errorData.message || response.statusText}. ` +
        `Vérifiez que le repository existe et que votre token a les permissions 'repo'.`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    throw error;
  }
}

/**
 * Fetch review comments for a specific pull request
 */
export async function fetchPRReviewComments(
  repoUrl: string,
  prNumber: number,
  token?: string
): Promise<GitHubReviewComment[]> {
  const repoInfo = parseGitHubRepoUrl(repoUrl);

  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL');
  }

  const { owner, repo } = repoInfo;
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/comments?per_page=100`;

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url,
        message: errorData.message,
        documentation_url: errorData.documentation_url
      });
      throw new Error(
        `GitHub API error (${response.status}): ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PR review comments:', error);
    throw error;
  }
}

/**
 * Fetch a pull request with all its review comments
 */
export async function fetchPRWithComments(
  repoUrl: string,
  prNumber: number,
  token?: string
): Promise<GitHubPRWithComments> {
  const repoInfo = parseGitHubRepoUrl(repoUrl);

  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL');
  }

  const { owner, repo } = repoInfo;

  // Fetch PR details
  const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const [prResponse, comments] = await Promise.all([
      fetch(prUrl, { headers }),
      fetchPRReviewComments(repoUrl, prNumber, token),
    ]);

    if (!prResponse.ok) {
      const errorData = await prResponse.json().catch(() => ({}));
      console.error('GitHub API Error Details:', {
        status: prResponse.status,
        statusText: prResponse.statusText,
        url: prUrl,
        message: errorData.message,
        documentation_url: errorData.documentation_url
      });
      throw new Error(
        `GitHub API error (${prResponse.status}): ${errorData.message || prResponse.statusText}`
      );
    }

    const prData = await prResponse.json();

    return {
      ...prData,
      review_comments: comments,
    };
  } catch (error) {
    console.error('Error fetching PR with comments:', error);
    throw error;
  }
}

/**
 * Fetch all pull requests with their review comments
 */
export async function fetchAllPRsWithComments(
  repoUrl: string,
  token?: string,
  state: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubPRWithComments[]> {
  const prs = await fetchPullRequests(repoUrl, token, state);

  const prsWithComments = await Promise.all(
    prs.map(async (pr) => {
      const comments = await fetchPRReviewComments(repoUrl, pr.number, token);
      return {
        ...pr,
        review_comments: comments,
      };
    })
  );

  return prsWithComments;
}

/**
 * Fetch PR review comments from the last N PRs made by a specific GitHub user
 */
export async function fetchPRCommentsByAuthor(
  repoUrl: string,
  githubUsername: string,
  token?: string,
  limit: number = 10
): Promise<import('@/lib/types').PRReviewComment[]> {
  // Fetch all PRs (open and closed)
  const allPRs = await fetchAllPRsWithComments(repoUrl, token, 'all');

  // Sort by creation date (most recent first) and limit to the last N PRs
  const recentPRs = allPRs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  // Extract all review comments from these PRs, filter by author
  const commentsByAuthor: import('@/lib/types').PRReviewComment[] = [];

  for (const pr of recentPRs) {
    const authorComments = pr.review_comments
      .filter(comment => comment.user.login.toLowerCase() === githubUsername.toLowerCase())
      .map(comment => ({
        id: comment.id,
        body: comment.body,
        path: comment.path,
        line: comment.line,
        createdAt: comment.created_at,
        prNumber: pr.number,
        prTitle: pr.title,
        prUrl: pr.html_url,
        // Code will be extracted separately if needed
        code: undefined,
      }));

    commentsByAuthor.push(...authorComments);
  }

  return commentsByAuthor;
}
