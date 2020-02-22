/**
 * @description The Message Store is a PostgreSQL database, and idiomatic RDBMSs
 * tend to use snake_casing.  Also, `position` and `global_position` come back
 * as strings, and we need them as numbers.  This function deals with that.
 */
// START: noComment
function deserializeMessage (rawMessage) {
  if (!rawMessage) {
    return null
  }

  return {
    id: rawMessage.id,
    streamName: rawMessage.stream_name,
    type: rawMessage.type,
    position: parseInt(rawMessage.position, 10),
    globalPosition: parseInt(rawMessage.global_position, 10),
    data: rawMessage.data ? JSON.parse(rawMessage.data) : {},
    metadata: rawMessage.metadata ? JSON.parse(rawMessage.metadata) : {},
    time: rawMessage.time
  }
}

module.exports = deserializeMessage
// END: noComment
