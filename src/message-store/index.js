// START: subscriptions
const createRead = require('./read')
const configureCreateSubscription = require('./subscribe')
// ...
// END: subscriptions
// END: fetch
// START: write
const createWrite = require('./write')
// END: write
const VersionConflictError = require('./version-conflict-error')

// START: fetch
// START: subscriptions
// START: write
function createMessageStore ({ db }) {
  // END: write
  // ...
  // END: subscriptions
  // END: fetch
  // START: write
  const write = createWrite({ db })
  // END: write
  // START: subscriptions
  const read = createRead({ db })
  const createSubscription = configureCreateSubscription({
    read: read.read,
    readLastMessage: read.readLastMessage,
    write: write
  })
  // END: subscriptions

  // START: subscriptions
  // START: fetch
  // START: write
  return {
    // END: fetch
    // END: write
    // END: subscriptions
    // START: write
    write: write,
    // END: write
    // START: subscriptions
    // ...
    createSubscription,
    read: read.read,
    readLastMessage: read.readLastMessage,
    // END: subscriptions
    // START: fetch
    // ...
    // START_HIGHLIGHT
    fetch: read.fetch,
    // END_HIGHLIGHT
    // END: fetch
    stop: db.stop
    // START: subscriptions
    // START: fetch
  }
}
// END: subscriptions
// END: fetch

module.exports = exports = createMessageStore
// END: write
exports.project = createRead.project
exports.VersionConflictError = VersionConflictError
