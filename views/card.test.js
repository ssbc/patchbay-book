// run:
// $ npx electro views/card.test.js

const h = require('mutant/h')

const View = require('./card')
require('../lib/styles-inject')()

const view = View({
  scuttle: {
    get: function(key, loadComments, cb) {
      cb(null, {
        key: key,
        common: {
          authors: "Andrew \"bunnie\" Huang",
          description: "Adventures in Making and Breaking Hardware",
          image: {
            link: "&EGCKE1IMfsyMnUAQnyxt+VeI5cgXAHZJQ2a91PEqIFY=.sha256",
            name: "HardwareHacker_cover.jpg",
            size: 91351,
            type: "image/jpeg"
          },
          title: "The Hardware Hacker"
        },
        reviews: {
          '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519': {
            comments: [],
            rating: "5",
            ratingMax: undefined,
            ratingType: ":space_invader:",
            review: "Ever wondering how electronics are produced in China? What gongkai is and how it is related to and different from open source. This is a book for that and much more. Highly recommended.",
            shelve: ""
          }
        }
      })
    }
  },
  book: {
    key: '%87slVbSlxTmuVFZ9NGY7+nMJQoKmpy0PvEtKY6THivQ=.sha256'
  },
  markdown: i => i,
  goTo: () => ''
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
