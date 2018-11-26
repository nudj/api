const { omitUndefined } = require('@nudj/library')

function postCandidateToGreenhouse ({ partner }) {
  return async ({ store, person, job, application, referral, notes }) => {
    const {
      email,
      firstName: first_name,
      lastName: last_name,
      url
    } = person

    const { externalId: job_id } = await store.readOne({
      type: 'atsJobs',
      filters: { jobId: job.id }
    })

    let referralDetails
    if (referral && referral.id && referral.person) {
      const referralPerson = await store.readOne({
        type: 'people',
        id: referral.person
      })

      referralDetails = {
        email: referralPerson.email,
        first_name: referralPerson.firstName,
        last_name: referralPerson.lastName
      }
    }

    const data = omitUndefined({
      prospect: false, // Tells greenhouse that this is an applicant, not a prospect (which is only a potential applicant)
      first_name,
      last_name,
      job_id, // Greenhouse's ID for the job
      external_id: application.id, // The ID of the application in our db
      emails: [{
        email,
        type: 'personal' // We have to make an assumption here because we cannot know for certain, and this is required
      }],
      website: url ? [{ url, type: 'personal' }] : undefined,
      notes: notes || 'Applied via nudj', // Although this information is displayed anyway, it's nice to have it in a short note too, for added clarity
      referral: referral ? referralDetails : undefined
    })

    return partner.post('candidates', data)
  }
}

module.exports = postCandidateToGreenhouse
