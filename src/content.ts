import type { Language } from './i18n';

export type SectionKey = 'about' | 'stack' | 'work' | 'education' | 'contact';

export type WorkEntry = {
  dates: string;
  place?: string;
  role: string;
  company: string;
  summary: string;
  tags: readonly string[];
};

// subtitle and text may contain trusted inline HTML such as tooltips.
export type EducationItem = {
  years: string;
  title: string;
  subtitle?: string;
  text: string;
  tags?: readonly string[];
  link?: { href: string; label: string };
};

export type PresenceWording = {
  connecting: string;
  unavailable: string;
  status: Record<'online' | 'idle' | 'dnd' | 'offline', string>;
  activityTypes: Record<number, string>;
  activityFallback: string;
  listeningTo: string;
};

export type SnakeWording = {
  label: string;
  score: string;
  ready: string;
  paused: string;
  gameOver: string;
  controls: string;
  touchControls: string;
  quit: string;
};

export type AwesomeProject = {
  repo: string;
  description: string;
};

export type AwesomeCategory = {
  name: string;
  projects: readonly AwesomeProject[];
};

export type AwesomeWording = {
  title: string;
  command: string;
  intro: string;
  home: string;
  viewOnGithub: string;
  categories: readonly AwesomeCategory[];
};

export type Content = {
  htmlLang: string;
  navLabel: string;
  languageLabel: string;
  sections: Record<SectionKey, { id: string; command: string }>;
  heroMessages: readonly string[];
  about: readonly string[];
  work: readonly WorkEntry[];
  education: {
    years: string;
    course: string;
    school: string;
    items: readonly EducationItem[];
  };
  presence: PresenceWording;
  notFound: { error: string; home: string };
  snake: SnakeWording;
  awesome: AwesomeWording;
};

export const SECTION_ORDER: readonly SectionKey[] = [
  'about',
  'stack',
  'work',
  'education',
  'contact',
];

export const PROMPT_HOST = 'marco@marcopisco.com:~';
export const HERO_COMMAND = 'whoami';
export const SNAKE_COMMAND = './snake';
export const NAME = 'Marco Pisco';
export const AWESOME_DIR = 'awesome';
export const GITHUB_URL = 'https://github.com';

export const STACK = [
  'git',
  'csharp',
  'python',
  'php',
  'dotnet',
  'sql',
  'linux',
  'proxmox',
  'docker',
  'headscale',
  'cloudflare',
  'forgejo',
] as const;

export const CONTACT_ROWS = [
  { label: 'email', href: 'mailto:marco@marcopisco.com', text: 'marco@marcopisco.com' },
  { label: 'github', href: 'https://github.com/marpisco', text: 'github.com/marpisco' },
  {
    label: 'linkedin',
    href: 'https://www.linkedin.com/in/marco-p-440068329/',
    text: 'in/marco-p-440068329',
  },
] as const;

// Attributes every link leaving the site carries.
export const NEW_TAB = 'target="_blank" rel="noopener noreferrer"';

function tip(id: string, label: string, text: string, href?: string): string {
  const tooltip = `<span id="${id}" role="tooltip" class="tip-text">${text}</span>`;
  return href
    ? `<a class="tip" href="${href}" ${NEW_TAB} aria-describedby="${id}">${label}${tooltip}</a>`
    : `<span class="tip" tabindex="0" aria-describedby="${id}">${label}${tooltip}</span>`;
}

const PAP_TIP = tip('pap-tip', 'PAP', 'Prova de Aptidão Profissional');
const LED_TIP = tip('led-tip', 'LED', 'Laboratórios de Educação Digital', 'https://led.dge.medu.pt/');
const CLASSLINK_LINK = { href: 'https://github.com/marpisco/ClassLink', label: 'github.com/marpisco/ClassLink' };

// Placeholder list until the featured projects are chosen.
const PLACEHOLDER_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const PLACEHOLDER_REPOS = {
  selfHosted: ['marpisco/ClassLink', 'jellyfin/jellyfin', 'immich-app/immich'],
  devTools: ['oven-sh/bun', 'vitejs/vite', 'BurntSushi/ripgrep'],
  networking: ['caddyserver/caddy', 'tailscale/tailscale'],
};

