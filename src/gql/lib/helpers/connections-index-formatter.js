const flatten = require('lodash/flatten')
const { merge } = require('@nudj/library')

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
  const connectionToQuestionsMap = Object.keys(surveyAnswers).reduce((all, next) => {
    const { connections: connectionIds, surveyQuestion } = surveyAnswers[next]
    connectionIds.forEach(connectionId => {
      all[connectionId] = (all[connectionId] || []).concat(surveyQuestion)
    })
    return all
  }, {})

  const tagMap = Object.keys(connectionToQuestionsMap).reduce((all, next) => {
    const questionIds = connectionToQuestionsMap[next]

    questionIds.forEach(questionId => {
      const questionTags = surveyQuestions[questionId].tags.map(entityTagId => {
        const { tagId } = entityTags[entityTagId]
        const tag = tags[tagId]
        if (tag.type === 'expertise') return tag.name
      }).filter(Boolean)

      all[questionId] = (all[questionId] || []).concat(questionTags)
    })

    return all
  }, {})

  Object.keys(connectionToQuestionsMap).forEach(connectionId => {
    const questionIds = connectionToQuestionsMap[connectionId]
    connectionToQuestionsMap[connectionId] = flatten(
      connectionToQuestionsMap[connectionId].map(id => tagMap[id])
    )
  }, {})

  return connections.map(connection => {
    const experienceTags = connectionToQuestionsMap[connection.id]

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

// {
//   email: 'penny@email.com',
//   firstName: 'Penny',
//   lastName: 'Winters',
//   fullName: 'Penny Winters',
//   experienceTags: [ 'Winning', 'Education' ],
//   role: 'Teacher',
//   company: 'TeachingBlok'
// }
