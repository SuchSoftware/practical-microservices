// START: messageStore.write.bones
const writeFunctionSql = 'SELECT message_store.write_message($1, $2, $3, $4, $5, $6)' // <callout id="co.messageStore.writeFunctionSql" />
// END: messageStore.write.bones
// START: versionConflict
const VersionConflictError = require('./version-conflict-error')
const versionConflictErrorRegex = /^Wrong.*Stream Version: (\d+)\)/
// END: versionConflict

// START: messageStore.write.bones
function createWrite ({ db }) { // <callout id="co.messageStore.write.createWrite" />
  return (streamName, message, expectedVersion) => { // <callout id="co.messageStore.write.write" />
    if (!message.type) { // <callout id="co.messageStore.write.type.check" />
      throw new Error('Messages must have a type')
    }

    const values = [ // <callout id="co.messageStore.write.values" />
      message.id,
      streamName,
      message.type,
      message.data,
      message.metadata,
      expectedVersion
    ]

    // START: occ
    return db.query(writeFunctionSql, values)
    // END: messageStore.write.bones
      .catch(err => {
        const errorMatch = err.message.match(versionConflictErrorRegex) // <callout id="co.messageStore.write.checkError" />
        const notVersionConflict = errorMatch === null

        if (notVersionConflict) {
          throw err
        }

        const actualVersion = parseInt(errorMatch[1], 10) // <callout id="co.messageStore.write.getActual" />

        const versionConflictError = new VersionConflictError( // <callout id="co.messageStore.write.instantiateError" />
          streamName,
          actualVersion,
          expectedVersion
        )
        versionConflictError.stack = err.stack

        throw versionConflictError
      })
      // END: occ
      // START: messageStore.write.bones
  }
}

module.exports = createWrite
// END: messageStore.write.bones
