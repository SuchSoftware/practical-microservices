const createConfig = require('../src/config')
const env = require('../src/env')

const config = createConfig({ env })

module.exports = { config }
