module.exports = {
  typeDefs: `
    extend type Survey {
      surveySections: [SurveySection!]!
    }
  `,
  resolvers: {
    Survey: {
      surveySections: async (survey, args, context) => {
        const { surveySections } = survey
        const sectionIds = JSON.parse(surveySections)
        const sections = await context.sql.readMany({
          type: 'surveySections',
          ids: sectionIds
        })
        const sectionMap = sections.reduce((allSections, section) => {
          allSections[section.id] = section
          return allSections
        }, {})

        return sectionIds.map(id => sectionMap[id]).filter(Boolean)
      }
    }
  }
}
