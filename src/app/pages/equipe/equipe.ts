import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EquipeIconComponent, EquipeIconName } from './equipe-icon.component';

export interface MembroEquipe {
  nome: string;
  papel: string;
  descricao: string;
  icono: EquipeIconName;
  iniciais: string;
}

export interface TechStackItem {
  nome: string;
  categoria: string;
  logos: { src: string; alt: string }[];
  wide?: boolean;
}

export interface TechStackGroup {
  titulo: string;
  itens: TechStackItem[];
}

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [RouterLink, EquipeIconComponent],
  templateUrl: './equipe.html',
  styleUrl: './equipe.scss',
})
export class EquipeComponent {
  readonly instituicao = 'Faculdade Metropolitana de Manaus';
  readonly orientadora = 'Luana Magalhães Leal';

  readonly membros: MembroEquipe[] = [
    {
      nome: 'Josias Azevedo da Silva',
      papel: 'Product Owner & Desenvolvedor Full-Stack',
      descricao: 'Define e prioriza funcionalidades, valida entregas e desenvolve grande parte do sistema (backend, frontend e integração com IA). Utiliza Asana, GitHub e Canva.',
      icono: 'owner',
      iniciais: 'JA',
    },
    {
      nome: 'Kaio Oliveira Pantoja',
      papel: 'Scrum Master & Tech Lead',
      descricao: 'Organiza o fluxo de trabalho, conduz as cerimônias ágeis e define os padrões técnicos do projeto. Utiliza GitHub, Asana, VS Code e Docker.',
      icono: 'scrum',
      iniciais: 'KP',
    },
    {
      nome: 'Wagner Eduardo',
      papel: 'Documentação',
      descricao: 'Organiza e mantém os registros formais do TCC. Utiliza Google Docs, Microsoft Word, Google Drive e NotebookLM.',
      icono: 'docs',
      iniciais: 'WE',
    },
    {
      nome: 'Matheus Akabane Brazão',
      papel: 'Desenvolvedor Back-end',
      descricao: 'Implementa a lógica de negócio e a integração com o banco de dados. Trabalha com Flask, MySQL, Swagger e VS Code.',
      icono: 'backend',
      iniciais: 'MB',
    },
    {
      nome: 'Ólliver de Aquino Freitas',
      papel: 'Front-end UX/UI',
      descricao: 'Constrói a interface e a experiência do usuário com Angular, TypeScript, HTML, SCSS e prototipação de fluxos.',
      icono: 'frontend',
      iniciais: 'OF',
    },
    {
      nome: 'Alan Nicolas Santos Maragua',
      papel: 'QA — Quality Assurance',
      descricao: 'Garante a qualidade do sistema com validação de funcionalidades e acompanhamento de bugs. Utiliza Postman, Selenium/Cypress, GitHub e Asana.',
      icono: 'qa',
      iniciais: 'AM',
    },
  ];

  /** Logos oficiais — [Simple Icons](https://simpleicons.org/) · [Devicons](https://devicon.dev/) · Lobe Icons (Antigravity) */
  readonly techGrupos: TechStackGroup[] = [
    {
      titulo: 'Apresentação',
      itens: [
        {
          nome: 'Front-end',
          categoria: 'Angular (framework) · TypeScript · HTML · SCSS',
          wide: true,
          logos: [
            { src: '/icons/tech/angular.svg', alt: 'Angular' },
            { src: '/icons/tech/typescript.svg', alt: 'TypeScript' },
            { src: '/icons/tech/html5.svg', alt: 'HTML5' },
            { src: '/icons/tech/sass.svg', alt: 'Sass (SCSS)' },
          ],
        },
      ],
    },
    {
      titulo: 'Serviços & API',
      itens: [
        {
          nome: 'Python / Flask',
          categoria: 'Backend principal',
          logos: [
            { src: '/icons/tech/python.svg', alt: 'Python' },
            { src: '/icons/tech/flask.svg', alt: 'Flask' },
          ],
        },
        {
          nome: 'FastAPI / Scikit-learn',
          categoria: 'Microserviço de ML',
          logos: [
            { src: '/icons/tech/fastapi.svg', alt: 'FastAPI' },
            { src: '/icons/tech/scikitlearn.svg', alt: 'Scikit-learn' },
          ],
        },
      ],
    },
    {
      titulo: 'Dados & Cache',
      itens: [
        {
          nome: 'MySQL',
          categoria: 'Banco de dados relacional',
          logos: [{ src: '/icons/tech/mysql.svg', alt: 'MySQL' }],
        },
        {
          nome: 'Redis',
          categoria: 'Cache e rate limiting',
          logos: [{ src: '/icons/tech/redis.svg', alt: 'Redis' }],
        },
      ],
    },
    {
      titulo: 'Infraestrutura & Segurança',
      itens: [
        {
          nome: 'Docker',
          categoria: 'Containerização',
          logos: [{ src: '/icons/tech/docker.svg', alt: 'Docker' }],
        },
        {
          nome: 'Nginx',
          categoria: 'Proxy reverso e HTTPS',
          logos: [{ src: '/icons/tech/nginx.svg', alt: 'Nginx' }],
        },
        {
          nome: 'JWT',
          categoria: 'Autenticação stateless',
          logos: [{ src: '/icons/tech/jsonwebtokens.svg', alt: 'JSON Web Tokens' }],
        },
      ],
    },
    {
      titulo: 'Ferramentas de Desenvolvimento',
      itens: [
        {
          nome: 'VS Code',
          categoria: 'Editor de código',
          logos: [{ src: '/icons/tech/visualstudiocode.svg', alt: 'Visual Studio Code' }],
        },
        {
          nome: 'Antigravity',
          categoria: 'IDE com IA (Google)',
          logos: [{ src: '/icons/tech/antigravity.svg', alt: 'Google Antigravity' }],
        },
      ],
    },
  ];
}
