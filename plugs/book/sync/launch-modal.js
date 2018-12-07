const nest = require('depnest')
const { h, Value } = require('mutant')
const Scuttle = require('scuttle-book')
const ScuttleBlob = require('scuttle-blob')
const BookNew = require('../../../views/new')

exports.gives = nest({
  'book.sync.launchModal': true
})

exports.needs = nest({
  'about.async.suggest': 'first',
  'about.html.avatar': 'first',
  'app.html.modal': 'first',
  'app.sync.goTo': 'first',
  'blob.sync.url': 'first',
  'keys.sync.id': 'first',
  'sbot.obs.connection': 'first'
})

exports.create = function (api) {
  return nest({
    'gathering.sync.launchModal': GatheringLaunchModal
  })

  function GatheringLaunchModal (initialState, root) {
    // initialState: see /lib/form-state.js

    const isOpen = Value(false)
    const form = BookNew({
      initialState,
      myKey: api.keys.sync.id(),
      scuttle: Scuttle(api.sbot.obs.connection),
      scuttleBlob: ScuttleBlob(api.sbot.obs.connection),
      blobUrl: api.blob.sync.url,
      avatar: api.about.html.avatar,
      suggest: { about: api.about.async.suggest },
      onCancel: () => isOpen.set(false),
      afterPublish: (msg) => {
        isOpen.set(false)
        api.app.sync.goTo(msg)
      }
    })

    const modal = h('BookLaunchModal', [
      api.app.html.modal(form, { isOpen })
    ])
    isOpen(open => {
      if (open) root.appendChild(modal)
      else modal.remove()
    })

    isOpen.set(true)
    return true
  }
}
