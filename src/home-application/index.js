const express = require('express')

// This doesn't receive any state right now, but it will in later steps
function createHandlers () {
  return {
    getHomePage (req, res, next) {
      res.render('home-application/templates/home', {})
    }
  }
}

// Autonomous components, applications, and pretty much everything else in the
// system all provide a top-level function that receives whatever dependencies
// the exporting subsystem requires.  In this step, this application has no
// dependencies.
function createApplication () {
  const handlers = createHandlers()

  // Each Application builds an Express router and exposes it to whatever is
  // instantiating it.
  const router = express.Router()

  // It sets up its own internal routes.
  router.route('/').get(handlers.getHomePage)

  return {
    handlers,
    router
  }
}

module.exports = createApplication
