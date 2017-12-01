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

  type Notification {
    type: String!
    message: String!
  }

  type Company {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    description: String
    mission: String
    facebook: String
    industry: String
    jobs: [Job!]!
    linkedin: String
    location: String
    logo: String
    name: String!
    size: String
    slug: String
    twitter: String
    url: String
    hirers: [Hirer!]!
    onboarded: CompanyOnboardedEvent
    tasks: [CompanyTask!]!
    surveys: [Survey!]!
  }

  type CompanyOnboardedEvent {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    company: Company!
  }

  type FormerEmployer {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    name: String!
    company: Company!
    person: Person!
    source: String!
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
    tasks: [PersonTask!]!
    incompleteTaskCount: Int
    connections: [Connection!]!
    formerEmployers: [FormerEmployer!]!
  }

  type Application {
    created: DateTime!
    id: ID! @isUnique
    job: Job!
    person: Person!
    referral: Referral
    modified: DateTime!
  }

  type Message {
    created: DateTime!
    id: ID! @isUnique
    pixelToken: String!
    readCount: Int!
    modified: DateTime!
  }

  type InternalMessage {
    id: ID! @isUnique
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
    onboarded: HirerOnboardedEvent
  }

  type HirerOnboardedEvent {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    hirer: Hirer!
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
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    company: Company!
    slug: String!
    introTitle: String
    introDescription: String
    outroTitle: String
    outroDescription: String
    surveySections: [SurveySection!]!
  }

  type SurveySection {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    survey: Survey!
    title: String!
    description: String
    surveyQuestions: [SurveyQuestion!]!
  }

  type SurveyQuestion {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    surveySection: SurveySection!
    title: String!
    description: String
    name: String!
    type: SurveyQuestionType!
    required: Boolean!
    options: Data
    tags: [String!]!
  }

  type Connection {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    from: Person!
    person: Person!
    firstName: String
    lastName: String
    role: Role
    company: Company
    source: ConnectionSource!
  }

  type ConnectionSource {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    name: String!
  }

  type EmployeeSurvey {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    employee: Employee!
    survey: Survey!
    typeformToken: String
  }

  type PersonTask {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    type: TaskType!
    person: Person!
    completed: Boolean!
  }

  type CompanyTask {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    type: TaskType!
    company: Company!
    completed: Boolean!
    completedBy: Person
  }

  type Role {
    id: ID! @isUnique
    created: DateTime!
    modified: DateTime!
    name: String!
  }
`
