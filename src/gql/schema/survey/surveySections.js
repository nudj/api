module.exports = {
  typeDefs: `
    extend type Survey {
      surveySections: [SurveySection!]!
    }
  `,
  resolvers: {
    Survey: {
      surveySections: async (survey, args, context) => {
        const { surveySections: sectionIds } = survey
        const sections = await context.store.readMany({
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
