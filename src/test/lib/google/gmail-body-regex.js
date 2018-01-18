/* eslint-env mocha */
const chai = require('chai')
const sinonChai = require('sinon-chai')

const gmailRegex = require('../../../gql/lib/google/gmail-body-regex')

const expect = chai.expect
chai.use(sinonChai)

describe('Gmail regex', () => {
  it('matches divs with class "gmail_extra"', () => {
    const string = `I am<div class="gmail_extra">inside a div!</div>`
    expect(gmailRegex.test(string)).to.be.true()
  })

  it('matches the correct div', () => {
    const string = `I am<div class="gmail_extra">inside a div!</div>`
    expect(string.search(gmailRegex)).to.equal(4)
  })

  it('matches the div with additonal spacing inside', () => {
    const string = `I am<div  class="gmail_extra">inside a div!</div>`
    expect(gmailRegex.test(string)).to.be.true()
  })

  it('matches the div with additonal spacing at end of tag', () => {
    const string = `I am<div class="gmail_extra" >inside a div!</div>`
    expect(gmailRegex.test(string)).to.be.true()
  })

  it('does not match other tags', () => {
    const string = `I am<p class="gmail_extra" >inside a div!</p>`
    expect(gmailRegex.test(string)).to.be.false()
  })

  it('does not match invalid tags', () => {
    const string = `I am<div asf class="gmail_extra" >inside a div!</p>`
    expect(gmailRegex.test(string)).to.be.false()
  })

  it('does not match regular divs', () => {
    const string = `I am<div>inside a div!</div>`
    expect(gmailRegex.test(string)).to.be.false()
  })

  it('does not match similar divs', () => {
    const string = `I am<div class="email_extra">inside a div!</div>`
    expect(gmailRegex.test(string)).to.be.false()
  })
})
