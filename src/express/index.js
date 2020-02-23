/*
The application layer of the system uses [express](https://expressjs.com/) to
handle routing HTTP requests.  This file sets up the express application.
*/

const express = require('express')
const { join } = require('path')
const uuid = require('uuid/v4')

// Attaches the request context to `res.locals`, which will make that context
// available when we're rendering Pug templates.
function attachLocals (req, res, next) {
  res.locals.context = req.context
  next()
}

// There are certain values we want to generate and attach to each HTTP request
// that we get.  For now, we add a `traceId` to each request.  Later in the
// workshop, we'll use this `traceId` to tie related messages together all
// across the system.  This is a fairly useful debugging tool.
function primeRequestContext (req, res, next) {
  req.context = {
    traceId: uuid()
  }

  next()
}

function createExpressApp ({ config, env }) {
  const app = express()

  // Configure PUG
  app.set('views', join(__dirname, '..'))
  app.set('view engine', 'pug')

  app.use(primeRequestContext)
  app.use(attachLocals)
  app.use(express.static(join(__dirname, '..', 'public'), { maxAge: 86400000 }))

  // Here's where we use that `homeApplication` we instantiated in
  // `src/config.js`.
  app.use('/', config.homeApplication.router)

  return app
}

module.exports = createExpressApp
