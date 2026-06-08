import { useTheme } from '@/contexts/ThemeContext';
import useToastLoading from '@/hooks/useToastLoading';
import {
  generateGithubRoast,
  type GithubRoastResult,
} from '@/services/gemini.service';
import getGitHubProfile from '@/services/github.service';
import { urlGitHub } from '@/constants/urls';
import type { GitHubProfile, GitHubRepo } from '@/types/github';
import { formatDateName } from '@/utils/formatar';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Bot,
  CalendarDays,
  Code2,
  Flame,
  GitBranch,
  GitFork,
  LoaderCircle,
  MapPin,
  Moon,
  RefreshCcw,
  Search,
  Star,
  Sun,
  Terminal,
  Users,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
const compactNumber = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullNumber = new Intl.NumberFormat('pt-BR');

const errorMessages: Record<string, string> = {
  'errors.notFound': 'Usuário não encontrado no GitHub.',
  'errors.github': 'O GitHub não respondeu como esperado. Tente novamente.',
  'errors.unknown': 'Não foi possível carregar esse perfil.',
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error)
    return errorMessages[error.message] ?? error.message;
  return 'Não foi possível carregar esse perfil.';
}

function normalizeUsername(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@+/, '')
    .split(/[/?#]/)[0];
}

function sortReposByImpact(repos: GitHubRepo[]) {
  return [...repos].sort((repoA, repoB) => {
    const starsDiff = repoB.stargazers_count - repoA.stargazers_count;
    if (starsDiff) return starsDiff;
    return (
      new Date(repoB.updated_at).getTime() -
      new Date(repoA.updated_at).getTime()
    );
  });
}

export default function Home() {
  const [userName, setUserName] = useState('');
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [roast, setRoast] = useState<GithubRoastResult | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToastLoading();
  const { theme, toggleTheme } = useTheme();

  const repositories = useMemo(() => profile?.repos ?? [], [profile]);
  const sourceRepos = useMemo(
    () => repositories.filter((repo) => !repo.fork),
    [repositories]
  );
  const totalStars = useMemo(
    () =>
      repositories.reduce((total, repo) => total + repo.stargazers_count, 0),
    [repositories]
  );
  const totalForks = useMemo(
    () => repositories.reduce((total, repo) => total + repo.forks_count, 0),
    [repositories]
  );
  const topRepos = useMemo(
    () => sortReposByImpact(repositories).slice(0, 6),
    [repositories]
  );
  const languages = useMemo(() => {
    const counters = repositories.reduce<Record<string, number>>(
      (acc, repo) => {
        if (!repo.language) return acc;
        acc[repo.language] = (acc[repo.language] ?? 0) + 1;
        return acc;
      },
      {}
    );

    return Object.entries(counters)
      .sort((languageA, languageB) => languageB[1] - languageA[1])
      .slice(0, 5);
  }, [repositories]);

  const roastProfile = async (nextProfile: GitHubProfile) => {
    setIsRoasting(true);
    setRoast(null);

    const result = await generateGithubRoast(nextProfile);
    setRoast(result);
    setIsRoasting(false);

    toast({
      message:
        result.provider === 'gemini'
          ? 'Humilhação gerada pelo Gemini.'
          : 'Humilhação local pronta. Configure Gemini para o modo IA.',
      type: result.provider === 'gemini' ? 'success' : 'info',
    });
  };

  const loadUser = async (
    event?: FormEvent<HTMLFormElement>,
    suggestedUser?: string
  ) => {
    event?.preventDefault();
    if (isLoadingProfile || isRoasting) return;

    const username = normalizeUsername(suggestedUser ?? userName);

    if (!username) {
      const message = 'Informe um usuário do GitHub.';
      setErrorMessage(message);
      toast({ message, type: 'warning' });
      return;
    }

    setUserName(username);
    setErrorMessage('');
    setProfile(null);
    setRoast(null);
    setIsLoadingProfile(true);

    try {
      toast({ message: 'Buscando vítima no GitHub...' });
      const response = await getGitHubProfile(username);
      setProfile(response);
      setIsLoadingProfile(false);
      toast({
        message: 'Perfil encontrado. Chamando o RoastHub...',
        type: 'success',
      });
      await roastProfile(response);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setProfile(null);
      setRoast(null);
      setErrorMessage(message);
      toast({
        message,
        type: 'error',
      });
    } finally {
      setIsLoadingProfile(false);
      setIsRoasting(false);
    }
  };

  const regenerateRoast = () => {
    if (!profile || isRoasting) return;
    void roastProfile(profile);
  };

  const isBusy = isLoadingProfile || isRoasting;

  const stats = profile
    ? [
        {
          label: 'Repositórios',
          value: compactNumber.format(profile.user.public_repos),
          detail: `${fullNumber.format(sourceRepos.length)} sem fork`,
          icon: Code2,
        },
        {
          label: 'Estrelas',
          value: compactNumber.format(totalStars),
          detail: `${fullNumber.format(totalForks)} forks`,
          icon: Star,
        },
        {
          label: 'Seguidores',
          value: compactNumber.format(profile.user.followers),
          detail: `${fullNumber.format(profile.user.following)} seguindo`,
          icon: Users,
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <Flame className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                RoastHub
              </p>
              <h1 className="truncate text-lg font-semibold">
                Auditoria sem piedade
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-card-foreground transition hover:border-foreground/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>
        </header>
        <div className="flex-1 py-8 lg:items-start">
          <section className="space-y-7 mb-5">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase text-red-700 dark:text-red-300">
                Seus projetos nem são tão bons assim
              </p>
              <div className="space-y-4">
                <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
                  Insira um perfil e deixe o Gemini julgar sem piedade.
                </h2>
                <p className="max-w-xl text-base leading-7 text-muted-foreground">
                  O app busca repositórios públicos, soma sinais de atividade e
                  devolve um roast baseado nos dados do GitHub.
                </p>
              </div>
            </div>

            <form
              onSubmit={loadUser}
              className="rounded-md border border-border bg-card p-3 shadow-sm"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex h-12 min-w-0 items-center rounded-md border border-input bg-background transition focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-ring/30">
                  <span className="hidden h-full shrink-0 items-center border-r border-border px-4 text-sm font-medium text-muted-foreground sm:flex">
                    github.com/
                  </span>
                  <span className="sr-only">Usuário do GitHub</span>
                  <Search
                    className="ml-4 size-4 shrink-0 text-muted-foreground sm:ml-3"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    placeholder="usuário ou @usuário"
                    autoComplete="off"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                    disabled={isBusy}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isBusy ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  )}
                  Humilhar
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p>{errorMessage}</p>
                </div>
              )}
            </form>
          </section>

          <section className="space-y-4">
            {!profile ? (
              <div className="rounded-md border border-dashed border-border bg-card p-6 shadow-sm">
                <div className="flex min-h-[430px] flex-col justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex size-12 items-center justify-center rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      <Terminal className="size-6" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold">
                        A humilhação aparece aqui.
                      </h3>
                      <p className="max-w-md text-sm leading-6 text-muted-foreground">
                        Digite um usuário para gerar o resumo do perfil, os
                        repositórios mais suspeitos e o roast final.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {['Perfil', 'Roast', 'Repos'].map((label) => (
                      <div
                        key={label}
                        className="rounded-md border border-border bg-background p-4"
                      >
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {label}
                        </p>
                        <div className="mt-4 h-2 rounded-sm bg-muted" />
                        <div className="mt-2 h-2 w-2/3 rounded-sm bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <article className="rounded-md border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <img
                      src={profile.user.avatar_url}
                      alt={`Avatar de ${profile.user.login}`}
                      className="size-20 rounded-md border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="truncate text-2xl font-semibold">
                            {profile.user.name || profile.user.login}
                          </h3>
                          <a
                            href={`${urlGitHub}/${profile.user.login}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-red-700 transition hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                          >
                            @{profile.user.login}
                          </a>
                        </div>
                        <a
                          href={`${urlGitHub}/${profile.user.login}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:border-foreground/30 hover:bg-accent"
                        >
                          <GitBranch className="size-4" aria-hidden="true" />
                          Abrir perfil
                        </a>
                      </div>

                      {profile.user.bio && (
                        <p className="text-sm leading-6 text-muted-foreground">
                          {profile.user.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        {profile.user.location && (
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="size-4" aria-hidden="true" />
                            {profile.user.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          Desde {formatDateName(profile.user.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-md border border-red-200 bg-red-50 p-5 text-red-950 shadow-sm dark:border-red-950 dark:bg-red-950/30 dark:text-red-50">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md bg-red-600 text-white dark:bg-red-500 dark:text-red-950">
                        <Bot className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Veredito do RoastHub
                        </h3>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {roast?.provider === 'gemini'
                            ? `Gemini: ${roast.model}`
                            : 'Modo local de emergência'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={regenerateRoast}
                      disabled={isRoasting}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-300 bg-white/70 px-3 text-sm font-medium transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-red-950/40 dark:hover:bg-red-950/70"
                    >
                      {isRoasting ? (
                        <LoaderCircle
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <RefreshCcw className="size-4" aria-hidden="true" />
                      )}
                      Repetir
                    </button>
                  </div>

                  {isRoasting ? (
                    <div className="space-y-3">
                      <div className="h-3 w-4/5 animate-pulse rounded-sm bg-red-200 dark:bg-red-900" />
                      <div className="h-3 w-full animate-pulse rounded-sm bg-red-200 dark:bg-red-900" />
                      <div className="h-3 w-3/5 animate-pulse rounded-sm bg-red-200 dark:bg-red-900" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-line text-sm leading-7">
                      {roast?.text}
                    </p>
                  )}
                </article>

                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <article
                        key={stat.label}
                        className="rounded-md border border-border bg-card p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.label}
                          </p>
                          <Icon
                            className="size-4 text-red-700 dark:text-red-300"
                            aria-hidden="true"
                          />
                        </div>
                        <strong className="mt-4 block text-3xl font-semibold">
                          {stat.value}
                        </strong>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {stat.detail}
                        </p>
                      </article>
                    );
                  })}
                </div>

                {languages.length > 0 && (
                  <article className="rounded-md border border-border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                        Linguagens envolvidas no crime
                      </h3>
                      <Code2
                        className="size-4 text-red-700 dark:text-red-300"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="space-y-3">
                      {languages.map(([language, count]) => {
                        const percentage = repositories.length
                          ? Math.round((count / repositories.length) * 100)
                          : 0;

                        return (
                          <div key={language} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium">{language}</span>
                              <span className="text-muted-foreground">
                                {count} repos
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-sm bg-muted">
                              <div
                                className="h-full rounded-sm bg-red-600 dark:bg-red-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                      Repositórios mais incriminadores
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      Top {topRepos.length}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {topRepos.map((repo) => (
                      <article
                        key={repo.id}
                        className="rounded-md border border-border bg-card p-4 shadow-sm transition hover:border-foreground/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <a
                            href={`${urlGitHub}/${profile.user.login}/${repo.name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 text-base font-semibold text-foreground transition hover:text-red-700 dark:hover:text-red-300"
                          >
                            <span className="block truncate">{repo.name}</span>
                          </a>
                          {repo.archived && (
                            <Archive
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-label="Arquivado"
                            />
                          )}
                        </div>

                        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                          {repo.description || 'Sem descrição publicada.'}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                          {repo.language && (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="size-2 rounded-sm bg-red-500" />
                              {repo.language}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="size-3.5" aria-hidden="true" />
                            {compactNumber.format(repo.stargazers_count)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <GitFork className="size-3.5" aria-hidden="true" />
                            {compactNumber.format(repo.forks_count)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