function placeholderProjects(repos: readonly string[]): AwesomeProject[] {
  return repos.map((repo) => ({ repo, description: PLACEHOLDER_TEXT }));
}

const en: Content = {
  htmlLang: 'en',
  navLabel: 'Primary',
  languageLabel: 'Language',
  sections: {
    about: { id: 'about', command: 'cat about.txt' },
    stack: { id: 'stack', command: 'ls stack/' },
    work: { id: 'work', command: 'git log work' },
    education: { id: 'edu', command: 'cat education.md' },
    contact: { id: 'contact', command: 'contact --list' },
  },
  heroMessages: [
    'Developer and System Administrator based in Portugal.',
    'Building secure infrastructure and reliable platforms.',
    'Automating systems for dependable operations.',
    'Delivering practical software from code to production.',
  ],
  about: [
    'I am a software developer and system administrator focused on secure infrastructure, practical product delivery, and dependable operations.',
    'I work across software engineering, systems administration, and security-focused infrastructure, with a strong focus on reliability, automation, and maintainable operations.',
  ],
  work: [
    {
      dates: 'Jul 2026 – Present',
      place: 'Malveira · Hybrid',
      role: 'Developer',
      company: 'Quantinfor - Consultoria Informática',
      summary:
        'Software Development for multiple environments, including Cegid PHC. Maintenance and creation of Software Projects. Development of internal tools and platforms, using Repository history tracking projects, such as Git. Building AI-assistants and AI-related integrations for internal products.',
      tags: ['informatics', 'software-prototyping', 'git', 'cegid-phc'],
    },
    {
      dates: 'Jan 2026 – Apr 2026',
      place: 'Malveira · Hybrid',
      role: 'Software Developer Intern',
      company: 'Quantinfor - Consultoria Informática',
      summary:
        'Software development internship focused on multiple environments and internal platform tooling.',
      tags: ['git', 'dotnet', 'csharp', 'python', 'software-prototyping'],
    },
    {
      dates: 'Oct 2025 – Present',
      place: 'Remote',
      role: 'Head of Systems / System Administrator',
      company: 'LunarLabs LLC',
      summary:
        "Build and maintain the company's infrastructure: Proxmox hypervisors, Docker services and the developer platforms (Forgejo, CI runners, internal tools). Run the company VPN (Headscale), DNS in Cloudflare, password management (Vaultwarden) and monitoring (Grafana). Manage Microsoft 365 and Entra ID for Single Sign-On (SSO) and mail. Handle security hardening, off-site backups and staff access.",
      tags: ['informatics', 'docker', 'proxmox', 'microsoft-365', 'sso'],
    },
    {
      dates: 'Aug 2025 – Present',
      place: 'Remote',
      role: 'System Administrator and Operations Manager',
      company: 'Darkless Ltd.',
      summary:
        'Run the infrastructure of a hosting company with its own network (AS197924): a Proxmox hypervisor cluster, core switching and BGP peering with the datacenter. Manage the customer platforms (Pterodactyl game hosting, VPS and dedicated servers through TenantOS, Paymenter billing). Run the company VPN (Headscale), DNS (Cloudflare and PowerDNS), mail, off-site backups (Proxmox Backup Server) and monitoring (Grafana, Prometheus). Manage Microsoft 365 and Entra ID for Single Sign-On (SSO) and mail. Handle incident response, security hardening, customer support tickets and automations.',
      tags: ['server-administration', 'proxmox', 'pterodactyl', 'microsoft-365', 'automation'],
    },
    {
      dates: 'Apr 2025 – Jun 2025',
      role: 'Software Developer (Internship)',
      company: 'Visao Logica - Comercio Artigos de Informatica, Lda.',
      summary:
        'Worked on Primavera WebAPI and PEX Advanced extensibility (C# and Python), built middleware for WebAPI integrations, developed SIP/PBX and internal tooling concepts, configured Sophos Firewall, and implemented Primavera ERP synchronization flows.',
      tags: ['csharp', 'python', 'php', 'pbx', 'sophos-firewall'],
    },
    {
      dates: 'Feb 2025 – Oct 2026',
      place: 'Remote',
      role: 'Senior System Administrator',
      company: 'Scala Studios',
      summary:
        'Managed security and infrastructure for a Minecraft network, including Proxmox hypervisors, game servers and developer platforms. Enforced 2FA across all accounts and put internal services and databases behind a private VPN (Headscale). Handled incident response, off-site backups and migrations between providers.',
      tags: ['infrastructure-management', 'linux', 'proxmox', 'youtrack', 'mailcow', 'headscale'],
    },
  ],
  education: {
    years: '2023–2026',
    course: 'Professional Course, IT Systems',
    school: 'Agrupamento de Escolas Joaquim Inacio da Cruz Sobral',
    items: [
      {
        years: '2025–2026',
        title: 'ClassLink',
        subtitle: `· ${PAP_TIP}, final course project`,
        text: 'Room booking platform built as my PAP, formerly ReservaSalas. Designed for single sign-on with Office 365, timetable import, user and admin manuals and PDF generation.',
        tags: ['php', 'sql', 'office-365', 'linux'],
        link: CLASSLINK_LINK,
      },
      {
        years: '2024–2026',
        title: 'IT help',
        subtitle: '· school systems',
        text: "Helped the school's IT day to day, including inventory management and Windows scripts management.",
      },
      {
        years: '2024–2026',
        title: 'Media & events',
        subtitle: '· video, photo, drone',
        text: "Filmed and edited the school's events: European School Sports Day, flag raising ceremonies, cross-country and study visits, including drone footage. Produced news segments on school events, the professional courses presentation, and monthly content for the school's info screen.",
      },
      {
        years: '2024–2026',
        title: '3D printing',
        subtitle: `· programa ${LED_TIP}`,
        text: 'Maintained the Creality K1 printer, including a hotend swap, picked filaments and printed parts and models for teachers.',
      },
      {
        years: '2025–2026',
        title: 'Student union',
        subtitle: '· Lista Lucky',
        text: `Served as a ${tip('vogal-tip', 'Vogal', 'Board member')} on the student union board, mostly running audio and helping out at events, along with small logistical and administrative tasks.`,
      },
      {
        years: '2023-04',
        title: 'Volunteer teacher',
        subtitle: '@ Academia Digital para Pais',
        text: 'Program funded by the Portuguese Ministry of Education and E-Redes where students taught parents foundational digital literacy skills.',
      },
    ],
  },
  presence: {
    connecting: 'Connecting...',
    unavailable: 'Unavailable',
    status: { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' },
    activityTypes: { 0: 'Playing', 1: 'Streaming', 2: 'Listening', 3: 'Watching', 5: 'Competing' },
    activityFallback: 'Active on',
    listeningTo: 'Listening to',
  },
  notFound: { error: 'No such file or directory', home: 'back to marcopisco.com' },
  snake: {
    label: 'Snake game',
    score: 'score',
    ready: 'ready',
    paused: 'paused',
    gameOver: 'game over',
    controls: 'arrows/wasd move · space start/pause · esc quit',
    touchControls: 'swipe to move · tap to start/pause',
    quit: 'quit',
  },
  awesome: {
    title: 'Awesome projects',
    command: 'cat README.md',
    intro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Things I built and things I love.',
    home: 'cd ~',
    viewOnGithub: 'view on github →',
    categories: [
      { name: 'self-hosted', projects: placeholderProjects(PLACEHOLDER_REPOS.selfHosted) },
      { name: 'dev-tools', projects: placeholderProjects(PLACEHOLDER_REPOS.devTools) },
      { name: 'networking', projects: placeholderProjects(PLACEHOLDER_REPOS.networking) },
    ],
  },
};

const pt: Content = {
  htmlLang: 'pt-PT',
  navLabel: 'Principal',
  languageLabel: 'Idioma',
  sections: {
    about: { id: 'sobre', command: 'cat sobre.txt' },
    stack: { id: 'stack', command: 'ls stack/' },
    work: { id: 'trabalho', command: 'git log trabalho' },
    education: { id: 'formacao', command: 'cat formacao.md' },
    contact: { id: 'contacto', command: 'contacto --lista' },
  },
  heroMessages: [
    'Programador e administrador de sistemas, em Portugal.',
    'A construir infraestrutura segura e plataformas fiáveis.',
    'A automatizar sistemas para operações fiáveis.',
    'A entregar software prático, do código à produção.',
  ],
  about: [
    'Sou programador e administrador de sistemas, focado em infraestrutura segura, entrega prática de produto e operações fiáveis.',
    'Trabalho entre engenharia de software, administração de sistemas e infraestrutura focada em segurança, com grande foco em fiabilidade, automação e operações fáceis de manter.',
  ],
  work: [
    {
      dates: 'Jul 2026 – Atual',
      place: 'Malveira · Híbrido',
      role: 'Programador',
      company: 'Quantinfor - Consultoria Informática',
      summary:
        'Desenvolvimento de software para vários ambientes, incluindo Cegid PHC. Manutenção e criação de projetos de software. Desenvolvimento de ferramentas e plataformas internas, com controlo de versões em Git. Criação de assistentes de IA e integrações de IA para produtos internos.',
      tags: ['informática', 'prototipagem-de-software', 'git', 'cegid-phc'],
    },
    {
      dates: 'Jan 2026 – Abr 2026',
      place: 'Malveira · Híbrido',
      role: 'Estagiário de Desenvolvimento de Software',
      company: 'Quantinfor - Consultoria Informática',
      summary:
        'Estágio em desenvolvimento de software, focado em vários ambientes e em ferramentas para plataformas internas.',
      tags: ['git', 'dotnet', 'csharp', 'python', 'prototipagem-de-software'],
    },
    {
      dates: 'Out 2025 – Atual',
      place: 'Remoto',
      role: 'Responsável de Sistemas / Administrador de Sistemas',
      company: 'LunarLabs LLC',
      summary:
        'Construo e mantenho a infraestrutura da empresa: hipervisores Proxmox, serviços Docker e as plataformas de desenvolvimento (Forgejo, runners de CI, ferramentas internas). Giro a VPN da empresa (Headscale), o DNS na Cloudflare, a gestão de palavras-passe (Vaultwarden) e a monitorização (Grafana). Administro o Microsoft 365 e o Entra ID para Single Sign-On (SSO) e email. Trato do reforço de segurança, das cópias de segurança externas e dos acessos da equipa.',
      tags: ['informática', 'docker', 'proxmox', 'microsoft-365', 'sso'],
    },
    {
      dates: 'Ago 2025 – Atual',
      place: 'Remoto',
      role: 'Administrador de Sistemas e Gestor de Operações',
      company: 'Darkless Ltd.',
      summary:
        'Giro a infraestrutura de uma empresa de alojamento com rede própria (AS197924): um cluster de hipervisores Proxmox, switching de núcleo e peering BGP com o datacenter. Administro as plataformas de clientes (alojamento de jogos com Pterodactyl, VPS e servidores dedicados através do TenantOS, faturação com Paymenter). Giro a VPN da empresa (Headscale), o DNS (Cloudflare e PowerDNS), o email, as cópias de segurança externas (Proxmox Backup Server) e a monitorização (Grafana, Prometheus). Administro o Microsoft 365 e o Entra ID para Single Sign-On (SSO) e email. Trato da resposta a incidentes, do reforço de segurança, dos pedidos de suporte de clientes e de automatizações.',
      tags: ['administração-de-servidores', 'proxmox', 'pterodactyl', 'microsoft-365', 'automação'],
    },
    {
      dates: 'Abr 2025 – Jun 2025',
      role: 'Programador de Software (Estágio)',
      company: 'Visão Lógica - Comércio de Artigos de Informática, Lda.',
      summary:
        'Trabalhei na extensibilidade Primavera WebAPI e PEX Advanced (C# e Python), criei middleware para integrações com a WebAPI, desenvolvi conceitos de SIP/PBX e de ferramentas internas, configurei a firewall Sophos e implementei fluxos de sincronização com o Primavera ERP.',
      tags: ['csharp', 'python', 'php', 'pbx', 'sophos-firewall'],
    },
    {
      dates: 'Fev 2025 – Out 2026',
      place: 'Remoto',
      role: 'Administrador de Sistemas Sénior',
      company: 'Scala Studios',
      summary:
        'Geri a segurança e a infraestrutura de uma rede de Minecraft, incluindo hipervisores Proxmox, servidores de jogo e plataformas de desenvolvimento. Implementei 2FA em todas as contas e coloquei serviços internos e bases de dados atrás de uma VPN privada (Headscale). Tratei da resposta a incidentes, das cópias de segurança externas e de migrações entre fornecedores.',
      tags: ['gestão-de-infraestrutura', 'linux', 'proxmox', 'youtrack', 'mailcow', 'headscale'],
    },
  ],
  education: {
    years: '2023–2026',
    course: 'Curso Profissional de Técnico de Informática – Sistemas',
    school: 'Agrupamento de Escolas Joaquim Inácio da Cruz Sobral',
    items: [
      {
        years: '2025–2026',
        title: 'ClassLink',
        subtitle: `· ${PAP_TIP}, projeto final de curso`,
        text: 'Plataforma de reserva de salas desenvolvida como a minha PAP, anteriormente ReservaSalas. Pensada para início de sessão único com o Office 365, importação de horários, manuais de utilizador e de administrador e geração de PDF.',
        tags: ['php', 'sql', 'office-365', 'linux'],
        link: CLASSLINK_LINK,
      },
      {
        years: '2024–2026',
        title: 'Apoio informático',
        subtitle: '· sistemas da escola',
        text: 'Ajudei no dia a dia da informática da escola, incluindo gestão de inventário e gestão de scripts Windows.',
      },
      {
        years: '2024–2026',
        title: 'Multimédia e eventos',
        subtitle: '· vídeo, fotografia, drone',
        text: 'Filmei e editei os eventos da escola: Dia Europeu do Desporto Escolar, cerimónias do hastear da bandeira, corta-mato e visitas de estudo, incluindo imagens de drone. Produzi peças noticiosas sobre eventos da escola, a apresentação dos cursos profissionais e conteúdos mensais para o painel informativo da escola.',
      },
      {
        years: '2024–2026',
        title: 'Impressão 3D',
        subtitle: `· programa ${LED_TIP}`,
        text: 'Fiz a manutenção da impressora Creality K1, incluindo a troca do hotend, escolhi filamentos e imprimi peças e modelos para professores.',
      },
      {
        years: '2025–2026',
        title: 'Associação de Estudantes',
        subtitle: '· Lista Lucky',
        text: 'Fui vogal da direção da associação de estudantes, sobretudo a tratar do som e a ajudar nos eventos, além de pequenas tarefas logísticas e administrativas.',
      },
      {
        years: '2023-04',
        title: 'Professor voluntário',
        subtitle: '@ Academia Digital para Pais',
        text: 'Programa financiado pelo Ministério da Educação e pela E-Redes, em que alunos ensinaram competências digitais básicas a pais.',
      },
    ],
  },
  presence: {
    connecting: 'A ligar...',
    unavailable: 'Indisponível',
    status: { online: 'Online', idle: 'Ausente', dnd: 'Não incomodar', offline: 'Offline' },
    activityTypes: { 0: 'A jogar', 1: 'Em direto', 2: 'A ouvir', 3: 'A ver', 5: 'A competir' },
    activityFallback: 'Ativo em',
    listeningTo: 'A ouvir',
  },
  notFound: { error: 'Ficheiro ou pasta inexistente', home: 'voltar a marcopisco.com' },
  snake: {
    label: 'Jogo da cobra',
    score: 'pontos',
    ready: 'pronto',
    paused: 'em pausa',
    gameOver: 'fim do jogo',
    controls: 'setas/wasd mover · espaço começar/pausar · esc sair',
    touchControls: 'desliza para mover · toca para começar/pausar',
    quit: 'sair',
  },
  awesome: {
    title: 'Projetos incríveis',
    command: 'cat LEIA-ME.md',
    intro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Coisas que fiz e coisas de que gosto.',
    home: 'cd ~',
    viewOnGithub: 'ver no github →',
    categories: [
      { name: 'auto-alojados', projects: placeholderProjects(PLACEHOLDER_REPOS.selfHosted) },
      { name: 'ferramentas-dev', projects: placeholderProjects(PLACEHOLDER_REPOS.devTools) },
      { name: 'redes', projects: placeholderProjects(PLACEHOLDER_REPOS.networking) },
    ],
  },
};

export const CONTENT: Record<Language, Content> = { en, pt };
