const compile = require('micro-css')
const getMCSS = require('./get-mcss')

module.exports = function getCSS () {
  return compile(values(getMCSS()).join('\n\n'))
}

function values (obj) {
  return Object.keys(obj)
    .map(key => obj[key])
}
