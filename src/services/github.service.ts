import axios from 'axios';
import { urlGitHub } from '@/constants/urls';
import type { GitHubRepo, GitHubUser } from '@/types/github';

const axiosGitHub = axios.create({
  baseURL: urlGitHub,
});

function throwError(status: number) {
  if (status === 404) throw new Error('errors.notFound');
  if (status === 500) throw new Error('errors.github');
  throw new Error('errors.unknown');
}

async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  try {
    const response = await axiosGitHub.get<GitHubUser>(`users/${username}`);
    return response.data;
  } catch (error: any) {
    throw throwError(error.response?.status || 500);
  }
}

async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await axiosGitHub.get<GitHubRepo[]>(`users/${username}/repos?per_page=100`);
    return response.data;
  } catch (error: any) {
    throw throwError(error.response?.status || 500);
  }
}

export default async function getGitHubProfile(username: string): Promise<{ user: GitHubUser; repos: GitHubRepo[] }> {
  const [user, repos] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
  ]);

  return { user, repos };
}
