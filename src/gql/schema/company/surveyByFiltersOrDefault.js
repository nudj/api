module.exports = {
  typeDefs: `
    extend type Company {
      surveyByFiltersOrDefault (
        filters: SurveyFilterInput!
      ): Survey
    }
  `,
  resolvers: {
    Company: {
      surveyByFiltersOrDefault: async (company, args, context) => {
        if (args.filters.slug !== 'default') {
          const [
            edge,
            filteredSurvey
          ] = await Promise.all([
            context.store.readOne({
              type: 'companySurveys',
              filters: {
                company: company.id
              }
            }),
            context.store.readOne({
              type: 'surveys',
              filters: args.filters
            })
          ])
          if (edge && filteredSurvey && edge.survey === filteredSurvey.id) {
            return filteredSurvey
          }
        }
        return context.store.readOne({
          type: 'surveys',
          filters: {
            slug: 'default'
          }
        })
      }
    }
  }
}
