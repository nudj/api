const { handleErrors } = require('../../lib')

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
      surveyByFiltersOrDefault: handleErrors(async (company, args, context) => {
        if (args.filters.slug !== 'default') {
          const [
            edge,
            filteredSurvey
          ] = await Promise.all([
            context.sql.readOne({
              type: 'companySurveys',
              filters: {
                company: company.id
              }
            }),
            context.sql.readOne({
              type: 'surveys',
              filters: args.filters
            })
          ])
          if (edge && filteredSurvey && edge.survey === filteredSurvey.id) {
            return filteredSurvey
          }
        }
        return context.sql.readOne({
          type: 'surveys',
          filters: {
            slug: 'default'
          }
        })
      })
    }
  }
}
