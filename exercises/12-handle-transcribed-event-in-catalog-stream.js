const uuid = require('uuid/v4')

const { config } = require('./preamble')
const StartedControls = require('../src/catalog-component/controls/events/started')
const TranscribedControls = require('../src/catalog-component/controls/events/transcribed')

const traceId = uuid()
const videoId = uuid()
const streamName = `catalog-${videoId}`

const started = StartedControls.example()
started.metadata.traceId = traceId
started.streamName = streamName

const transcribed = TranscribedControls.example()
transcribed.metadata.traceId = traceId
transcribed.streamName = streamName

// Run this immediately.  It will go boom.  In this exercise, you're going to
// fill out the whole handler, including defining it in the handlers object.
// That happens in `src/catalog-component/index.js`.
//
// For this exercise we need precursor events to actually be in the
// Message Store
config.messageStore
  .write(streamName, started)
  .then(() => config.catalogComponent.eventHandlers.Transcribed(transcribed))
  .then(() => config.catalogComponent.eventHandlers.Transcribed(transcribed))
  .then(() => console.log('Transcribed processed.'))
  .finally(config.messageStore.stop)
