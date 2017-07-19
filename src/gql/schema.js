module.exports = `
  scalar DateTime

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
  }

  enum RecommendationSource {
    NUDJ
    HIRER
  }

  type Company {
    created: DateTime!
    description: String!
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
  }

  type Job {
    bonus: Int!
    company: Company!
    created: DateTime!
    description: String!
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
`
