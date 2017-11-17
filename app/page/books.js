const nest = require('depnest')
const pull = require('pull-stream')
const { h, Set, map } = require('mutant')
const Scroller = require('pull-scroll')

exports.gives = nest({
  'app.html.menuItem': true,
  'app.page.books': true
})

exports.needs = nest({
  'about.obs.latestValue': 'first',
  'app.sync.goTo': 'first',
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

  function mapAuthors(authors)
  {
    return map(authors, a => {
      return h('li', h('a', { 'href': '#',
                              'ev-click': () => api.app.sync.goTo({
                                page: 'books',
                                query: 'authors=' + a
                              })
                            }, a))
    })
  }

  function booksPage (path) {
    const creator = api.book.html.create({})
    const scrollerContent = h('section.content')

    const authors = Set()
    const authorsSection = h('section.right',
                             ['Authors:', h('ul', mapAuthors(authors))])

    pull(
      api.book.pull.getAll(),
      pull.filter(msg => msg.key),
      pull.drain((msg) => {
        let originalValue = msg.value.content['authors']
        let latestAbout = api.about.obs.latestValue(msg.key, 'authors')()
        authors.add(latestAbout || originalValue)
      })
    )

    const content = h('div.books', [scrollerContent, authorsSection])

    const { container } = api.app.html.scroller({prepend: [creator], content: content})

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
        Scroller(container, scrollerContent, api.book.html.render, true, true)
      )

      container.title = '/books?' + path.query

    } else {
      pull(
        api.book.pull.getAll(),
        Scroller(container, scrollerContent, api.book.html.render, true, true)
      )

      container.title = '/books'
    }

    return container
  }
}
