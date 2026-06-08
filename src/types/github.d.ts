export interface GitHubUser {
  avatar_url: string;
  login: string;
  name?: string;
  bio?: string;
  location?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  description?: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  language: string;
  forks_count: number;
  archived: boolean;
  open_issues: number;
}

export interface GitHubProfile {
  user: GitHubUser;
  repos: GitHubRepo[];
}
