# Documentação do Front-end - SIGPS-Frontend

Esta documentação descreve a estrutura, tecnologias e organização do projeto **SIGPS-Frontend**.

## 1. Visão Geral
O projeto é uma aplicação web desenvolvida com **Angular 21**, utilizando uma arquitetura baseada em standalone components, processamento do lado do servidor (SSR - Server Side Rendering) e um sistema de testes moderno com Vitest.

## 2. Tecnologias Principais
- **Angular (v21.1.0)**: Framework principal.
- **TypeScript**: Linguagem base para o desenvolvimento.
- **SCSS**: Pré-processador CSS para estilização.
- **Angular SSR (Server-Side Rendering)**: Para melhor performance e SEO.
- **Vitest**: Framework de testes unitários.
- **RxJS**: Para programação reativa.

## 3. Estrutura de Diretórios

A estrutura do projeto segue as melhores práticas do Angular, organizada da seguinte forma:

### 3.1. Raiz do Projeto
- `src/`: Contém todo o código fonte da aplicação.
- `public/`: Contém ativos estáticos (como `favicon.ico`) que são servidos diretamente.
- `angular.json`: Configuração do Angular CLI.
- `package.json`: Definições de dependências e scripts do Node.js.
- `tsconfig.json`: Configurações do compilador TypeScript.

### 3.2. Diretório `src/app`
Este é o coração da aplicação, organizado em subdiretórios funcionais:

- **`config/`**: Contém as configurações globais da aplicação (ex: `app.config.ts`).
- **`routes/`**: Define as rotas da aplicação (ex: `app.routes.ts`).
- **`pages/`**: Destinado aos componentes que representam páginas inteiras da aplicação.
- **`services/`**: Centraliza os serviços para comunicação com APIs e gerenciamento de estado compartilhado.
- **`models/`**: Contém interfaces e classes que definem as estruturas de dados.
- **`env/`**: Reservado para configurações específicas de ambiente.
- **`server/`**: Contém as configurações específicas para execução no lado do servidor (SSR).

### 3.3. Componentes Base
- **`app.ts`**: O componente raiz (App Root) que orquestra a aplicação.
- **`app.html`**: O template principal onde o `router-outlet` está localizado.
- **`app.scss`**: Estilos globais ou específicos do componente raiz.
- **`app.spec.ts`**: Testes unitários para o componente raiz.

## 4. Scripts de Desenvolvimento

No diretório raiz, você pode executar os seguintes comandos:

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o servidor de desenvolvimento em `http://localhost:4200/`. |
| `npm run build` | Compila o projeto para produção na pasta `dist/`. |
| `npm test` | Executa os testes unitários utilizando Vitest. |
| `npm run watch` | Inicia o build em modo de observação (watch mode). |

## 5. Arquitetura de Rotas e Estado
Atualmente, o projeto utiliza:
- **Standalone Components**: Não depende de `NgModules`, tornando a árvore de componentes mais leve.
- **Signals**: Utiliza a nova API de Signals do Angular para detecção de mudanças eficiente e reatividade moderna.
- **Hydration**: Configurado com `provideClientHydration` para sincronização eficiente entre o servidor e o cliente.

## 6. Padronização
O projeto utiliza **Prettier** para formatação de código, garantindo consistência no desenvolvimento entre diferentes colaboradores.

---
*Gerado automaticamente para documentar o estado atual do projeto SIGPS-Frontend.*
