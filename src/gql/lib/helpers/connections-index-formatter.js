const uniq = require('lodash/uniq')

const connectionsIndexFormatter = ({
  connections,
  people,
  companies,
  roles,
  surveyQuestions,
  surveyAnswers,
  entityTags,
  tags
}) => {
  // Reduce over surveyAnswers to find answers with connections and build a
  // mapping of connections to their relevant tags
  const connectionsToTagsMap = Object.keys(surveyAnswers).reduce((all, next) => {
    const { surveyQuestion, connections: connectionIds } = surveyAnswers[next]
    const { tags: surveyQuestionEntityTags } = surveyQuestions[surveyQuestion]

    // For each survey question, fetch tags of `expertise` type
    const newTags = surveyQuestionEntityTags.map(entityTagId => {
      const { tagId } = entityTags[entityTagId]
      const tag = tags[tagId]

      if (tag.type === 'expertise') return tag.name
    }).filter(Boolean)

    // Using connection IDs stored against question, construct object with those
    // connections as relating to the newly fetched tags
    connectionIds.forEach(connectionId => {
      all[connectionId] = uniq((all[connectionId] || []).concat(newTags))
    })

    return all
  }, {})

  return connections.map(connection => {
    const experienceTags = connectionsToTagsMap[connection.id] || []

    return {
      email: people[connection.person].email,
      firstName: connection.firstName,
      lastName: connection.lastName,
      fullName: `${connection.firstName} ${connection.lastName}`,
      role: roles[connection.role].name,
      company: companies[connection.company].name,
      experienceTags
    }
  })
}

module.exports = connectionsIndexFormatter
