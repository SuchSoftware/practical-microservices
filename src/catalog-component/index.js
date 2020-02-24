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
    },

    async Transcoded (transcoded) {
      const streamName = transcoded.streamName
      const video = await messageStore.fetch(streamName, projection)

      if (video.isTranscribed) {
        console.log(`(${transcoded.id}) Video already transcribed. Skipping`)

        return true
      }

      const transcribe = {
        id: uuid(),
        type: 'Transcribe',
        metadata: {
          traceId: transcoded.metadata.traceId,
          originStreamName: streamName
        },
        data: {
          transcribeId: uuid(),
          uri: video.uri
        }
      }

      return messageStore.write(`transcribe:command-${video.id}`, transcribe)
    },

    async Transcribed (transcribed) {
      const streamName = transcribed.streamName
      const video = await messageStore.fetch(streamName, projection)

      if (video.isCataloged) {
        console.log(`(${transcribed.id}) Video already cataloged. Skipping`)

        return true
      }

      const cataloged = {
        id: uuid(),
        type: 'Cataloged',
        metadata: {
          traceId: transcribed.metadata.traceId
        },
        data: {
          videoId: video.id
        }
      }

      return messageStore.write(streamName, cataloged)
    }
  }
}

function createTranscodeEventHandlers ({ messageStore }) {
  return {
    async Transcoded (transcoded) {
      const streamName = transcoded.metadata.originStreamName
      const video = await messageStore.fetch(streamName, projection)

      if (video.isTranscoded) {
        console.log(`(${transcoded.id}) Video already transcoded. Skipping`)

        return true
      }

      const videoTranscoded = {
        id: uuid(),
        type: 'Transcoded',
        metadata: {
          traceId: transcoded.metadata.traceId
        },
        data: {
          videoId: video.id,
          transcodeId: transcoded.data.transcodeId,
          uri: transcoded.data.uri,
          transcodedUri: transcoded.data.transcodedUri
        }
      }

      return messageStore.write(streamName, videoTranscoded)
    }
  }
}

function createTranscribeEventHandlers ({ messageStore }) {
  return {
    async Transcribed (transcribed) {
      const streamName = transcribed.metadata.originStreamName
      const video = await messageStore.fetch(streamName, projection)

      if (video.isTranscribed) {
        console.log(`(${transcribed.id}) Video already transcribed. Skipping`)

        return true
      }

      const videoTranscribed = {
        id: uuid(),
        type: 'Transcribed',
        metadata: {
          traceId: transcribed.metadata.traceId
        },
        data: {
          videoId: video.id,
          transcribeId: transcribed.data.transcribeId,
          uri: transcribed.data.uri,
          transcription: transcribed.data.transcription
        }
      }

      return messageStore.write(streamName, videoTranscribed)
    }
  }
}

function createComponent ({ messageStore }) {
  const commandHandlers = createCommandHandlers({ messageStore })
  const eventHandlers = createEventHandlers({ messageStore })
  const transcodeEventHandlers = createTranscodeEventHandlers({ messageStore })
  const transcribeEventHandlers = createTranscribeEventHandlers({
    messageStore
  })

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

  const transcribeEventSubscription = messageStore.createSubscription({
    streamName: 'transcribe',
    handlers: transcribeEventHandlers,
    originStreamName: 'catalog',
    subscriberId: 'catalogTranscribeEventConsumer'
  })

  function start () {
    console.log('Starting video catalog component')

    commandSubscription.start()
    eventSubscription.start()
    transcodeEventSubscription.start()
    transcribeEventSubscription.start()
  }

  return {
    commandHandlers,
    eventHandlers,
    start,
    transcodeEventHandlers,
    transcribeEventHandlers
  }
}

module.exports = createComponent
