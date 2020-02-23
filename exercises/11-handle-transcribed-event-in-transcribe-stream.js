const uuid = require('uuid/v4')

const { config } = require('./preamble')
const TranscribedControls = require('../src/transcribe-component/controls/events/transcribed')

const traceId = uuid()
const videoId = uuid()

const transcribed = TranscribedControls.example()
transcribed.metadata.traceId = traceId
transcribed.metadata.originStreamName = `catalog-${videoId}`
transcribed.streamName = `transcribe-${transcribed.data.videoId}`

// Run this immediately.  It will go boom.  In this exercise, you're going to
// fill out the whole handler, including defining it in the handlers object.
// That happens in `src/catalog-component/index.js`.
//
// For this exercise we need precursor events to actually be in the
// Message Store
config.catalogComponent.transcribeEventHandlers
  .Transcribed(transcribed)
  .then(() =>
    config.catalogComponent.transcribeEventHandlers.Transcribed(transcribed)
  )
  .then(() => console.log('Transcribed processed.'))
  .catch(err => console.log(err))
  .finally(config.messageStore.stop)
