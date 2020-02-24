const express = require('express')
const camelCaseKeys = require('camelcase-keys')
const uuid = require('uuid/v4')

// This doesn't receive any state right now, but it will in later steps
function createHandlers ({ messageStore, queries }) {
  return {
    async getHomePage (req, res) {
      const videos = await queries.allVideos()

      res.render('home-application/templates/home', { videos })
    },

    async showVideo (req, res) {
      const videoId = req.params.videoId
      const video = await queries.videoById(videoId)

      if (video) {
        res.render('home-application/templates/video', { video })
      } else {
        res.render('home-application/templates/interstitial', { videoId })
      }
    },

    async uploadVideo (req, res) {
      // 1. Generate an identifier for the video
      const videoId = uuid()
      // 2. Make a Catalog command
      const catalog = {
        id: uuid(),
        type: 'Catalog',
        metadata: {
          traceId: req.context.traceId
        },
        data: {
          videoId,
          uri: 'pulledFromRequestBody'
        }
      }
      // 3. Write that catalog command to the message store.  Notice this goes
      // to a command stream
      const streamName = `catalog:command-${videoId}`

      await messageStore.write(streamName, catalog)

      res.redirect(`/videos/${videoId}`)
    }
  }
}

function createQueries ({ db }) {
  return {
    allVideos () {
      return db.then(client => client('videos')).then(camelCaseKeys)
    },

    videoById (videoId) {
      return db
        .then(client => client('videos').where({ id: videoId }))
        .then(camelCaseKeys)
        .then(videos => videos[0])
    }
  }
}

// Autonomous components, applications, and pretty much everything else in the
// system all provide a top-level function that receives whatever dependencies
// the exporting subsystem requires.  In this step, this application has no
// dependencies.
function createApplication ({ db, messageStore }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ messageStore, queries })

  // Each Application builds an Express router and exposes it to whatever is
  // instantiating it.
  const router = express.Router()

  // It sets up its own internal routes.
  router.route('/').get(handlers.getHomePage)

  router.route('/videos/:videoId').get(handlers.showVideo)
  router.route('/videos').post(handlers.uploadVideo)

  return {
    handlers,
    router
  }
}

module.exports = createApplication
