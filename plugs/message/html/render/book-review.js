const { h, Value, computed } = require('mutant')
const nest = require('depnest')
const { isBookUpdate } = require('ssb-book-schema')
const Scuttle = require('scuttle-book')

exports.needs = nest({
  'about.html.avatar': 'first',
  'app.sync.goTo': 'first',
  'message.html.author': 'first',
  'message.html.markdown': 'first',
  'message.html.meta': 'map',
  'message.html.timestamp': 'first',
  'sbot.obs.connection': 'first'
})

exports.gives = nest({
  'message.html.render': true
})

exports.create = function (api) {
  return nest({
    'message.html.render': renderBookReview
  })

  function renderBookReview(msg, { pageId } = {}) {
    if (!isBookUpdate(msg)) return

    let reviewLine = Value('')
    let ratingLine = Value('')
    
    const scuttle = Scuttle(api.sbot.obs.connection)
    scuttle.get(msg.value.content.updates, false, (err, book) => {
      if (err) throw err
      const { rating, ratingMax, ratingType, review, updates } = msg.value.content

      if (rating) {
        let t = 'Rated [' + book.common.title + '](' + updates + ') ' + rating
        if (ratingMax)
          t += ' / ' + ratingMax
        t += ' ' + ratingType
        ratingLine.set(t)
      }

      if (review)
        reviewLine.set('Review: ' + review)
    })

    var { author, timestamp, meta } = api.message.html

    var rawMessage = Value(null)

    var el = h('Message -default', {
      attributes: {
        tabindex: '0'
      }
    }, [ // needed to be able to navigate and show focus()
      h('section.left', [
        h('div.avatar', {}, api.about.html.avatar(msg.value.author)),
        h('div.author', {}, author(msg)),
        h('div.timestamp', {}, timestamp(msg))
      ]),
      h('section.body', [
        h('div.content', {}, computed([ratingLine, reviewLine], api.message.html.markdown)),
        h('div.raw-content', rawMessage)
      ]),
      h('section.right', [
        h('div.meta', {}, meta(msg, { rawMessage })),
      ]) 
    ])

    return el
  }
}
