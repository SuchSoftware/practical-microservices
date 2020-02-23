// Handlers will do the actual work of handling messages.
// They are analogous to HTTP handlers, only the stimulus they respond to is
// one of the messages communicated over pub/sub.
//
// Fleshing out these handlers is the main activity of the workshop.
function createHandlers () {
  return {}
}

// This top-level function will receive dependencies in future steps
function createComponent () {
  // Components get new messages to process by polling the message store.
  // We decouple actually starting the component from the rest of its
  // definition.  Naturally, starting the polling cycle in test would proveo
  // problematic.
  //
  // The convention in this code base is that each component exposes a `start`
  // function that gets picked up in `src/index.js`.
  function start () {
    console.log('Starting transcribe component')
  }

  return {
    start
  }
}

module.exports = createComponent
