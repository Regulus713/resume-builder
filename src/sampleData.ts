import type { DesignOptions, ResumeData } from './types'

export const emptyResume: ResumeData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
}

export const sampleResume: ResumeData = {
  personal: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Software Engineer',
    email: 'alex.morgan@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
  },
  summary:
    'Senior software engineer with 8+ years of experience building scalable web applications. Passionate about clean architecture, developer experience, and mentoring teams to ship high-quality products.',
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Software Engineer',
      company: 'Nova Labs',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021',
      endDate: '',
      current: true,
      description:
        'Led a team of 5 engineers building a real-time collaboration platform serving 200k+ users\nRedesigned the CI/CD pipeline, cutting deploy times from 40 to 8 minutes\nDrove adoption of end-to-end testing, reducing production incidents by 35%',
    },
    {
      id: 'exp-2',
      role: 'Software Engineer',
      company: 'Brightline',
      location: 'Austin, TX',
      startDate: 'Jun 2018',
      endDate: 'Feb 2021',
      current: false,
      description:
        'Built and maintained customer-facing checkout flows processing $2M+ monthly\nIntroduced TypeScript across the frontend codebase, cutting type-related bugs significantly\nPartnered with design to ship a component library used by 4 product teams',
    },
    {
      id: 'exp-3',
      role: 'Junior Developer',
      company: 'PixelWorks',
      location: 'Remote',
      startDate: 'Jul 2016',
      endDate: 'May 2018',
      current: false,
      description:
        'Developed responsive marketing sites and internal dashboards for clients\nAutomated image-optimization tooling, improving page load scores by 25%',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. Computer Science',
      school: 'University of Texas at Austin',
      location: 'Austin, TX',
      startDate: '2012',
      endDate: '2016',
      description: '',
    },
  ],
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'GraphQL',
    'PostgreSQL',
    'AWS',
    'Docker',
    'CI/CD',
    'System Design',
    'Team Leadership',
  ],
  languages: ['English (Fluent)', 'Spanish (Conversational)'],
}

export const defaultDesign: DesignOptions = {
  template: 'classic',
  accentColor: '#2563eb',
  font: 'inter',
  fontSize: 'md',
  pageSize: 'a4',
}
