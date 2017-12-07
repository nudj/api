const mock = require('./')

const COMPANIES = 'COMPANIES'
const CONNECTIONS = 'CONNECTIONS'

const data = {
  assets: [],
  companies: [],
  companyOnboardedEvents: [],
  conversations: [],
  jobs: [],
  people: [],
  referrals: [],
  applications: [],
  hirers: [],
  hirerOnboardedEvents: [],
  employees: [],
  recommendations: [],
  internalMessages: [],
  externalMessages: [],
  surveyMessages: [],
  surveys: [],
  surveySections: [],
  surveyQuestions: [],
  companyTasks: [],
  personTasks: [],
  tokens: [],
  employeeSurveys: [],
  accounts: [],
  messages: [],
  connections: [],
  formerEmployers: [],
  roles: [],
  connectionSources: []
}
data.companies = data.companies.concat([
  {
    id: 'company1',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    industry: ['IT', 'Mining', 'Healthcare'],
    location: 'London',
    logo: 'https://slack-imgs.com/?c=1&url=https%3A%2F%2Fs-media-cache-ak0.pinimg.com%2Foriginals%2F2a%2F89%2Fde%2F2a89dee5376d13e8d378e797d4e7e5fc.gif',
    name: 'Fake Company',
    slug: 'fake-company',
    url: 'http://omg.fake-company.com',
    description: 'OMG this company is SO hot right now. Ut nec massa vitae dui ullamcorper malesuada nec in neque. Suspendisse nec sapien faucibus, mollis metus ac, tempus eros. Praesent at nisl consequat ligula auctor eleifend nec sit amet eros. Fusce consequat, ante ac maximus auctor, felis justo vestibulum elit, congue congue ipsum ligula et lacus. Vivamus est risus, viverra quis iaculis et, eleifend eget est.'
  },
  {
    id: 'company2',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    industry: ['Winning'],
    location: 'London',
    logo: 'https://slack-imgs.com/?c=1&url=https%3A%2F%2Fs-media-cache-ak0.pinimg.com%2Foriginals%2F2a%2F89%2Fde%2F2a89dee5376d13e8d378e797d4e7e5fc.gif',
    name: 'nudj',
    slug: 'nudj',
    url: 'https://nudj.co',
    description: 'OMG this company is SO hot right now. Ut nec massa vitae dui ullamcorper malesuada nec in neque. Suspendisse nec sapien faucibus, mollis metus ac, tempus eros. Praesent at nisl consequat ligula auctor eleifend nec sit amet eros. Fusce consequat, ante ac maximus auctor, felis justo vestibulum elit, congue congue ipsum ligula et lacus. Vivamus est risus, viverra quis iaculis et, eleifend eget est.'
  }
])
data.companyOnboardedEvents = data.companyOnboardedEvents.concat([
  {
    id: 'companyOnboardedEvent1',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    company: 'company1'
  }
])
data.jobs = data.jobs.concat([
  {
    id: 'job1',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    title: 'Senior Full-Stack Software Engineer',
    slug: 'senior-full-stack-software-engineer-2',
    url: 'https://bulb.workable.com/j/389500EB72',
    status: 'PUBLISHED',
    bonus: 1000,
    description: '5+ years software engineering experience, using Node (6+), ES6 (Babel) and TypeScript. You should also be familiar with Git, Github, PRs, Code Reviews - please send us a link to your Github profile.',
    type: 'Permanent',
    remuneration: 'Competitive + Options',
    experience: '16 billion years',
    requirements: 'building large-scale web-based applications in 🐔, 💅🏼 and 💩.',
    templateTags: ['food'],
    tags: [
      'Software',
      'Developer',
      'Full-Stack'
    ],
    location: 'London',
    company: 'company99',
    relatedJobs: [
      '2'
    ]
  },
  {
    id: 'job2',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    title: 'Senior Fake Test Job',
    slug: 'senior-fake-test-job',
    url: 'https://fake.com',
    status: 'PUBLISHED',
    bonus: 1000,
    description: 'Fake job! vitae sodales velit ligula quis ligula. Sed et tincidunt nisi. Ut nec massa vitae dui ullamcorper malesuada nec in neque. Suspendisse nec sapien faucibus, mollis metus ac, tempus eros. Praesent at nisl consequat ligula auctor eleifend nec sit amet eros. Fusce consequat, ante ac maximus auctor, felis justo vestibulum elit, congue congue ipsum ligula et lacus. Vivamus est risus, viverra quis iaculis et, eleifend eget est.',
    type: 'Permanent',
    remuneration: 'Competitive + Options',
    experience: '300+ years',
    requirements: 'building large-scale web-based applications in 🐔, 💅🏼 and 💩.',
    templateTags: ['food', 'film'],
    tags: [
      'Fake',
      'Job'
    ],
    location: 'London',
    company: 'company1',
    relatedJobs: [
      '1'
    ]
  }
])
data.people = data.people.concat([
  {
    id: 'person1',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    firstName: 'Nick',
    lastName: 'Collings',
    email: 'nick@nudj.co',
    url: 'http://test.com/',
    title: 'Tech Lead',
    type: 'external',
    company: 'nudj',
    status: 'user'
  },
  {
    id: 'person2',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    firstName: 'Robyn',
    lastName: 'McGirl',
    email: 'robyn@nudj.co',
    url: 'http://test.com/',
    title: 'CEO',
    type: 'external',
    company: 'nudj',
    status: 'user'
  },
  {
    id: 'person3',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    firstName: 'Jamie',
    lastName: 'Gunson',
    email: 'jamie@nudj.co',
    url: 'http://test.com/',
    title: 'Head of Product',
    type: 'external',
    company: 'nudj',
    status: 'user'
  },
  {
    id: 'person4',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    firstName: 'Matt',
    lastName: 'Ellis',
    email: 'matt@nudj.co',
    url: 'http://test.com/',
    title: 'Design Wizard',
    type: 'external',
    company: 'nudj',
    status: 'user'
  },
  {
    id: 'person5',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    firstName: 'David',
    lastName: 'Platt',
    email: 'david@nudj.co',
    url: 'http://not-a-real-person.com',
    title: 'Senior Fake User',
    type: 'external',
    company: 'nudj',
    status: 'user'
  },
  {
    id: 'person6',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    firstName: 'Tim',
    lastName: 'Robinson',
    email: 'tim@nudj.co',
    url: 'http://not-a-real-person.com',
    title: 'Junior Fake User',
    type: 'external',
    company: 'nudj',
    status: 'user'
  }
])
data.hirers = data.hirers.concat([
  {
    id: 'hirer1',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    person: 'person5',
    company: 'company1'
  },
  {
    id: 'hirer2',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    person: 'person1',
    company: 'company1'
  },
  {
    id: 'hirer3',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    person: 'person6',
    company: 'company1'
  }
])
data.hirerOnboardedEvents = data.hirerOnboardedEvents.concat([
  {
    id: 'hirerOnboardedEvent1',
    created: '1986-07-06T07:34:54.000+00:00',
    modified: '2000-01-17T02:51:58.000+00:00',
    hirer: 'hirer1'
  }
])
data.employees = data.employees.concat([
  {
    id: 'employee1',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    person: 'person4',
    company: 'company1'
  }
])
data.referrals = data.referrals.concat([
  {
    id: 'referral1',
    job: 'job2',
    person: 'person2',
    parent: null,
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00'
  }
])
data.applications = data.applications.concat([
  {
    id: 'application1',
    job: 'job2',
    person: 'person3',
    referral: 'referral1',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00'
  }
])
data.recommendations = data.recommendations.concat([
  {
    id: 'recommendation1',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    job: 'job2',
    person: 'person1',
    hirer: 'hirer1',
    source: 'HIRER'
  },
  {
    id: 'recommendation2',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    job: 'job2',
    person: 'person3',
    hirer: 'hirer1',
    source: 'NUDJ'
  },
  {
    id: 'recommendation3',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    job: 'job2',
    person: 'person2',
    hirer: 'hirer1',
    source: 'HIRER'
  },
  {
    id: 'recommendation4',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    job: 'job2',
    person: 'person5',
    hirer: 'hirer1',
    source: 'NUDJ'
  }
])
data.companyTasks = data.companyTasks.concat([
  {
    id: 'companyTask2',
    company: 'company1',
    type: 'SEND_SURVEY_INTERNAL',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    completed: false,
    completedBy: 'person2'
  },
  {
    id: 'companyTask3',
    company: 'company1',
    type: 'SHARE_JOBS',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    completed: true,
    completedBy: null
  }
])
data.personTasks = data.personTasks.concat([
  {
    id: 'personTask1',
    person: 'person5',
    type: 'UNLOCK_NETWORK_LINKEDIN',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    completed: false
  },
  {
    id: 'personTask4',
    person: 'person5',
    type: 'HIRER_SURVEY',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    completed: false
  }
])
data.tokens = data.tokens.concat([
  {
    id: 'token1',
    token: 'nice-fat-hash',
    type: 'TEST_TOKEN',
    data: {
      employeeSurvey: 'employeeSurvey1'
    }
  }
])
data.employeeSurveys = data.employeeSurveys.concat([
  {
    id: 'employeeSurvey1',
    employee: 'employee1',
    survey: 'survey1'
  }
])
data.surveys = data.surveys.concat([
  {
    id: 'survey1',
    slug: 'aided-recall-baby',
    company: 'company1',
    introTitle: 'rbeuifr friofrenf egrmeg',
    introDescription: 'fnreu giegoireg nreiogrneiog reniogew fiowef newof newofnewiof ewnifowe nfiowef niewof nweiofewniof ewniofnoew nfwenfw',
    outroTitle: 'rbeuifr friofrenf egrmeg',
    outroDescription: 'fnreu giegoireg nreiogrneiog reniogew fiowef newof newofnewiof ewnifowe nfiowef niewof nweiofewniof ewniofnoew nfwenfw'
  }
])
data.surveySections = data.surveySections.concat([
  {
    id: 'section1',
    survey: 'survey1',
    title: 'Professional + Previous Employers',
    description: 'First up, the places that you\'ve worked before and the people you know professionally.'
  }
])
data.surveyQuestions = data.surveyQuestions.concat([
  {
    id: 'question1',
    surveySection: 'section1',
    name: 'workBefore',
    title: 'Where did you work before BEAR?',
    description: 'Please list all of your previous employers. Thanks!',
    type: COMPANIES,
    required: false,
    tags: []
  },
  {
    id: 'question2',
    surveySection: 'section1',
    name: 'accountManagers',
    title: 'Do you know any account managers?',
    description: 'Add them manually or select them from your list of contacts below...',
    type: CONNECTIONS,
    required: false,
    tags: ['Account Management']
  }
])
data.connectionSources = data.connectionSources.concat([
  {
    id: 'connectionSource1',
    created: '2017-06-08T11:38:19.485+00:00',
    modified: '2017-06-08T11:38:19.485+00:00',
    name: 'linkedin'
  }
])

server = mock.gql({ data }).listen(81, 82, () => console.log('info', 'Mock GQL API running'))
