const uuid = require('uuid/v4')

const { config } = require('./preamble')
const StartedControls = require('../src/catalog-component/controls/events/started')

const started = StartedControls.example()
started.metadata.traceId = uuid()

config.catalogComponent.eventHandlers
  .Started(started)
  .then(() => config.catalogComponent.eventHandlers.Started(started))
  .then(() => {
    console.log('Started processed.')
    console.log('How many `Transcode` commands are in the Message Store?')
    console.log('Is that a problem?')
  })
  .finally(config.messageStore.stop)
