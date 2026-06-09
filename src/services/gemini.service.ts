import type { GitHubProfile, GitHubRepo } from '@/types/github';

export type RoastProvider = 'gemini' | 'local';

export interface GithubRoastResult {
  text: string;
  provider: RoastProvider;
  model: string;
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

function getGeminiConfig() {
  return {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY?.trim() ?? '',
    model: import.meta.env.VITE_GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  };
}

function getRepoImpact(repo: GitHubRepo) {
  return repo.stargazers_count * 3 + repo.forks_count * 2;
}

function getTopRepos(repos: GitHubRepo[], limit = 8) {
  return [...repos]
    .sort((repoA, repoB) => {
      const impactDiff = getRepoImpact(repoB) - getRepoImpact(repoA);
      if (impactDiff) return impactDiff;
      return (
        new Date(repoB.updated_at).getTime() -
        new Date(repoA.updated_at).getTime()
      );
    })
    .slice(0, limit);
}

function getMainLanguage(repos: GitHubRepo[]) {
  const counters = repos.reduce<Record<string, number>>((acc, repo) => {
    if (!repo.language) return acc;
    acc[repo.language] = (acc[repo.language] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counters).sort(
    (languageA, languageB) => languageB[1] - languageA[1]
  )[0]?.[0];
}

function isRepoStale(repo: GitHubRepo) {
  const updatedAt = new Date(repo.updated_at).getTime();
  const twoYears = 1000 * 60 * 60 * 24 * 365 * 2;
  return Date.now() - updatedAt > twoYears;
}

function summarizeProfile(profile: GitHubProfile) {
  const repos = profile.repos;
  const totalStars = repos.reduce(
    (total, repo) => total + repo.stargazers_count,
    0
  );
  const totalForks = repos.reduce((total, repo) => total + repo.forks_count, 0);

  return {
    login: profile.user.login,
    name: profile.user.name,
    bio: profile.user.bio,
    publicRepos: profile.user.public_repos,
    followers: profile.user.followers,
    following: profile.user.following,
    accountCreatedAt: profile.user.created_at,
    collectedRepos: repos.length,
    originalRepos: repos.filter((repo) => !repo.fork).length,
    forkedRepos: repos.filter((repo) => repo.fork).length,
    archivedRepos: repos.filter((repo) => repo.archived).length,
    staleRepos: repos.filter(isRepoStale).length,
    reposWithoutDescription: repos.filter((repo) => !repo.description).length,
    totalStars,
    totalForks,
    mainLanguage: getMainLanguage(repos),
    topRepos: getTopRepos(repos).map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues,
      archived: repo.archived,
      fork: repo.fork,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    })),
  };
}

function buildRoastPrompt(profile: GitHubProfile) {
  const summary = summarizeProfile(profile);

  return `
Você é o redator principal de um app chamado "Git Humilha".
Sua missão é transformar dados públicos de um perfil GitHub em uma humilhação
engraçada, específica e memorável sobre o portfólio de código.

Tom:
- Português do Brasil, seja extremamente breve, sarcástico e ácido sobre perfil no GitHub.
- Pareça um dev sênior cansado lendo um README às 2 da manhã.
- Seja espirituoso, não genérico. Prefira piadas baseadas em números, nomes de repos, linguagens, forks, estrelas, repos arquivados, repos sem descrição e atividade.

Regras:
- Zombe do portfólio, dos repositórios, dos nomes, da atividade e dos números, nunca da pessoa fora do contexto técnico.
- Ignore repositorios que o nome é igual o do usuário.
- Não ataque aparência, identidade, nacionalidade, gênero, orientação, religião, saúde ou localização.
- Não invente dados. Use apenas os dados abaixo.
- Não incentive assédio real. A vibe é "roast de código", não ataque pessoal.
- Não dê nota, placar, ranking, selo, porcentagem inventada ou avaliação numérica final.
- Não peça desculpas e não explique as regras.

Dados do perfil:
${JSON.stringify(summary, null, 2)}
`.trim();
}

function buildLocalRoast(profile: GitHubProfile) {
  const summary = summarizeProfile(profile);
  const bestRepo = summary.topRepos[0];
  const totalStars = summary.totalStars;
  const repoCount = summary.collectedRepos;
  const emptyDescriptionCount = summary.reposWithoutDescription;
  const staleCount = summary.staleRepos;
  const archivedCount = summary.archivedRepos;
  const mainLanguage = summary.mainLanguage ?? 'linguagem misteriosa';

  const bestRepoLine = bestRepo
    ? `- O destaque é "${bestRepo.name}", com ${bestRepo.stars} estrelas; pelo menos alguém além do seu localhost viu isso.`
    : '- Não achei nenhum repositório para humilhar. Isso é quase uma defesa técnica.';

  return [
    `Veredito para @${summary.login}: o GitHub carregou, mas a autoestima do README não.`,
    `- ${summary.publicRepos} repos públicos, ${repoCount} analisados e ${summary.originalRepos} parecem não ser fork; coragem estatística existe.`,
    bestRepoLine,
    `- A linguagem dominante é ${mainLanguage}; ela provavelmente pediu para não ser envolvida nessa história.`,
    `- ${emptyDescriptionCount} repos sem descrição e ${staleCount} parados há anos: documentação por telepatia continua invicta.`,
    `- ${archivedCount} arquivados, ${summary.totalForks} forks e ${totalStars} estrelas no total: tem material suficiente para um post-mortem.`,
    'Conselho maldoso, mas útil: apague o que é museu, escreva README decente e pare de chamar experimento abandonado de portfólio.',
  ].join('\n');
}

async function requestGeminiRoast(
  prompt: string,
  apiKey: string,
  model: string
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 700,
          temperature: 0.95,
          topP: 0.9,
        },
      }),
    }
  );

  const data = (await response
    .json()
    .catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Gemini request failed.');
  }

  const text = data?.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) throw new Error('Gemini returned an empty response.');

  return text;
}

export async function generateGithubRoast(
  profile: GitHubProfile
): Promise<GithubRoastResult> {
  const { apiKey, model } = getGeminiConfig();

  if (!apiKey) {
    return {
      text: buildLocalRoast(profile),
      provider: 'local',
      model: 'fallback-local',
    };
  }

  try {
    const text = await requestGeminiRoast(
      buildRoastPrompt(profile),
      apiKey,
      model
    );

    return {
      text,
      provider: 'gemini',
      model,
    };
  } catch {
    return {
      text: buildLocalRoast(profile),
      provider: 'local',
      model: 'fallback-local',
    };
  }
}
