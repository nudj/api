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
