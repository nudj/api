module.exports = {
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
          data: 'SGV5IEknbSBzZW5kaW5nIHlvdSBhbiBlbWFpbCB1c2luZyB0aGUgZ3FsIGFwaSBhbmQga'
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
            value: 'Woody <woody@andysroom.co>'
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
              data: 'UmVzcG9uZGluZyB0byB0aGlzIG'
            }
          },
          {
            partId: '1',
            mimeType: 'text/html',
            body: {
              size: 702,
              data: 'PGRpdiBkaXI9Imx0ciI-UmVzcG9uZGluZyB0byB0aGlzIG5vdzwvZGl2PjxkaXYs'
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
            value: 'Woody <woody@andysroom.co>'
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
              data: 'VGhpcyBpcyB0aGUgZmlyc3QgbGluZSB0aGF0'
            }
          },
          {
            partId: '1',
            mimeType: 'text/html',
            body: {
              size: 1735,
              data: 'PGRpdiBkaXI9Imx0ciI-VGhpcyBpcyB0aGUgZmlyc3QgbGluZSB0aG'
            }
          }
        ]
      },
      sizeEstimate: 7834
    }
  ]
}
