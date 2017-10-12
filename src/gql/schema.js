module.exports = `
  scalar DateTime

  scalar Data

  enum ExternalLength {
    SHORT
    LONG
  }

  enum ExternalSend {
    EMAIL
    GMAIL
  }

  enum ExternalStyle {
    BFF
    FAMILIAR
    PROFESSIONAL
  }

  enum JobStatus {
    PUBLISHED
    ARCHIVED
    DRAFT
  }

  enum RecommendationSource {
    NUDJ
    HIRER
  }

  enum SurveyType {
    EMPLOYEE_SURVEY
    HIRER_SURVEY
  }

  enum TokenType {
    SHARE_COMPANY_JOBS
    SURVEY_TYPEFORM_COMPLETE
  }

  enum TaskType {
    HIRER_SURVEY
    SEND_SURVEY_INTERNAL
    SHARE_JOBS
    UNLOCK_NETWORK_LINKEDIN
  }

  type Company {
    created: DateTime!
    description: String!
    mission: String!
    facebook: String
    id: ID! @isUnique
    industry: String!
    jobs: [Job!]!
    linkedin: String
    location: String!
    logo: String!
    name: String!
    size: String!
    slug: String!
    twitter: String
    modified: DateTime!
    url: String!
    hirers: [Hirer!]!
    onboarded: Boolean!
  }

  type Job {
    bonus: Int!
    company: Company!
    created: DateTime!
    description: String!
    roleDescription: String!
    candidateDescription: String!
    experience: String
    id: ID! @isUnique
    location: String!
    relatedJobs: [Job!]!
    remuneration: String!
    requirements: String
    slug: String!
    status: String!
    tags: [String!]!
    templateTags: [String!]!
    title: String!
    type: String!
    modified: DateTime!
    url: String!
    applications: [Application!]!
    externalMessages: [ExternalMessage!]!
    recommendations: [Recommendation!]!
    referrals: [Referral!]!
  }

  type Person {
    company: String
    created: DateTime!
    email: String!
    firstName: String
    id: ID! @isUnique
    lastName: String
    status: String
    title: String
    type: String
    modified: DateTime!
    url: String
    applications: [Application!]!
    externalMessages: [ExternalMessage!]!
    hirer: Hirer
    recommendations: [Recommendation!]!
    referrals: [Referral!]!
  }

  type Application {
    created: DateTime!
    id: ID! @isUnique
    job: Job!
    person: Person!
    referral: Referral
    modified: DateTime!
  }

  type ExternalMessage {
    composeMessage: String
    created: DateTime!
    hirer: Hirer!
    id: ID! @isUnique
    job: Job!
    person: Person!
    selectLength: ExternalLength
    selectStyle: ExternalStyle
    sendMessage: ExternalSend
    modified: DateTime!
  }

  type Hirer {
    company: Company!
    created: DateTime!
    externalMessages: [ExternalMessage!]!
    id: ID! @isUnique
    person: Person!
    recommendations: [Recommendation!]!
    modified: DateTime!
  }

  type Recommendation {
    created: DateTime!
    hirer: Hirer!
    id: ID! @isUnique
    job: Job!
    person: Person!
    source: RecommendationSource!
    modified: DateTime!
  }

  type Referral {
    applications: [Application!]!
    created: DateTime!
    parent: Referral
    id: ID! @isUnique
    job: Job!
    person: Person!
    referrals: [Referral!]!
    modified: DateTime!
  }

  type Token {
    created: DateTime!
    id: ID! @isUnique
    modified: DateTime!
    type: TokenType
    token: String
    data: Data
  }

  type Employee {
    created: DateTime!
    id: ID! @isUnique
    modified: DateTime!
    company: Company!
    person: Person!
  }

  type Survey {
    created: DateTime!
    id: ID! @isUnique
    modified: DateTime!
    company: Company!
    link: String!
    uuid: String!
    type: SurveyType!
  }

  type EmployeeSurvey {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    employee: Employee!
    survey: Survey!
    typeformToken: String
  }

  type Task {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    type: TaskType!
    company: Company
    hirer: Hirer
    completed: Hirer
  }
`
