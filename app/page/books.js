const nest = require('depnest')
const pull = require('pull-stream')
const { h, Array } = require('mutant')
const Scroller = require('pull-scroll')

exports.gives = nest({
  'app.html.menuItem': true,
  'app.page.books': true
})

exports.needs = nest({
  'about.obs.latestValue': 'first',
  'app.html.scroller': 'first',
  'book.pull.getAll': 'first',
  'book.html': {
    create: 'first',
    render: 'first'
  }
})

exports.create = function (api) {
  return nest({
    'app.html.menuItem': menuItem,
    'app.page.books': booksPage
  })

  function menuItem (handleClick) {
    return h('a', {
      style: { order: 5 },
      'ev-click': () => handleClick({ page: 'books' })
    }, '/books')
  }

  function booksPage (path) {
    const creator = api.book.html.create({})
    const { container, content } = api.app.html.scroller({prepend: [creator]})

    if (path.query) {
      const [ qkey, qvalue ] = path.query.split("=")

      pull(
        api.book.pull.getAll(),
        pull.filter(msg => msg.key),
        pull.filter((msg) => {
          let originalValue = msg.value.content[qkey]
          let latestAbout = api.about.obs.latestValue(msg.key, qkey)()
          return (latestAbout || originalValue) == qvalue
        }),
        Scroller(container, content, api.book.html.render, true, true)
      )
    } else {
      pull(
        api.book.pull.getAll(),
        Scroller(container, content, api.book.html.render, true, true)
      )
    }

    container.title = '/books'
    return container
  }
}
