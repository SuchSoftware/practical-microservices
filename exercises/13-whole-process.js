// This exercise expects the server to be running.
// You can start that with `npm start`.

const uuid = require('uuid/v4')

const { config } = require('./preamble')

const catalog = {
  id: uuid(),
  type: 'Catalog',
  metdata: {
    traceId: uuid()
  },
  data: {
    videoId: uuid(),
    uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    name: '42 Wealth Secrets Explained'
  }
}

const commandStreamName = `catalog:command-${catalog.data.videoId}`

config.messageStore
  .write(commandStreamName, catalog)
  .finally(config.messageStore.stop)
