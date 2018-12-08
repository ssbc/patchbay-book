// run:
// $ npx electro views/edit.test.js

const h = require('mutant/h')

const View = require('./edit')
require('../lib/styles-inject')()

var request = 1

const view = View({
  book: '%someKey',
  scuttle: {
    put: (key, opts, cb) => {
      console.log('updating!', key, opts)
      cb(null, opts)
    },
    get: (key, cb) => {
      if (request === 1) {
        cb(null, {
          key: '%someKey',
          title: 'The dispossesed',
          authors: 'Ursula Le Guin'
        })
        request++
      } else {
        cb(null, {
          key: '%someKey',
          title: 'The dispossesed',
          authors: 'Ursula Le Guin'
        })
      }
    }
  },
  // afterPublish = console.log,
  onCancel: () => console.log('CANCELLED!')
})

document.body.appendChild(view)
document.head.appendChild(
  h('style', `
    body {
      --gradient: linear-gradient(45deg, hsla(0, 100%, 56%, .5), hsla(220, 100%, 46%, 0.3));
      --texture: left top 0 / 3px radial-gradient(white, #de82e6) repeat ;
      background: var(--texture), var(--gradient);
      background-blend-mode: darken;

      height: 100vh;
      padding: 2rem;
    }
  `)
)
