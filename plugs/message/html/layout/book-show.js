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
  'keys.sync.id': 'first'
})

exports.create = (api) => {
  return nest('message.html.layout', bookLayout)

  function bookLayout (msg, opts = {}) {
    if (opts.layout !== 'show') return
    if (!isBook(msg)) return

    // editing modal
    const isOpen = Value(false)
    const form = Edit({
      book: msg.key,
      scuttle: Scuttle(api.sbot.obs.connection),
      scuttleBlob: ScuttleBlob(api.sbot.obs.connection),
      blobUrl: api.blob.sync.url,
      onCancel: () => isOpen.set(false),
      afterPublish: (msg) => {
        isOpen.set(false)
      }
    })
    
    const modal = api.app.html.modal(form, { isOpen })
    const editBtn = h('i.fa.fa-pencil', { 'ev-click': () => isOpen.set(true) })

    const show = Show({
      myKey: api.keys.sync.id(),
      book: msg,
      scuttle: Scuttle(api.sbot.obs.connection),
      blobUrl: api.blob.sync.url,
      avatar: api.about.html.avatar,
      name: api.about.obs.name,
      markdown: api.message.html.markdown,
      editBtn,
      goTo: api.app.sync.goTo
    })

    return h('Message -book-show', [
      modal,
      show,
      api.message.html.backlinks(msg)
    ])
  }
}
