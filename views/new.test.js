// run:
// $ npx electro views/new.test.js

const h = require('mutant/h')

const View = require('./new')
require('../lib/styles-inject')()

const view = View({
  scuttle: {
    post: (opts, cb) => {
      console.log('publishing', opts)
      cb(null, opts)
    }
  },
  initialState: {}
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
