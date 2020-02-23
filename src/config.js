// config.js is the heart of the dependency injection we use.  It is in this
// file that we piece together the actual runtime values.  This file breathes
// the breath of life into the otherwise hollow shell of the rest of the
// system.

const createHomeApplication = require('./home-application')
const createPostgresClient = require('./postgres-client')
const createMessageStore = require('./message-store')
const createTranscribeComponent = require('./transcribe-component')

// Even the configuration has a dependency, namely the run-time environment.
function createConfig ({ env }) {
  // We build a Postgres client connection
  const postgresClient = createPostgresClient({
    connectionString: env.messageStoreConnectionString
  })
  // The message store code receives that client connection.  This way, if we
  // want to do something else with that same connection, we can.  It's Just
  // Postgres™.
  const messageStore = createMessageStore({ db: postgresClient })

  // Applications
  const homeApplication = createHomeApplication()

  // Components
  const transcribeComponent = createTranscribeComponent()

  // Aggregators
  // When we get aggregators, they'll go here

  const consumers = [transcribeComponent]

  return {
    consumers,
    env,
    homeApplication,
    messageStore,
    transcribeComponent
  }
}

module.exports = createConfig
