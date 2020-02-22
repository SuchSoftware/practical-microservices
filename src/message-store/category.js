/**
 * @description Returns the category of the supplied `streamName`
 * @param {string} streamName The streamName from which to extract the category
 * @returns {string} The category of the supplied `streamName`
 */
// START: noComment
function category (streamName) {
  // Double equals to catch null and undefined
  if (streamName == null) {
    return ''
  }

  return streamName.split('-')[0]
}

module.exports = category
// END: noComment
