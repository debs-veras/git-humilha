import type { GitHubRepo, GitHubUser } from '@/types/github';

function throwError(status: number) {
  if (status == 404) throw new Error('errors.notFound');
  else if (status == 500) throw new Error('errors.github');
  else throw new Error('errors.unknown');
}

export default async function getGitHubProfile(username: string): Promise<{ user: GitHubUser; repos: GitHubRepo[] }> {
  let res = await fetch(`https://api.github.com/users/${username}`);
  if (res.status != 200) throwError(res.status);
  const user = (await res.json()) as GitHubUser;

  res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
  if (res.status != 200) throwError(res.status);
  const repos = (await res.json()) as GitHubRepo[];

  return {
    user,
    repos,
  };
}
