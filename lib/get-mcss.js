const readDir = require('read-directory')
const { join } = require('path')

const collection = readDir.sync(join(__dirname, '..'), {
  extensions: false,
  filter: '**/*.mcss',
  ignore: '**/node_modules/**'
})

module.exports = function mcss (soFar = {}) {
  soFar['patchbay-books'] = values(collection).reverse().join('\n\n')

  return soFar
}

function values (obj) {
  return Object.keys(obj)
    .map(key => obj[key])
}
