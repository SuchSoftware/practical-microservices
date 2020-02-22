// This script will verify that you have node and docker installed and running
// properly.

const uuid = require('uuid/v4')

const createConfig = require('../src/config')
const env = require('../src/env')

const config = createConfig({ env })

const messageId = uuid()
const verifiedTime = new Date()
const verified = {
  id: messageId,
  type: 'InstallationVerified',
  data: {
    verified: verifiedTime.toISOString()
  }
}
const streamName = `verification-${uuid()}`

config.messageStore
  .write(streamName, verified)
  .then(() => console.log(`Wrote message: ${messageId}`))
  .then(() => config.messageStore.readLastMessage(streamName))
  .then(readMessage => {
    const prettyMessage = JSON.stringify(readMessage, null, 2)

    console.log(`Read back: ${prettyMessage}`)
  })
  .catch(e => {
    if (e.message.includes('ECONNREFUSED')) {
      console.error(
        'Unable to connect to message store database.  Did you run `docker-compose rm -sf && docker-compose up`?'
      )
    } else {
      console.log(e)
      console.error(`
        Verification failed for an unknown reason.

        1. Did you run \`npm install\`?
        2. Did you install Docker?
      `)
    }
  })
  .finally(config.messageStore.stop)
