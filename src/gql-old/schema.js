module.exports = `
  scalar DateTime

  scalar Data

  enum InternalSend {
    MAILGUN
    GMAIL
  }

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

  enum SurveyQuestionType {
    COMPANIES
    CONNECTIONS
  }

  enum NotificationType {
    success
    error
    info
  }

  type Notification {
    type: String!
    message: String!
  }

  type Company {
    id: ID!
    created: DateTime!
    modified: DateTime!
    description: String
    mission: String
    facebook: String
    industry: String
    linkedin: String
    location: String
    logo: String
    name: String!
    size: String
    slug: String
    twitter: String
    url: String
    onboarded: Boolean
    jobs: [Job!]!
    hirers: [Hirer!]!
    tasks: [CompanyTask!]!
    surveys: [Survey!]!
  }

  type CompanyOnboardedEvent {
    id: ID!
    created: DateTime!
    modified: DateTime!
    company: Company!
  }

  type FormerEmployer {
    id: ID!
    created: DateTime!
    modified: DateTime!
    name: String!
    company: Company!
    person: Person!
    source: String!
  }

  type Job {
    id: ID!
    created: DateTime!
    modified: DateTime!
    title: String!
    slug: String!
    description: String!
    bonus: Int!
    roleDescription: String!
    candidateDescription: String!
    location: String!
    remuneration: String!
    status: String!
    templateTags: [String!]!
    type: String!
    url: String!
    experience: String
    requirements: String

    tags: [String!]!
    company: Company!
    relatedJobs: [Job!]!
    applications: [Application!]!
    internalMessages: [InternalMessage!]!
    externalMessages: [ExternalMessage!]!
    recommendations: [Recommendation!]!
    referrals: [Referral!]!
  }

  type Person {
    company: String
    created: DateTime!
    email: String!
    firstName: String
    id: ID!
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
    tasks: [PersonTask!]!
    incompleteTaskCount: Int
    connections: [Connection!]!
    formerEmployers: [FormerEmployer!]!
  }

  type Application {
    id: ID!
    created: DateTime!
    modified: DateTime!
    job: Job!
    person: Person!
    referral: Referral
  }

  type Message {
    created: DateTime!
    id: ID!
    pixelToken: String!
    readCount: Int!
    modified: DateTime!
  }

  type InternalMessage {
    id: ID!
    created: DateTime!
    modified: DateTime!
    recipients: [String]!
    subject: String!
    message: String!
    type: InternalSend!
    sent: Boolean!
    hirer: Hirer!
    job: Job!
  }

  type ExternalMessage {
    composeMessage: String
    created: DateTime!
    hirer: Hirer!
    id: ID!
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
    id: ID!
    person: Person!
    recommendations: [Recommendation!]!
    modified: DateTime!
    onboarded: Boolean
  }

  type HirerOnboardedEvent {
    id: ID!
    created: DateTime!
    modified: DateTime!
    hirer: Hirer!
  }

  type Recommendation {
    created: DateTime!
    hirer: Hirer!
    id: ID!
    job: Job!
    person: Person!
    source: RecommendationSource!
    modified: DateTime!
  }

  type Referral {
    applications: [Application!]!
    created: DateTime!
    parent: Referral
    id: ID!
    job: Job!
    person: Person!
    referrals: [Referral!]!
    modified: DateTime!
  }

  type Token {
    created: DateTime!
    id: ID!
    modified: DateTime!
    type: TokenType
    token: String
    data: Data
  }

  type Employee {
    created: DateTime!
    id: ID!
    modified: DateTime!
    company: Company!
    person: Person!
  }

  type Survey {
    id: ID!
    created: DateTime!
    modified: DateTime!
    slug: String!
    introTitle: String
    introDescription: String
    outroTitle: String
    outroDescription: String
    company: Company!
    surveySections: [SurveySection!]!
  }

  type SurveySection {
    id: ID!
    created: DateTime!
    modified: DateTime!
    title: String!
    description: String
    survey: Survey!
    surveyQuestions: [SurveyQuestion!]!
  }

  type SurveyQuestion {
    id: ID!
    created: DateTime!
    modified: DateTime!
    title: String!
    description: String
    name: String!
    type: SurveyQuestionType!
    required: Boolean!
    tags: [String!]!
    surveySection: SurveySection!
  }

  type Connection {
    id: ID!
    created: DateTime!
    modified: DateTime!
    firstName: String
    lastName: String
    from: Person!
    person: Person!
    role: Role
    company: Company
    source: ConnectionSource!
  }

  type ConnectionSource {
    id: ID!
    created: DateTime!
    modified: DateTime!
    name: String!
  }

  type EmployeeSurvey {
    id: ID!
    created: DateTime!
    modified: DateTime!
    employee: Employee!
    survey: Survey!
    typeformToken: String
  }

  type PersonTask {
    id: ID!
    created: DateTime!
    modified: DateTime!
    type: TaskType!
    completed: Boolean!
    person: Person!
  }

  type CompanyTask {
    id: ID!
    created: DateTime!
    modified: DateTime!
    type: TaskType!
    company: Company!
    completed: Boolean!
    completedBy: Person
  }

  type Role {
    id: ID!
    created: DateTime!
    modified: DateTime!
    name: String!
  }
`
