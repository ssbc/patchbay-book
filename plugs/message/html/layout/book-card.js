const nest = require('depnest')
const { h } = require('mutant')
const { isBook } = require('ssb-book-schema')
const Scuttle = require('scuttle-book')
const Card = require('../../../../views/card')

exports.gives = nest('message.html.layout')

exports.needs = nest({
  'about.html.avatar': 'first',
  'app.sync.goTo': 'first',
  'message.html.action': 'map',
  'message.html.timestamp': 'first',
  'blob.sync.url': 'first',
  'sbot.obs.connection': 'first'
})

exports.create = (api) => {
  return nest('message.html.layout', bookLayout)

  function bookLayout (msg, opts = {}) {
    if (!(opts.layout === undefined || opts.layout === 'card')) return
    if (!isBook(msg)) return

    const { action, timestamp } = api.message.html
    const card = Card({
      book: msg,
      scuttle: Scuttle(api.sbot.obs.connection),
      blobUrl: api.blob.sync.url
    })

    return h('Message -book-card', {
      'ev-click': () => api.app.sync.goTo(msg.key),
      attributes: { tabindex: '0' } // needed to be able to navigate and show focus()
    }, [
      h('section.avatar', api.about.html.avatar(msg.value.author)),
      h('section.top'),
      h('section.content', card),
      h('section.raw-content'), //, rawMessage),
      h('section.bottom', [
        h('div.timestamp', timestamp(msg)),
        h('div.actions', action(msg))
      ])
    ])
  }
}
