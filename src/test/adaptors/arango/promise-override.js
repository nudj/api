/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const GetPromiseOverride = require('../../../gql/adaptors/arango/promise-override')

describe('ArangoAdaptor PromiseOverride', () => {
  const PromiseOverride = GetPromiseOverride()

  it('should be a function', () => {
    expect(PromiseOverride).to.be.a('function')
  })

  describe('resolve', () => {
    it('should be passed into callback', () => {
      let r
      const test = () => new PromiseOverride(resolve => {
        r = resolve
      })
      test()
      expect(r).to.be.a('function')
    })
    it('should set internal resolution value', () => {
      const p = new PromiseOverride(resolve => resolve(123))
      expect(p.resolution).to.equal(123)
    })
    it('should not set internal error value', () => {
      const p = new PromiseOverride(resolve => resolve(123))
      expect(p.error).to.be.undefined()
    })
  })

  describe('reject', () => {
    it('should be passed into callback', () => {
      let r
      const test = () => new PromiseOverride((resolve, reject) => {
        r = reject
      })
      test()
      expect(r).to.be.a('function')
    })
    it('should set internal error value', () => {
      const p = new PromiseOverride((resolve, reject) => reject(123))
      expect(p.error).to.equal(123)
    })
    it('should not set internal resolution value', () => {
      const p = new PromiseOverride((resolve, reject) => reject(123))
      expect(p.resolution).to.be.undefined()
    })
  })

  it('should catch errors thrown in callback', () => {
    expect(() => new PromiseOverride(() => {
      throw new Error()
    })).to.not.throw()
  })

  it('should set internal error to value thrown', () => {
    const error = new Error('BAD STUFF')
    const p = new PromiseOverride(() => {
      throw error
    })
    expect(p.error).to.equal(error)
  })

  it('should return a thenable', () => {
    const p = new PromiseOverride(resolve => resolve(123))
    expect(p.then).to.exist()
    expect(p.catch).to.exist()
  })

  describe('then', () => {
    describe('if there has not already been an error/rejection', () => {
      it('should set the resolution value', () => {
        const p = new PromiseOverride(resolve => resolve('abc'))
          .then(() => 'def')
        expect(p.resolution).to.equal('def')
      })
      it('should pass the current resolution value into the callback', () => {
        const p = new PromiseOverride(resolve => resolve('abc'))
          .then(data => data + 'def')
        expect(p.resolution).to.equal('abcdef')
      })
      it('should catch errors thrown in callback', () => {
        const p = new PromiseOverride(resolve => resolve('abc'))
        expect(() => p.then(() => {
          throw new Error()
        })).to.not.throw()
      })
      it('should set internal error to value thrown', () => {
        const error = new Error('BAD STUFF')
        const p = new PromiseOverride(resolve => resolve('abc'))
          .then(() => {
            throw error
          })
        expect(p.error).to.equal(error)
      })
      it('return the promise', () => {
        const p = new PromiseOverride(resolve => resolve('abc'))
        const result = p.then(() => 'def')
        expect(result).to.equal(p)
      })
    })

    describe('if there has already been an error/rejection', () => {
      it('should do nothing', () => {
        const p = new PromiseOverride((resolve, reject) => reject('BAD STUFF'))
          .then(() => 'def')
        expect(p.resolution).to.be.undefined()
        expect(p.error).to.equal('BAD STUFF')
      })
    })

    describe('nested PromiseOverrides', () => {
      it('should resolve with the deepest resolve value', () => {
        const p = new PromiseOverride(resolve => resolve('abc'))
        p.then(data => new PromiseOverride(resolve => {
          resolve(data + 'def')
        }))
        expect(p.resolution).to.equal('abcdef')
      })

      it('should reject with the nested error', () => {
        const someError = new Error('BAD STUFF')
        const p = new PromiseOverride(resolve => resolve('abc'))
        p.then(data => new PromiseOverride((resolve, reject) => {
          reject(someError)
        }))
        expect(p.error).to.equal(someError)
      })
    })
  })

  describe('catch', () => {
    describe('if there has been an error/rejection', () => {
      const someError = new Error('BAD STUFF')

      it('should set new resolution value to callback return value', () => {
        const p = new PromiseOverride((resolve, reject) => reject(someError))
          .catch(() => 'def')
        expect(p.resolution).to.equal('def')
      })
      it('should reset the internal error value', () => {
        const p = new PromiseOverride((resolve, reject) => reject(someError))
        .catch(() => 'def')
        expect(p.error).to.be.undefined()
      })
      it('should pass the rejection error to the callback', () => {
        new PromiseOverride((resolve, reject) => reject(someError))
          .catch(error => {
            expect(error).to.equal(someError)
          })
      })
      it('should catch errors thrown in callback', () => {
        const p = new PromiseOverride((resolve, reject) => reject(someError))
        expect(() => p.catch(() => {
          throw new Error()
        })).to.not.throw()
      })
      it('should set internal error to value thrown', () => {
        const anotherError = new Error('MORE BAD STUF')
        const p = new PromiseOverride((resolve, reject) => reject(someError))
          .catch(() => {
            throw anotherError
          })
        expect(p.error).to.equal(anotherError)
      })
      it('return the promise', () => {
        const p = new PromiseOverride((resolve, reject) => reject(someError))
        const result = p.catch(() => 'def')
        expect(result).to.equal(p)
      })
    })

    describe('if there has not been an error/rejection', () => {
      it('should do nothing', () => {
        const p = new PromiseOverride(resolve => resolve('abc'))
          .catch(() => 'def')
        expect(p.resolution).to.equal('abc')
      })
    })

    describe('nested PromiseOverrides', () => {
      it('should resolve with the deepest resolve value', () => {
        const p = new PromiseOverride((resolve, reject) => reject(new Error()))
        p.catch(() => new PromiseOverride(resolve => {
          resolve('abc')
        }))
        expect(p.resolution).to.equal('abc')
      })

      it('should reject with the deepest error', () => {
        const firstError = new Error('BAD STUFF 1')
        const secondError = new Error('BAD STUFF 2')
        const p = new PromiseOverride((resolve, reject) => reject(firstError))
        p.catch(data => {
          return new PromiseOverride((resolve, reject) => reject(secondError))
        })
        expect(p.error).to.equal(secondError)
      })
    })
  })

  describe('PromiseOverride.resolve class method', () => {
    it('should return a thenable', () => {
      expect(PromiseOverride.resolve(123).then).to.exist()
    })

    it('should resolve with the passed value', () => {
      PromiseOverride.resolve(123).then(resolution => expect(resolution).to.equal(123))
    })
  })

  describe('PromiseOverride.all class method', () => {
    it('should return a thenable', () => {
      expect(PromiseOverride.all([123, 456]).then).to.exist()
    })

    it('should resolve with the passed value', () => {
      PromiseOverride.all([123, 456]).then(resolution => expect(resolution).to.deep.equal([123, 456]))
    })
  })
})
