const Bluebird = require('bluebird')
const pg = require('pg')

function createDatabase ({ connectionString }) {
  const client = new pg.Client({ connectionString, Promise: Bluebird }) // <callout id="co.messageStore.db.connection" />

  let connectedClient = null // <callout id="co.messageStore.db.schema" />

  function connect () {
    if (!connectedClient) {
      connectedClient = client.connect()
        .then(() => client.query('SET search_path = message_store, public'))
        .then(() => client)
    }

    return connectedClient
  }

  function query (sql, values = []) { // <callout id="co.messageStore.db.query" />
    return connect()
      .then(client => client.query(sql, values))
  }

  return { // <callout id="co.messageStore.db.return" />
    query,
    stop: () => client.end()
  }
}

module.exports = createDatabase
