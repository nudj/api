module.exports = [
  {
    type: 'Account',
    locations: [
      {
        type: 'Person',
        field: 'accountByFilters',
        many: false
      },
      {
        type: 'Person',
        field: 'createOrUpdateAccount',
        many: false
      }
    ]
  },
  {
    type: 'Application',
    locations: [
      {
        type: 'Job',
        field: 'applicationByFilters',
        many: false
      },
      {
        type: 'Job',
        field: 'applications',
        many: true
      },
      {
        type: 'Job',
        field: 'createApplication',
        many: false
      }
    ]
  },
  {
    type: 'Company',
    locations: [
      {
        type: 'Connection',
        field: 'company',
        many: false
      },
      {
        type: 'Employee',
        field: 'company',
        many: false
      },
      {
        type: 'Employment',
        field: 'company',
        many: false
      },
      {
        type: 'Hirer',
        field: 'company',
        many: false
      },
      {
        type: 'Job',
        field: 'company',
        many: false
      },
      {
        type: 'Survey',
        field: 'company',
        many: false
      }
    ]
  },
  {
    type: 'Conversation',
    locations: [
      {
        type: 'Person',
        field: 'conversationByFilters',
        many: false
      },
      {
        type: 'Person',
        field: 'conversations',
        many: true
      },
      {
        type: 'Person',
        field: 'sendEmail',
        many: false
      }
    ]
  },
  {
    type: 'Employee',
    locations: []
  },
  {
    type: 'Employment',
    locations: [
      {
        type: 'Person',
        field: 'employments',
        many: true
      },
      {
        type: 'Person',
        field: 'getOrCreateEmployment',
        many: false
      }
    ]
  },
  {
    type: 'Event',
    locations: [
      {
        type: 'Job',
        field: 'recordEvent',
        many: false
      }
    ]
  },
  {
    type: 'Hirer',
    locations: [
    ]
  },
  {
    type: 'Job',
    locations: [
      {
        type: 'Company',
        field: 'jobByFilters',
        many: false
      },
      {
        type: 'Company',
        field: 'jobs',
        many: true
      },
      {
        type: 'Company',
        field: 'jobsByFilters',
        many: true
      },
      {
        type: 'Job',
        field: 'relatedJobs',
        many: true
      },
      {
        type: 'Referral',
        field: 'job',
        many: false
      },
      {
        type: 'Application',
        field: 'job',
        many: false
      }
    ]
  },
  {
    type: 'Person',
    locations: [
      {
        type: 'Account',
        field: 'person',
        many: false
      },
      {
        type: 'Application',
        field: 'person',
        many: false
      },
      {
        type: 'Connection',
        field: 'from',
        many: false
      },
      {
        type: 'Connection',
        field: 'person',
        many: false
      },
      {
        type: 'Conversation',
        field: 'person',
        many: false
      },
      {
        type: 'Conversation',
        field: 'recipient',
        many: false
      },
      {
        type: 'Employee',
        field: 'person',
        many: false
      },
      {
        type: 'Employment',
        field: 'person',
        many: false
      },
      {
        type: 'Hirer',
        field: 'person',
        many: false
      },
      {
        type: 'Referral',
        field: 'person',
        many: false
      },
      {
        type: 'SurveyAnswer',
        field: 'person',
        many: false
      }
    ]
  },
  {
    type: 'Role',
    locations: [
      {
        type: 'Connection',
        field: 'role',
        many: false
      }
    ]
  },
  {
    type: 'Survey',
    locations: [
      {
        type: 'Company',
        field: 'surveyByFilters',
        many: false
      },
      {
        type: 'Company',
        field: 'surveys',
        many: true
      },
      {
        type: 'Company',
        field: 'surveysByFilters',
        many: true
      },
      {
        type: 'SurveySection',
        field: 'survey',
        many: false
      }
    ]
  },
  {
    type: 'SurveyAnswer',
    locations: []
  },
  {
    type: 'SurveySection',
    locations: [
      {
        type: 'Survey',
        field: 'surveySectionByFilters',
        many: false
      },
      {
        type: 'Survey',
        field: 'surveySections',
        many: true
      },
      {
        type: 'SurveyQuestion',
        field: 'surveySection',
        many: false
      }
    ]
  },
  {
    type: 'SurveyQuestion',
    locations: [
      {
        type: 'SurveyAnswer',
        field: 'surveyQuestion',
        many: false
      },
      {
        type: 'SurveySection',
        field: 'surveyQuestionByFilters',
        many: false
      },
      {
        type: 'SurveySection',
        field: 'surveyQuestions',
        many: true
      }
    ]
  },
  {
    type: 'Connection',
    locations: [
      {
        type: 'Person',
        field: 'asAConnectionByFilters',
        many: false
      },
      {
        type: 'Person',
        field: 'connectionByFilters',
        many: false
      },
      {
        type: 'Person',
        field: 'connections',
        many: true
      },
      {
        type: 'Person',
        field: 'getOrCreateConnection',
        many: false
      },
      {
        type: 'Person',
        field: 'searchConnections',
        many: true
      },
      {
        type: 'SurveyAnswer',
        field: 'connections',
        many: true
      }
    ]
  }
]
