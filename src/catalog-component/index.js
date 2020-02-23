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
      const videoId = started.data.videoId
      const streamName = `catalog-${videoId}`
      const video = await messageStore.fetch(streamName, projection)

      if (video.isTranscoded) {
        console.log(`(${started.id}) Video already transcoded. Skipping`)

        return true
      }

      const transcodeId = uuid()

      const transcode = {
        id: uuid(),
        type: 'Transcode',
        metadata: {
          traceId: started.metadata.traceId,
          originStreamName: streamName
        },
        data: {
          transcodeId,
          uri: started.data.uri
        }
      }
      const commandStream = `transcode:command-${transcodeId}`

      return messageStore.write(commandStream, transcode)
    }
  }
}

function createTranscodeEventHandlers ({ messageStore }) {
  return {
    async Transcoded (transcoded) {
      // TODO 1. Fetch the entity and make the handler idempotent
      //   - The`transcoded` event that we get here was written to a
      //     `transcode` stream and not to a `catalog` stream.
      //   - Where can we find the streamName for the video entity?
      //   - Look at exercises/08-handle-transcoded-event-caused-by-catalog.js
      //     for inspiration.  Look at the event we build there.
      const streamName = 'where do I get the `catalog` stream name?'

      // TODO: 2. Make the handle idempotent.  What property on the video
      // entity tells us if the video has been transcoded?

      // TODO: 3. Write a Transcoded event to our `catalog` stream to drive
      // the process forward.

      return true
    }
  }
}

function createComponent ({ messageStore }) {
  const commandHandlers = createCommandHandlers({ messageStore })
  const eventHandlers = createEventHandlers({ messageStore })
  const transcodeEventHandlers = createTranscodeEventHandlers({ messageStore })

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

  const transcodeEventSubscription = messageStore.createSubscription({
    streamName: 'transcode',
    handlers: transcodeEventHandlers,
    originStreamName: 'catalog',
    subscriberId: 'catalogTranscodeEventConsumer'
  })

  function start () {
    console.log('Starting video catalog component')

    commandSubscription.start()
    eventSubscription.start()
    transcodeEventSubscription.start()
  }

  return {
    commandHandlers,
    eventHandlers,
    start,
    transcodeEventHandlers
  }
}

module.exports = createComponent
