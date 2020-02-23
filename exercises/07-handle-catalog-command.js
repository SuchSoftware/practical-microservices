const uuid = require('uuid/v4')

const { config } = require('./preamble')
const CatalogControls = require('../src/catalog-component/controls/commands/catalog')

const catalog = CatalogControls.example()

config.catalogComponent.commandHandlers
  .Catalog(catalog)
  .then(() => config.catalogComponent.commandHandlers.Catalog(catalog))
  .then(() => console.log('Catalog process started.'))
  .catch(err => console.log(err))
  .finally(config.messageStore.stop)
