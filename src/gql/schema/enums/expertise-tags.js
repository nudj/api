// Values derived from Clearbit roles

module.exports = {
  typeDefs: `
    enum ExpertiseTagType {
      CEO,
      COMMUNICATIONS,
      CONSULTING,
      CUSTOMER_SERVICE,
      EDUCATION,
      ENGINEERING,
      FINANCE,
      FOUNDER,
      HEALTH_PROFESSIONAL,
      HUMAN_RESOURCES,
      INFORMATION_TECHNOLOGY,
      LEGAL,
      MARKETING,
      OPERATIONS,
      OWNER,
      PRESIDENT,
      PRODUCT,
      PUBLIC_RELATIONS,
      REAL_ESTATE,
      RECRUITING,
      RESEARCH,
      SALES
    }
  `,
  resolvers: {},
  name: 'ExpertiseTagType',
  values: {
    CEO: 'CEO',
    COMMUNICATIONS: 'Communications',
    CONSULTING: 'Consulting',
    CUSTOMER_SERVICE: 'Customer Service',
    EDUCATION: 'Education',
    ENGINEERING: 'Engineering',
    FINANCE: 'Finance',
    FOUNDER: 'Founder',
    HEALTH_PROFESSIONAL: 'Health Professional',
    HUMAN_RESOURCES: 'Human Resources',
    INFORMATION_TECHNOLOGY: 'IT',
    LEGAL: 'Legal',
    MARKETING: 'Marketing',
    OPERATIONS: 'Operations',
    OWNER: 'Owner',
    PRESIDENT: 'President',
    PRODUCT: 'Product',
    PUBLIC_RELATIONS: 'Public Relations',
    REAL_ESTATE: 'Real Estate',
    RECRUITING: 'Recruiting',
    RESEARCH: 'Research',
    SALES: 'Sales'
  }
}
