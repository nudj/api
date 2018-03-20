module.exports = {
  typeDefs: `
    enum PrismicRepos {
      hirer
      web
    }
  `,
  resolvers: {},
  name: 'PrismicRepos',
  values: {
    WEB: 'web',
    HIRE: 'hirer'
  }
}
