const uuid = require('uuid/v4')

const { config } = require('./preamble')
const StartedControls = require('../src/catalog-component/controls/events/started')
const TranscodedControls = require('../src/catalog-component/controls/events/transcoded')

const traceId = uuid()
const videoId = uuid()
const streamName = `catalog-${videoId}`

const started = StartedControls.example()
started.metadata.traceId = traceId
started.streamName = streamName

const transcoded = TranscodedControls.example()
transcoded.metadata.traceId = traceId
transcoded.data.videoId = started.data.videoId
transcoded.data.uri = started.data.uri
transcoded.streamName = streamName

// TODO: Run this immediately.  **IT WILL GO BOOM**.  In this exercise, you're going
// to fill out the whole handler, including defining it in the handlers object.
// That happens in `src/catalog-component/index.js`.
//
// For this exercise we need precursor events to actually be in the
// Message Store
config.messageStore
  .write(streamName, started)
  .then(() => config.catalogComponent.eventHandlers.Transcoded(transcoded))
  .then(() => config.catalogComponent.eventHandlers.Transcoded(transcoded))
  .then(() => {
    console.log('Transcoded processed.')
    console.log('How many `Transcribe` commands are in the Message Store?')
    console.log('Is that a problem?')
  })
  .catch(err => console.log(err))
  .finally(config.messageStore.stop)
