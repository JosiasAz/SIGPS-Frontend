<div align="center">

<img src="../docs/logo.png" alt="Logo SIGPS" width="200">

# SIGPS Front-end

**Interface web do SIGPS - SPA Angular com RBAC, JWT e integração com fila inteligente**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[README principal](../README.md) · [DOCS.md](./DOCS.md) · [Backend](../SIGPS-Backend/README.md) · [Machine Learning](../SIGPS-Machine-Learning/README.md)

**TCC** - Faculdade Metropolitana de Manaus · Orientadora: Profª Luana Magalhães Leal

</div>

---

Aplicação **SPA** em **Angular 21** com rotas protegidas por perfil (**RBAC**), comunicação com o backend via **REST/JSON** e token **JWT**.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Stack tecnológica](#stack-tecnológica)
3. [Arquitetura do frontend](#arquitetura-do-frontend)
4. [Apresentação das telas](#apresentação-das-telas)
5. [Fluxogramas](#fluxogramas)
6. [Perfis e menu](#perfis-e-menu)
7. [Como executar](#como-executar)
8. [Estrutura do projeto](#estrutura-do-projeto)

---

## Visão geral

O frontend concentra toda a experiência do usuário: landing institucional, autenticação, painel administrativo/clínico e portal do paciente. Cada perfil enxerga apenas as rotas liberadas por `authGuard` e `roleGuard`.

```mermaid
flowchart LR
    U[Usuário] --> FE[SIGPS-Frontend :4200]
    FE -->|HTTPS JSON + JWT| BE[SIGPS-Backend :5000]
    BE --> ML[SIGPS-ML :8000]
```

---

## Stack tecnológica

| Tecnologia | Uso |
|------------|-----|
| Angular 21 | Framework SPA, componentes standalone |
| TypeScript | Tipagem e modelos de domínio |
| SCSS | Estilos por componente |
| RxJS | Fluxos assíncronos e serviços HTTP |
| Angular SSR | Renderização no servidor (build de produção) |
| jwt-decode | Leitura de claims do token |
| Vitest | Testes unitários |

---

## Arquitetura do frontend

```mermaid
flowchart TB
    subgraph Apresentacao["Camada de apresentação"]
        PAGES[Páginas / Componentes]
        PIPES[Pipes e diretivas]
    end

    subgraph Aplicacao["Camada de aplicação"]
        SVC[Serviços HTTP]
        GUARD[Guards: auth + role]
        INT[Auth Interceptor JWT]
    end

    subgraph Dados["Contratos de dados"]
        MODELS[Models TypeScript]
        ENV[environment.ts]
    end

    PAGES --> SVC
    SVC --> INT
    INT -->|API REST| API[(Backend Flask)]
    SVC --> MODELS
    GUARD --> PAGES
```

### Diagrama de componentes (painel)

```mermaid
classDiagram
    class Painel {
        +menuItems()
        +sidebar
        +topNavbar
    }
    class AuthService {
        +login()
        +logout()
        +currentUser
        +hasRole()
    }
    class AuthGuard
    class RoleGuard
    class RouterOutlet

    Painel --> AuthService
    Painel --> RouterOutlet
    AuthGuard ..> AuthService
    RoleGuard ..> AuthService
    RouterOutlet --> Dashboard
    RouterOutlet --> Fila
    RouterOutlet --> PortalPaciente
```

---

## Apresentação das telas

Capturas reais da interface em `docs/screenshots/`, geradas com **dados de demonstração** (mocks) para o TCC — sem telas vazias nem dependência do backend.

**Regenerar capturas:**

```bash
npm run screenshots:serve
# outro terminal:
npm run screenshots
```

### Mapa de navegação

```mermaid
flowchart TD
    L[Landing /] --> LOGIN[Login]
    L --> CAD[Cadastro]
    LOGIN --> PAINEL[Painel /painel]
    CAD --> LOGIN
    LOGIN --> ESQ[Esqueci senha]

    PAINEL --> DASH[Dashboard]
    PAINEL --> PORTAL[Portal do paciente]
    PAINEL --> PAC[Pacientes]
    PAINEL --> FILA[Fila inteligente]
    PAINEL --> AG[Agendas]
    PAINEL --> CHAT[Chat]
```

---

### Telas públicas (sem login)

#### Landing Page — `/` (hero / entrada)

Trecho inicial da página institucional: navegação, chamada principal e preview do painel.

![Landing Page — hero](./docs/screenshots/01-landing.png)

#### Login — `/login`

![Tela de login](./docs/screenshots/02-login.png)

#### Cadastro — `/cadastro`

![Tela de cadastro](./docs/screenshots/03-cadastro.png)

#### Esqueci minha senha — `/esqueci-senha`

![Esqueci minha senha](./docs/screenshots/04-esqueci-senha.png)

---

### Painel autenticado (`/painel`)

Layout com **sidebar** (perfis administrativos/clínicos) ou **layout full-width** (paciente). Barra superior com busca global, notificações e avatar.

| Tela | Rota | Perfis | Principais funções |
|------|------|--------|-------------------|
| **Dashboard** | `/painel/dashboard` | Admin, Gestor, Especialista, Visualizador | KPIs, gráficos e resumo operacional da unidade. |
| **Portal do paciente** | `/painel/portal-paciente` | Paciente | Hub com atalhos: explorar clínicas, agendar, exames, chat. |
| **Pacientes** | `/painel/pacientes` | Admin, Gestor, Especialista, Visualizador | Listagem, busca por nome/CPF e detalhes clínicos. |
| **Agendamentos** | `/painel/agendas` | Admin, Gestor, Especialista, Paciente | Criação de slots, marcação e gestão de consultas. |
| **Especialistas** | `/painel/especialistas` | Admin, Gestor | Cadastro e gestão de profissionais vinculados. |
| **Fila de espera** | `/painel/fila` | Gestor, Especialista, Visualizador | Fila ordenada por prioridade (IA); status e análise da fila. |
| **Gestão IA** | `/painel/gestao-ia` | Gestor, Especialista | Painel auxiliar de monitoramento da priorização. |
| **Explorar clínicas** | `/painel/explorar-clinicas` | Paciente | Descoberta de organizações de saúde. |
| **Busca profissionais** | `/painel/busca-profissionais` | Paciente, Admin, Gestor, Visualizador, Especialista | Busca e agendamento com especialistas. |
| **Perfil profissional** | `/painel/perfil-profissional/:id` | Vários | Visualização pública do profissional. |
| **Meu perfil** | `/painel/meu-perfil` | Todos autenticados | Conta, dados clínicos, clínica (gestor/especialista), verificação. |
| **Exames** | `/painel/exames` | Paciente + equipe | Upload e histórico de exames. |
| **Chat** | `/painel/chat` | Todos autenticados | Mensagens entre usuários. |
| **Relatórios** | `/painel/relatorios` | Admin, Gestor | Indicadores e exportação de dados. |
| **Configurações** | `/painel/config` | Admin | Parâmetros globais do sistema. |
| **Documentação** | `/painel/documentacao` | Todos autenticados | Arquitetura e stack (ajuda interna). |

#### Dashboard — `/painel/dashboard`

![Dashboard](./docs/screenshots/05-dashboard.png)

#### Portal do paciente — `/painel/portal-paciente`

![Portal do paciente](./docs/screenshots/06-portal-paciente.png)

#### Pacientes — `/painel/pacientes`

![Pacientes](./docs/screenshots/07-pacientes.png)

#### Fila de espera inteligente — `/painel/fila`

![Fila de espera](./docs/screenshots/08-fila.png)

#### Agendamentos — `/painel/agendas`

![Agendamentos](./docs/screenshots/09-agendas.png)

#### Chat — `/painel/chat`

![Chat](./docs/screenshots/10-chat.png)

#### Meu perfil — `/painel/meu-perfil`

![Meu perfil](./docs/screenshots/11-meu-perfil.png)

#### Explorar clínicas — `/painel/explorar-clinicas`

![Explorar clínicas](./docs/screenshots/12-explorar-clinicas.png)

#### Relatórios — `/painel/relatorios`

![Relatórios](./docs/screenshots/13-relatorios.png)

---

## Fluxogramas

### Fluxo de autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend

    U->>F: Informa e-mail e senha
    F->>B: POST /api/v1/auth/login
    alt Credenciais válidas
        B-->>F: access_token + refresh_token
        F->>F: Armazena JWT (localStorage)
        F->>F: authGuard libera /painel
        F-->>U: Redireciona por perfil
    else Inválidas
        B-->>F: 401
        F-->>U: Mensagem de erro
    end
```

### Fluxo de navegação por perfil

```mermaid
flowchart TD
    A[Login OK] --> B{Perfil?}
    B -->|Paciente| C[Portal do paciente]
    B -->|Gestor/Especialista| D[Dashboard]
    B -->|Admin| E[Dashboard + Config]
    B -->|Visualizador| F[Dashboard somente leitura]

    C --> G[Explorar / Agendar / Exames]
    D --> H[Pacientes / Fila / Agendas]
```

### Fluxo de agendamento (paciente)

```mermaid
flowchart LR
    A[Portal ou Busca profissionais] --> B[Escolhe especialista]
    B --> C[Visualiza agenda disponível]
    C --> D[Seleciona horário]
    D --> E[POST /schedules/agendar]
    E --> F[Consulta confirmada]
    F --> G[Notificação no painel]
```

### Fluxo de requisição HTTP (interceptor)

```mermaid
flowchart TD
    REQ[Requisição HTTP] --> INT{Token existe?}
    INT -->|Sim| HDR[Header Authorization Bearer]
    INT -->|Não| API
    HDR --> API[Backend API]
    API -->|401| LOGOUT[Logout e /login]
    API -->|2xx| OK[Atualiza UI]
```

---

## Perfis e menu

| Perfil | Itens principais no menu |
|--------|---------------------------|
| **Paciente** | Meu Portal, Meus Agendamentos, Explorar, Meu Perfil, Chat |
| **Gestor** | Dashboard, Agendamentos, Pacientes, Fila, Minha Clínica, Chat, Relatórios |
| **Especialista** | Dashboard, Meus Agendamentos, Pacientes, Fila, Minha Clínica, Chat |
| **Visualizador** | Dashboard, Pacientes, Fila, Chat |
| **Admin** | Todos + Especialistas, Relatórios, Configurações |

---

## Como executar

### Pré-requisitos

- Node.js 20+
- npm 11+

### Desenvolvimento

```bash
npm install
ng serve
```

Acesse: `http://localhost:4200`


### Build de produção

```bash
ng build
```

Artefatos em `dist/`.

### Testes

```bash
ng test
```

### Docker

Consulte o compose na pasta do projeto ou a stack na raiz do monorepo SIGPS.

---

## Estrutura do projeto

```
src/app/
├── config/           # app.config.ts (providers, interceptors)
├── core/             # guards, interceptors compartilhados
├── routes/           # app.routes.ts
├── pages/            # telas (landing, login, painel/*)
├── services/         # comunicação com API (auth, fila, pacientes...)
├── models/           # interfaces TypeScript
├── pipes/            # transformações de template
└── env/              # environment por ambiente
```

---

## Módulos relacionados

| Repositório | Função |
|-------------|--------|
| [SIGPS-Backend](../SIGPS-Backend/README.md) | API REST, persistência, integração ML |
| [SIGPS-Machine-Learning](../SIGPS-Machine-Learning/README.md) | Classificação de prioridade na fila |

---

## Equipe

Projeto desenvolvido como **Trabalho de Conclusão de Curso (TCC)** pela **Faculdade Metropolitana de Manaus**.

| Integrante | Papel |
|------------|-------|
| Josias Azevedo da Silva | Product Owner & Desenvolvedor Full-Stack |
| Kaio Oliveira Pantoja | Scrum Master & Tech Lead |
| Wagner Eduardo | Documentação |
| Matheus Akabane Brazão | Desenvolvedor Back-end |
| Ólliver de Aquino Freitas | Front-end UX/UI |
| Alan Nicolas Santos Maragua | QA — Quality Assurance |

### Orientação

**Professora orientadora:** 

    Profª Luana Magalhães Leal - Tech Manager & Profª de Tecnologia

---

<div align="center">

**SIGPS** — Trabalho de Conclusão de Curso · Gestão e priorização na saúde

[← Voltar ao README principal](../README.md)

</div>

