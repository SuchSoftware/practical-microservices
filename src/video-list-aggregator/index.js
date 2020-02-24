const projection = require('./projection')

function createHandlers ({ messageStore, queries }) {
  return {
    async Cataloged (cataloged) {
      const video = await messageStore.fetch(cataloged.streamName, projection)
      const listItem = {
        id: video.id,
        uri: video.uri,
        name: video.name,
        transcription: video.transcription
      }

      return queries.upsertVideo(listItem)
    }
  }
}

function createQueries ({ db }) {
  return {
    upsertVideo (video) {
      const rawQuery = `
        INSERT INTO
          videos (id, name, uri, transcription)
        VALUES (:id, :name, :uri, :transcription)
        ON CONFLICT (id) DO NOTHING
      `

      return db.then(client => client.raw(rawQuery, video))
    }
  }
}

function createComponent ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ messageStore, queries })

  const subscription = messageStore.createSubscription({
    streamName: 'catalog',
    handlers,
    subscriberId: 'videoListAggregator'
  })

  function start () {
    console.log('Starting video list aggregator')

    subscription.start()
  }

  return {
    start
  }
}

module.exports = createComponent
