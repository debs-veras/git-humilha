# RoastHub

RoastHub é uma aplicação React que analisa perfis públicos do GitHub e gera um roast técnico sobre os repositórios, linguagens, estrelas, forks, projetos arquivados e sinais de atividade.

A proposta é brincar com o portfólio de código, sem atacar a pessoa por trás do perfil.

## Funcionalidades

- Busca perfil público pelo usuário, `@usuario` ou URL do GitHub.
- Lista métricas do perfil: repositórios, estrelas, forks, seguidores e linguagens.
- Exibe repositórios em destaque ordenados por impacto.
- Gera um veredito debochado usando Gemini.
- Usa um fallback local quando a chave do Gemini não está configurada.
- Suporta tema claro/escuro.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- React Toastify
- Lucide React
- Gemini API

## Como Rodar

Instale as dependências:

```bash
pnpm install
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure a chave do Gemini no `.env`:

```env
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_GEMINI_MODEL=
```

Inicie o servidor local:

```bash
pnpm dev
```

Acesse a URL exibida pelo Vite, normalmente:

```text
http://localhost:5173
```

## Variáveis de Ambiente

| Variável              | Obrigatória | Descrição                                                                     |
| --------------------- | ----------- | ----------------------------------------------------------------------------- |
| `VITE_GEMINI_API_KEY` | Não         | Chave usada para gerar o roast com Gemini. Sem ela, o app usa fallback local. |
| `VITE_GEMINI_MODEL`   | Não         | Modelo Gemini usado na geração. Padrão: `gemini-2.5-flash`.                   |

## Scripts

```bash
pnpm dev
```

Roda a aplicação em modo desenvolvimento.

```bash
pnpm build
```

Compila TypeScript e gera o build de produção.

```bash
pnpm lint
```

Executa o ESLint no projeto.

```bash
pnpm preview
```

Serve localmente o build gerado.

```bash
pnpm format
```

Formata os arquivos com Prettier.

## Observação Sobre a Chave do Gemini

Variáveis `VITE_*` ficam expostas no bundle do frontend. Para um projeto público ou em produção, o ideal é chamar o Gemini por um backend/proxy próprio e manter a chave fora do navegador.

## Estrutura Principal

```text
src/
  contexts/          Tema claro/escuro
  hooks/             Hooks compartilhados
  pages/Home/        Tela principal do RoastHub
  services/          GitHub API e Gemini API
  types/             Tipos TypeScript
  utils/             Formatadores e utilitários
```

## Aviso

O RoastHub foi feito para humor e crítica técnica leve. O prompt evita ataques sobre aparência, identidade, religião, nacionalidade, saúde ou qualquer característica pessoal fora do contexto do código.
