const { h, Value, computed } = require('mutant')
const nest = require('depnest')
const { isBookComment } = require('ssb-book-schema')
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
    'message.html.render': renderBookComment
  })

  function renderBookComment(msg, { pageId } = {}) {
    if (!isBookComment(msg)) return

    let commentText = 'Wrote the following comment [on](' + msg.value.content.root + '):'

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
        h('div.content', {}, [h('div', computed(commentText, api.message.html.markdown)),
                              h('div', computed(msg.value.content.text, api.message.html.markdown))]),
        h('div.raw-content', rawMessage)
      ]),
      h('section.right', [
        h('div.meta', {}, meta(msg, { rawMessage })),
      ]) 
    ])

    return el
  }
}
