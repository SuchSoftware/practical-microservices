const uuid = require('uuid/v4')

const { config } = require('./preamble')

const videoId = uuid()
const transcribeId = uuid()
const transcribe = {
  id: uuid(),
  type: 'Transcribe',
  metadata: {
    traceId: uuid(),
    originStreamName: `catalog-${videoId}`
  },
  data: {
    transcribeId,
    uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}

config.transcribeComponent.handlers
  .Transcribe(transcribe)
  // Notice that we call the handler a second time
  .then(() => config.transcribeComponent.handlers.Transcribe(transcribe))
  .then(() => console.log('Video transcribed.  Inspect message store.'))
  .finally(config.messageStore.stop)
