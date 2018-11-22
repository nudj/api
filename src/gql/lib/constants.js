const NUDJ = 'NUDJ'
const INTERNAL_EMAIL_ADDRESS = 'hello@nudj.co'
const INTERNAL_EMAIL_FROM = `nudj <${INTERNAL_EMAIL_ADDRESS}>`
const DUMMY_APPLICANT_EMAIL_ADDRESS = 'hello+applicant@nudj.co'
const DUMMY_APPLICANT = {
  firstName: 'Buzz',
  lastName: 'Lightyear',
  email: 'hello+applicant@nudj.co',
  url: 'https://pixar.wikia.com/wiki/Buzz_Lightyear',
  signedUp: true
}

const INTERCOM = {
  PROPS: {
    COMPANY: {
      HAS_HAD_JOB_PUBLISHED: 'has had job published',
      HAS_HAD_TEAM_INVITED: 'has had team invited'
    }
  }
}

module.exports = {
  NUDJ,
  INTERNAL_EMAIL_ADDRESS,
  INTERNAL_EMAIL_FROM,
  DUMMY_APPLICANT_EMAIL_ADDRESS,
  DUMMY_APPLICANT,
  INTERCOM
}
