const dedent = require('dedent')
const mockGmailThread = {
  messages: [
    {
      id: 'MESSAGE_1',
      internalDate: '1515758519000',
      payload: {
        mimeType: 'text/html',
        headers: [
          {
            name: 'Subject',
            value: 'Seen my spaceship?'
          },
          {
            name: 'To',
            value: 'woody@andysroom.com'
          },
          {
            name: 'From',
            value: 'Buzz Lightyear <buzz@spacecommand.com>'
          }
        ],
        body: {
          size: 243,
          data: 'V2hlcmUncyBteSBzcGFjZXNoaXA/IFNwYWNlIGNvbW1hbmQgbmVlZHMgbWUu'
        }
      },
      sizeEstimate: 660
    },
    {
      id: 'MESSAGE_2',
      internalDate: '1515758631000',
      payload: {
        headers: [
          {
            name: 'Delivered-To',
            value: 'timmyrobby@gmail.com'
          },
          {
            name: 'To',
            value: 'Woody <woody@andysroom.com>'
          },
          {
            name: 'Subject',
            value: 'Seen my spaceship?'
          },
          {
            name: 'From',
            value: 'Buzz Lightyear <buzz@spacecommand.com>'
          }
        ],
        body: {
          size: 0
        },
        parts: [
          {
            partId: '0',
            mimeType: 'text/plain',
            body: {
              size: 350,
              data: 'WW91LiBBcmUuIEEuIFRveSE='
            }
          },
          {
            partId: '1',
            mimeType: 'text/html',
            body: {
              size: 702,
              data: 'WW91PGRpdj5BcmU8ZGl2PkE8ZGl2PlRveSE8L2Rpdj48L2Rpdj48L2Rpdj4='
            }
          }
        ]
      },
      sizeEstimate: 6044
    },
    {
      id: 'MESSAGE_3',
      internalDate: '1515847314000',
      payload: {
        mimeType: 'multipart/alternative',
        headers: [
          {
            name: 'From',
            value: 'Woody <woody@andysroom.com>'
          },
          {
            name: 'Subject',
            value: 'Re: Seen my spaceship?'
          },
          {
            name: 'To',
            value: 'Buzz Lightyear <buzz@spacecommand.com>'
          }
        ],
        body: {
          size: 0
        },
        parts: [
          {
            partId: '0',
            mimeType: 'text/plain',
            body: {
              size: 955,
              data: 'RmluZSwgaXQncyBkb3duc3RhaXJzLg=='
            }
          },
          {
            partId: '1',
            mimeType: 'text/html',
            body: {
              size: 1735,
              data: 'RmluZTxkaXY+PGJyPjwvZGl2PjxkaXY+SXQncyBkb3duc3RhaXJzPGRpdj5QUy4gWW91IGFyZSBhIHRveS48L2Rpdj48L2Rpdj4='
            }
          }
        ]
      },
      sizeEstimate: 7834
    }
  ]
}

const largeMockMessageThread = {
  realMessage: `
    Hi Gavin,<div><br></div><div>I&#39;m perfectly acquiesced to your proposal
    concerning accepting and understanding jobs and hitherto therein.
    Furthermore, with my mumbo jumbo ad nauseam, I am quite pleased with our
    splendiferous and fortuitous agreement.<div><br></div><div>However, it has
    come to my attention that you are lacking in a certain subset of desirable
    enigmatic properties that are specific to my gracious request.<div><br></div>
    <div>Therefore, I must conclude that you are unfit for the role.
    Lols.<div><br></div><div>Yours,<div>Gavin. CEO.</div></div></div></div></div>
  `,
  messages: [
    {
      id: 'MESSAGE_1',
      internalDate: '1515758519000',
      payload: {
        mimeType: 'text/html',
        headers: [
          {
            name: 'Subject',
            value: 'RE: Extravagant Proposal'
          },
          {
            name: 'To',
            value: 'woody@andysroom.com'
          },
          {
            name: 'From',
            value: 'Buzz Lightyear <buzz@spacecommand.com>'
          }
        ],
        body: {
          size: 243,
          data: dedent`
            SGkgR2F2aW4sPGRpdj48YnI+PC9kaXY+PGRpdj5JJiMzOTttIHBlcmZlY3RseSBhY3F
            1aWVzY2VkIHRvIHlvdXIgcHJvcG9zYWwgY29uY2VybmluZyBhY2NlcHRpbmcgYW5kIH
            VuZGVyc3RhbmRpbmcgam9icyBhbmQgaGl0aGVydG8gdGhlcmVpbi4gIEZ1cnRoZXJtb
            3JlLCB3aXRoIG15IG11bWJvIGp1bWJvIGFkIG5hdXNlYW0sIEkgYW0gcXVpdGUgcGxl
            YXNlZCB3aXRoIG91ciBzcGxlbmRpZmVyb3VzIGFuZCBmb3J0dWl0b3VzIGFncmVlbWV
            udC48ZGl2Pjxicj48L2Rpdj48ZGl2Pkhvd2V2ZXIsIGl0IGhhcyBjb21lIHRvIG15IG
            F0dGVudGlvbiB0aGF0IHlvdSBhcmUgbGFja2luZyBpbiBhIGNlcnRhaW4gc3Vic2V0I
            G9mIGRlc2lyYWJsZSBlbmlnbWF0aWMgcHJvcGVydGllcyB0aGF0IGFyZSBzcGVjaWZp
            YyB0byBteSBncmFjaW91cyByZXF1ZXN0LjxkaXY+PGJyPjwvZGl2PjxkaXY+VGhlcmV
            mb3JlLCBJIG11c3QgY29uY2x1ZGUgdGhhdCB5b3UgYXJlIHVuZml0IGZvciB0aGUgcm
            9sZS4gIExvbHMuPGRpdj48YnI+PC9kaXY+PGRpdj5Zb3Vycyw8ZGl2PkdhdmluLiBDR
            U8uPC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+
          `
        }
      },
      sizeEstimate: 660
    }
  ]
}

module.exports = { mockGmailThread, largeMockMessageThread }
