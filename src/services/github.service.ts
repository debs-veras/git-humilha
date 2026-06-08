import axios from 'axios';
import { apiUrlGitHub } from '@/constants/urls';
import type { GitHubRepo, GitHubUser } from '@/types/github';

const axiosGitHub = axios.create({
  baseURL: apiUrlGitHub,
});

function throwError(status: number): never {
  if (status === 404) throw new Error('errors.notFound');
  if (status === 500) throw new Error('errors.github');
  throw new Error('errors.unknown');
}

function getStatusCode(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.status ?? 500;
  return 500;
}

async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  try {
    const response = await axiosGitHub.get<GitHubUser>(`users/${username}`);
    return response.data;
  } catch (error: unknown) {
    throwError(getStatusCode(error));
  }
}

async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await axiosGitHub.get<GitHubRepo[]>(
      `users/${username}/repos?per_page=100`
    );
    return response.data;
  } catch (error: unknown) {
    throwError(getStatusCode(error));
  }
}

export default async function getGitHubProfile(
  username: string
): Promise<{ user: GitHubUser; repos: GitHubRepo[] }> {
  const [user, repos] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
  ]);

  return { user, repos };
}
