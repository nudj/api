const { makeExecutableSchema } = require('graphql-tools')
const mergeDefinitions = require('../lib/merge-definitions')

const modules = [
  require('./accessRequest'),
  require('./account'),
  require('./account/person'),
  require('./application'),
  require('./application/person'),
  require('./application/referral'),
  require('./company'),
  require('./company/createHirerByEmail'),
  require('./company/createAccessRequest'),
  require('./company/createJob'),
  require('./company/createJobAndOnboardHirer'),
  require('./company/hirers'),
  require('./company/inviteMembers'),
  require('./company/inviteMembersOnboarding'),
  require('./company/jobByFilters'),
  require('./company/jobs'),
  require('./company/jobsByFilters'),
  require('./company/sendJobEmails'),
  require('./company/surveyByFilters'),
  require('./company/surveyByFiltersOrDefault'),
  require('./company/surveyOrDefault'),
  require('./company/surveys'),
  require('./company/surveysByFilters'),
  require('./company/updateJob'),
  require('./connection'),
  require('./connection/company'),
  require('./connection/from'),
  require('./connection/person'),
  require('./connection/role'),
  require('./connection/tags'),
  require('./conversation'),
  require('./conversation/latest-message'),
  require('./conversation/messages'),
  require('./conversation/person'),
  require('./conversation/recipient'),
  require('./conversation/sendMessage'),
  require('./conversation/subject'),
  require('./dateRange'),
  require('./employee'),
  require('./employment'),
  require('./employment/company'),
  require('./events'),
  require('./hirer'),
  require('./hirer/company'),
  require('./hirer/person'),
  require('./hirer/setOnboarded'),
  require('./hirer/updateType'),
  require('./importLog'),
  require('./job'),
  require('./job/applicationByFilters'),
  require('./job/applications'),
  require('./job/applicationsCountByFilters'),
  require('./job/company'),
  require('./job/createApplication'),
  require('./job/createReferralByEmail'),
  require('./job/getOrCreateReferralForUser'),
  require('./job/createReferralWithParentForPerson'),
  require('./job/recordEvent'),
  require('./job/referralByFilters'),
  require('./job/referrals'),
  require('./job/referralsCountByFilters'),
  require('./job/relatedJobs'),
  require('./job/tags'),
  require('./job/viewCountByFilters'),
  require('./message'),
  require('./messageEvent'),
  require('./message/from'),
  require('./message/to'),
  require('./notification'),
  require('./person'),
  require('./person/accountByFilters'),
  require('./person/addCompanyAndAssignUserAsHirer'),
  require('./person/asAConnectionByFilters'),
  require('./person/company'),
  require('./person/connectionByFilters'),
  require('./person/connectionsCount'),
  require('./person/conversationByFilters'),
  require('./person/conversations'),
  require('./person/createOrUpdateAccount'),
  require('./person/createReferral'),
  require('./person/employments'),
  require('./person/getOrCreateConnection'),
  require('./person/getOrCreateEmployment'),
  require('./person/hirer'),
  require('./person/importLinkedinConnections'),
  require('./person/incompleteTaskCount'),
  require('./person/notifyByEmail'),
  require('./person/referralByFilters'),
  require('./person/role'),
  require('./person/roles'),
  require('./person/searchConnections'),
  require('./person/sendEmail'),
  require('./person/verifyGoogleAuthentication'),
  require('./referral'),
  require('./referral/job'),
  require('./referral/parent'),
  require('./referral/person'),
  require('./role'),
  require('./status'),
  require('./survey'),
  require('./survey/company'),
  require('./survey/surveySectionByFilters'),
  require('./survey/surveySections'),
  require('./surveyAnswer'),
  require('./surveyAnswer/connections'),
  require('./surveyAnswer/person'),
  require('./surveyAnswer/surveyQuestion'),
  require('./surveyQuestion'),
  require('./surveyQuestion/surveySection'),
  require('./surveyQuestion/tags'),
  require('./surveySection'),
  require('./surveySection/survey'),
  require('./surveySection/surveyQuestionByFilters'),
  require('./surveySection/surveyQuestions'),
  require('./tag'),

  // Enums
  require('./enums/account-types'),
  require('./enums/data-sources'),
  require('./enums/email-preference-types'),
  require('./enums/event-entity-types'),
  require('./enums/event-types'),
  require('./enums/expertise-tags'),
  require('./enums/hirer-types'),
  require('./enums/job-status-types'),
  require('./enums/prismic-repos'),
  require('./enums/recommendation-sources'),
  require('./enums/survey-question-types'),
  require('./enums/tag-sources'),
  require('./enums/tag-types'),
  require('./enums/task-types'),

  // Scalars
  require('./scalars/data'),
  require('./scalars/datetime'),

  // Mutations
  require('./mutation'),
  require('./mutation/application'),
  require('./mutation/applicationByFilters'),
  require('./mutation/applications'),
  require('./mutation/applicationsByFilters'),
  require('./mutation/companies'),
  require('./mutation/companiesByFilters'),
  require('./mutation/company'),
  require('./mutation/companyByFilters'),
  require('./mutation/connection'),
  require('./mutation/connectionByFilters'),
  require('./mutation/connections'),
  require('./mutation/connectionsByFilters'),
  require('./mutation/createCompany'),
  require('./mutation/createMessageEvent'),
  require('./mutation/createPerson'),
  require('./mutation/createSurvey'),
  require('./mutation/createSurveyQuestion'),
  require('./mutation/createSurveySection'),
  require('./mutation/employee'),
  require('./mutation/employeeByFilters'),
  require('./mutation/employees'),
  require('./mutation/employeesByFilters'),
  require('./mutation/employment'),
  require('./mutation/employmentByFilters'),
  require('./mutation/employments'),
  require('./mutation/employmentsByFilters'),
  require('./mutation/fetchTags'),
  require('./mutation/fetchTemplate'),
  require('./mutation/getCompanyEnrichmentDataByUserEmail'),
  require('./mutation/getOrCreatePerson'),
  require('./mutation/hirer'),
  require('./mutation/hirerByFilters'),
  require('./mutation/hirers'),
  require('./mutation/hirersByFilters'),
  require('./mutation/job'),
  require('./mutation/jobByFilters'),
  require('./mutation/jobs'),
  require('./mutation/jobsByFilters'),
  require('./mutation/people'),
  require('./mutation/peopleByFilters'),
  require('./mutation/person'),
  require('./mutation/personByFilters'),
  require('./mutation/referral'),
  require('./mutation/referralByFilters'),
  require('./mutation/referrals'),
  require('./mutation/referralsByFilters'),
  require('./mutation/requestAccess'),
  require('./mutation/role'),
  require('./mutation/roleByFilters'),
  require('./mutation/roles'),
  require('./mutation/rolesByFilters'),
  require('./mutation/setNotification'),
  require('./mutation/signUp'),
  require('./mutation/storeSurveyAnswer'),
  require('./mutation/survey'),
  require('./mutation/surveyAnswer'),
  require('./mutation/surveyAnswerByFilters'),
  require('./mutation/surveyAnswers'),
  require('./mutation/surveyAnswersByFilters'),
  require('./mutation/surveyByFilters'),
  require('./mutation/surveyQuestion'),
  require('./mutation/surveyQuestionByFilters'),
  require('./mutation/surveyQuestions'),
  require('./mutation/surveyQuestionsByFilters'),
  require('./mutation/surveys'),
  require('./mutation/surveysByFilters'),
  require('./mutation/surveySection'),
  require('./mutation/surveySectionByFilters'),
  require('./mutation/surveySections'),
  require('./mutation/surveySectionsByFilters'),
  require('./mutation/updateCompany'),
  require('./mutation/updatePerson'),
  require('./mutation/updateSurvey'),
  require('./mutation/updateSurveyQuestion'),
  require('./mutation/updateSurveySection'),
  require('./mutation/user'),

  // Queries
  require('./query'),
  require('./query/application'),
  require('./query/applicationByFilters'),
  require('./query/applications'),
  require('./query/applicationsByFilters'),
  require('./query/companies'),
  require('./query/companiesByFilters'),
  require('./query/company'),
  require('./query/companyByFilters'),
  require('./query/connection'),
  require('./query/connectionByFilters'),
  require('./query/connections'),
  require('./query/connectionsByFilters'),
  require('./query/conversation'),
  require('./query/employee'),
  require('./query/employeeByFilters'),
  require('./query/employees'),
  require('./query/employeesByFilters'),
  require('./query/employment'),
  require('./query/employmentByFilters'),
  require('./query/employments'),
  require('./query/employmentsByFilters'),
  require('./query/fetchTags'),
  require('./query/fetchTemplate'),
  require('./query/hirer'),
  require('./query/hirerByFilters'),
  require('./query/hirers'),
  require('./query/hirersAsPeople'),
  require('./query/hirersByFilters'),
  require('./query/job'),
  require('./query/jobByFilters'),
  require('./query/jobs'),
  require('./query/jobsByFilters'),
  require('./query/people'),
  require('./query/peopleByFilters'),
  require('./query/person'),
  require('./query/personByFilters'),
  require('./query/referral'),
  require('./query/referralByFilters'),
  require('./query/referrals'),
  require('./query/referralsByFilters'),
  require('./query/role'),
  require('./query/roleByFilters'),
  require('./query/roles'),
  require('./query/rolesByFilters'),
  require('./query/survey'),
  require('./query/surveyAnswer'),
  require('./query/surveyAnswerByFilters'),
  require('./query/surveyAnswers'),
  require('./query/surveyAnswersByFilters'),
  require('./query/surveyByFilters'),
  require('./query/surveyQuestion'),
  require('./query/surveyQuestionByFilters'),
  require('./query/surveyQuestions'),
  require('./query/surveyQuestionsByFilters'),
  require('./query/surveys'),
  require('./query/surveysByFilters'),
  require('./query/surveySection'),
  require('./query/surveySectionByFilters'),
  require('./query/surveySections'),
  require('./query/surveySectionsByFilters'),
  require('./query/user')
]

const definitions = mergeDefinitions(...modules)

module.exports = makeExecutableSchema(definitions)
