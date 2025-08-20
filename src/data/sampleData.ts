import { Employee, Department, SiteSettings } from '@/contexts/AppContext';

export const sampleEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Carlos Silva',
    position: 'Diretor Geral',
    department: 'Diretoria',
    team: 'Executivo',
    description: 'Responsável pela liderança estratégica da empresa',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isManager: true,
    visible: true
  },
  {
    id: 'emp-2',
    name: 'Ana Santos',
    position: 'Gerente de RH',
    department: 'Recursos Humanos',
    team: 'RH',
    description: 'Gestão de pessoas e desenvolvimento organizacional',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
    isManager: true,
    parentId: 'emp-1',
    visible: true
  },
  {
    id: 'emp-3',
    name: 'Pedro Oliveira',
    position: 'Gerente Financeiro',
    department: 'Financeiro',
    team: 'Financeiro',
    description: 'Controle financeiro e planejamento orçamentário',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isManager: true,
    parentId: 'emp-1',
    visible: true
  },
  {
    id: 'emp-4',
    name: 'Maria Costa',
    position: 'Analista de RH',
    department: 'Recursos Humanos',
    team: 'RH',
    description: 'Recrutamento e seleção de talentos',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    parentId: 'emp-2',
    visible: true
  },
  {
    id: 'emp-5',
    name: 'João Rodrigues',
    position: 'Contador',
    department: 'Financeiro',
    team: 'Contabilidade',
    description: 'Contabilidade geral e fiscal',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    parentId: 'emp-3',
    visible: true
  },
  {
    id: 'emp-6',
    name: 'Fernanda Lima',
    position: 'Gerente de TI',
    department: 'Tecnologia',
    team: 'TI',
    description: 'Infraestrutura e desenvolvimento de sistemas',
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    isManager: true,
    parentId: 'emp-1',
    visible: true
  }
];

export const sampleDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Diretoria',
    color: '#1f4e78',
    visible: true,
    employees: sampleEmployees.filter(emp => emp.department === 'Diretoria')
  },
  {
    id: 'dept-2',
    name: 'Recursos Humanos',
    color: '#548235',
    visible: true,
    employees: sampleEmployees.filter(emp => emp.department === 'Recursos Humanos')
  },
  {
    id: 'dept-3',
    name: 'Financeiro',
    color: '#c5504b',
    visible: true,
    employees: sampleEmployees.filter(emp => emp.department === 'Financeiro')
  },
  {
    id: 'dept-4',
    name: 'Tecnologia',
    color: '#7b68a6',
    visible: true,
    employees: sampleEmployees.filter(emp => emp.department === 'Tecnologia')
  },
  {
    id: 'dept-5',
    name: 'Vendas',
    color: '#d28c47',
    visible: true,
    employees: []
  },
  {
    id: 'dept-6',
    name: 'Marketing',
    color: '#5b5b5b',
    visible: true,
    employees: []
  }
];

export const sampleSiteSettings: SiteSettings = {
  companyName: 'Cazanga',
  primaryColor: '#1f4e78',
  secondaryColor: '#548235',
  introText: 'Explore nossa estrutura organizacional de forma interativa e detalhada.',
  logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=80&fit=crop',
  carouselImages: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop'
  ]
};