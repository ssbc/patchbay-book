const nest = require('depnest')
const { h, Value } = require('mutant')
const { isBook } = require('ssb-book-schema')
const Scuttle = require('scuttle-book')
const ScuttleBlob = require('scuttle-blob')
const Show = require('../../../../views/show')
const Edit = require('../../../../views/edit')

exports.gives = nest('message.html.layout')

exports.needs = nest({
  'app.sync.goTo': 'first',
  'app.html.modal': 'first',
  'about.html.avatar': 'first',
  'about.obs.name': 'first',
  'about.pull.updates': 'first',
  'message.html.backlinks': 'first',
  'message.html.markdown': 'first',
  'message.html.timestamp': 'first',
  'blob.sync.url': 'first',
  'sbot.obs.connection': 'first',
  'keys.sync.id': 'first',
  'about.async.suggest': 'first',
  'channel.async.suggest': 'first',
  'emoji.async.suggest': 'first'
})

exports.create = (api) => {
  return nest('message.html.layout', bookLayout)

  function bookLayout (msg, opts = {}) {
    if (opts.layout !== 'show') return
    if (!isBook(msg)) return

    const scuttle = Scuttle(api.sbot.obs.connection)
    let afterEditPublish = { cb: null }

    // editing modal
    const isOpen = Value(false)
    const form = Edit({
      book: msg.key,
      scuttle,
      scuttleBlob: ScuttleBlob(api.sbot.obs.connection),
      blobUrl: api.blob.sync.url,
      onCancel: () => isOpen.set(false),
      afterPublish: (msg) => {
        isOpen.set(false)

        if (afterEditPublish.cb) afterEditPublish.cb()
      }
    })
    
    const modal = api.app.html.modal(form, { isOpen })
    const editBtn = h('i.fa.fa-pencil', { 'ev-click': () => isOpen.set(true) })

    function suggester(text, cb) {
      const char = text[0]
      const wordFragment = text.slice(1)

      if (char === '@') cb(null, api.about.async.suggest(wordFragment, cb))
      if (char === '#') cb(null, api.channel.async.suggest(wordFragment, cb))
      if (char === ':') cb(null, api.emoji.async.suggest(wordFragment, cb))
    }

    const show = Show({
      myKey: api.keys.sync.id(),
      book: msg,
      scuttle,
      blobUrl: api.blob.sync.url,
      avatar: api.about.html.avatar,
      name: api.about.obs.name,
      markdown: api.message.html.markdown,
      timestamp: api.message.html.timestamp,
      suggester,
      modal: api.app.html.modal,
      editBtn,
      afterEditPublish,
      goTo: api.app.sync.goTo
    })

    return h('Message -book-show', [
      modal,
      show,
      api.message.html.backlinks(msg)
    ])
  }
}
