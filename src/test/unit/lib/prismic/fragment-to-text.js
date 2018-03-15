/* eslint-env mocha */
const chai = require('chai')

const expect = chai.expect
const { fragmentToText } = require('../../../../gql/lib/prismic')

describe('fragmentToText', () => {
  describe('when the fragment has text blocks', () => {
    it('should create a string from text blocks', async () => {
      const fragment = {
        value: 'Not accessed',
        blocks: [
          {
            text: 'Hello'
          },
          {
            text: 'World'
          },
          {
            text: 'How are you?'
          }
        ]
      }
      const text = fragmentToText(fragment)
      expect(text).to.equal('Hello\n\nWorld\n\nHow are you?')
    })

    it('should return an empty string for blocks without text', async () => {
      const fragment = {
        value: 'Not accessed',
        blocks: [
          {
            text: 'Chariots'
          },
          {
            apples: 'Not text'
          },
          {
            text: 'Prime'
          }
        ]
      }
      const text = fragmentToText(fragment)
      expect(text).to.equal('Chariots\n\n\n\nPrime')
    })
  })

  describe('when the fragment does not have text blocks', () => {
    it('should return stringified value if value exists', async () => {
      const fragment = {
        value: ['Wassup']
      }
      const text = fragmentToText(fragment)
      expect(text).to.equal('Wassup')
    })

    it('should return empty string if value does not exist', async () => {
      const text = fragmentToText({})
      expect(text).to.equal('')
    })

    it('should return empty string if fragment does not exist', async () => {
      const text = fragmentToText()
      expect(text).to.equal('')
    })
  })
})
