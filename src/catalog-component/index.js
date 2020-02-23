const uuid = require('uuid/v4')

const projection = require('./projection')

// This component has 4 sets of handlers:
// 1. Its command stream
// 2. Its event stream
// 3. transcode's event stream
// 4. transcribe's event stream
function createCommandHandlers ({ messageStore }) {
  return {
    async Catalog (catalog) {
      const videoId = catalog.data.videoId
      const videoStreamName = `catalog-${videoId}`
      const video = await messageStore.fetch(videoStreamName, projection)

      if (video.isStarted) {
        console.log(`(${catalog.id}) Video already started. Skipping`)

        return true
      }

      const started = {
        id: uuid(),
        type: 'Started',
        metadata: {
          traceId: catalog.metadata.traceId
        },
        data: {
          videoId: catalog.data.videoId,
          uri: catalog.data.uri
        }
      }

      return messageStore.write(videoStreamName, started)
    }
  }
}

function createEventHandlers ({ messageStore }) {
  return {
    async Started (started) {
      // This is where we'll kick off the transcoding

      // TODO: 1. Load the entity

      // TODO: 2. Make the handler idempotent.  Which value from the projection
      // would tell us we don't need to transcode the file?

      // TODO: 3. Write a Transcode command for the transcode component
      //   - Generate a new UUID as the id for the transcode command stream name
      //   - Set the originStreamName in metadata

      return true
    }
  }
}

function createComponent ({ messageStore }) {
  const commandHandlers = createCommandHandlers({ messageStore })
  const eventHandlers = createEventHandlers({ messageStore })

  const commandSubscription = messageStore.createSubscription({
    streamName: 'catalog:command',
    handlers: commandHandlers,
    subscriberId: 'catalogCommandConsumer'
  })

  const eventSubscription = messageStore.createSubscription({
    streamName: 'catalog',
    handlers: eventHandlers,
    subscriberId: 'catalogEventConsumer'
  })

  function start () {
    console.log('Starting video catalog component')

    commandSubscription.start()
    eventSubscription.start()
  }

  return {
    commandHandlers,
    eventHandlers,
    start
  }
}

module.exports = createComponent
