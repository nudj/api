const ID = 'ID'

module.exports = [
  {
    name: 'companies',
    data: [
      {
        _key: ID,
        prop: 'value'
      }
    ]
  },
  {
    name: 'connections',
    data: [
      {
        _key: ID,
        prop: 'value',
        company: ID,
        from: ID,
        person: ID,
        role: ID
      }
    ]
  },
  {
    name: 'jobs',
    data: [
      {
        _key: ID,
        prop: 'value',
        company: ID,
        relatedJobs: [ID]
      }
    ]
  },
  {
    name: 'employments',
    data: [
      {
        _key: ID,
        prop: 'value',
        company: ID
      }
    ]
  },
  {
    name: 'hirers',
    data: [
      {
        _key: ID,
        prop: 'value',
        company: ID,
        person: ID
      }
    ]
  },
  {
    name: 'referrals',
    data: [
      {
        _key: ID,
        prop: 'value',
        job: ID,
        person: ID,
        parent: ID
      }
    ]
  },
  {
    name: 'people',
    data: [
      {
        _key: ID,
        prop: 'value'
      }
    ]
  },
  {
    name: 'accounts',
    data: [
      {
        _key: ID,
        prop: 'value',
        person: ID
      }
    ]
  },
  {
    name: 'applications',
    data: [
      {
        _key: ID,
        prop: 'value',
        person: ID,
        referral: ID
      }
    ]
  },
  {
    name: 'companyTasks',
    data: [
      {
        _key: ID,
        prop: 'value',
        completedBy: ID
      }
    ]
  },
  {
    name: 'conversations',
    data: [
      {
        _key: ID,
        prop: 'value',
        person: ID,
        recipient: ID
      }
    ]
  },
  {
    name: 'messages',
    data: [
      {
        _key: ID,
        prop: 'value',
        from: ID,
        to: ID
      }
    ]
  },
  {
    name: 'personTasks',
    data: [
      {
        _key: ID,
        prop: 'value',
        person: ID
      }
    ]
  },
  {
    name: 'surveys',
    data: [
      {
        _key: ID,
        prop: 'value',
        company: ID,
        surveySections: [ID]
      }
    ]
  },
  {
    name: 'surveySections',
    data: [
      {
        _key: ID,
        prop: 'value',
        survey: ID,
        surveyQuestions: [ID]
      }
    ]
  },
  {
    name: 'surveyQuestions',
    data: [
      {
        _key: ID,
        prop: 'value',
        surveySection: ID
      }
    ]
  },
  {
    name: 'surveyAnswers',
    data: [
      {
        _key: ID,
        prop: 'value',
        person: ID,
        connections: [ID],
        surveyQuestion: ID
      }
    ]
  },
  {
    name: 'roles',
    data: [
      {
        _key: ID,
        prop: 'value'
      }
    ]
  },
  {
    name: 'employees',
    data: [
      {
        _key: ID,
        prop: 'value'
      }
    ]
  },
  {
    name: 'events',
    data: [
      {
        _key: ID,
        prop: 'value',
        entityType: 'jobs',
        entityId: ID
      }
    ]
  },
  {
    name: 'recommendations',
    data: [
      {
        _key: ID,
        prop: 'value'
      }
    ]
  }
]
