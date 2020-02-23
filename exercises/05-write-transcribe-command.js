const uuid = require('uuid/v4')

const { config } = require('./preamble')

const transcribeId = uuid()
const transcribe = {
  id: uuid(),
  type: 'Transcribe',
  metadata: {
    traceId: uuid(),
    originStreamName: `catalog-${uuid()}`
  },
  data: {
    transcribeId,
    uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}
const commandStreamName = `transcribe:command-${transcribeId}`

return config.messageStore
  .write(commandStreamName, transcribe)
  .then(() => console.log('Written.  Run it!'))
  .catch(err => console.log(err))
  .finally(config.messageStore.stop)
