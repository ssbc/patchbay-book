const nest = require('depnest')
const pull = require('pull-stream')
const { h, Set, map, computed, onceTrue } = require('mutant')
const Scroller = require('pull-scroll')
const Books = require('scuttle-book/pull/books')

exports.gives = nest({
  'app.html.menuItem': true,
  'app.page.books': true
})

exports.needs = nest({
  'sbot.obs.connection': 'first',
  'app.sync.goTo': 'first',
  'app.html.scroller': 'first',
  'keys.sync.id': 'first',
  'message.html.render': 'first',
  'book.html.button': 'first', // create new
  'message.html.layout': 'first',
  'about.obs.name': 'first'
})

exports.create = function (api) {
  return nest({
    'app.html.menuItem': menuItem,
    'app.page.books': booksPage
  })

  function menuItem (handleClick) {
    return h('a', {
      style: { order: 0 },
      'ev-click': () => handleClick({ page: 'books' })
    }, '/books')
  }

  function queryLink(value)
  {
    if (value == "")
      return h('option', { selected: 'selected' })
    else
      return h('option', value)
  }

  function mapLinks(list)
  {
    return map(computed([list], (list) => list.sort()), l => queryLink(l))
  }

  function booksPage (location) {
    const { queryKey, queryValue } = location

    const authors = Set()
    const genres = Set()
    const shelves = Set()
    const readers = Set()

    const scrollerContent = h('section.content')
    const filterSection = h('section.filters', [h('span.authors', ['Authors:', h('select', {
      'ev-change': (ev) => {
        api.app.sync.goTo({
          page: 'books',
          queryKey: "authors",
          queryValue: ev.target.selectedOptions[0].value
        })
      }
    }, mapLinks(authors))]), h('span.genres', ['Genres:', h('select', {
      'ev-change': (ev) => {
        api.app.sync.goTo({
          page: 'books',
          queryKey: "genre",
          queryValue: ev.target.selectedOptions[0].value
        })
      }
    }, mapLinks(genres))]), h('span.shelves', ['Your shelves:', h('select', {
      'ev-change': (ev) => {
        api.app.sync.goTo({
          page: 'books',
          queryKey: "shelve",
          queryValue: ev.target.selectedOptions[0].value
        })
      }
    }, mapLinks(shelves))]), h('span.readers', ['Readers:', h('select', {
      'ev-change': (ev) => {
        api.app.sync.goTo({
          page: 'books',
          queryKey: "reader",
          queryValue: ev.target.selectedOptions[0].value
        })
      }
    }, map(computed([readers], (list) => list.sort()), r => h('option', { value: r }, r ? api.about.obs.name(r) : '')) )]) ])

    const content = h('div.books', [scrollerContent])
    const { container } = api.app.html.scroller({
      prepend: [api.book.html.button(), filterSection],
      content: content
    })

    onceTrue(api.sbot.obs.connection, function(server) {
      const allBooks = Books(server)

      const myId = api.keys.sync.id()

      let books = []

      function render(book) {
        return api.message.html.layout(book.msg, { layout: 'card', hydratedBook: book })
      }

      // faster doing UI update once
      let bookAuthors = Set()
      bookAuthors.add("")
      let lcBookGenres = Set()
      let bookGenres = Set()
      bookGenres.add("")
      let bookShelves = Set()
      bookShelves.add("")
      let bookReaders = Set()
      bookReaders.add("")

      pull(
        allBooks(null, true, false),
        pull.drain((book) => {
          //console.log(book)
          bookAuthors.add(book.common.authors)

          function addNewGenre(genre) {
            if (genre && !lcBookGenres.has(genre.toLowerCase())) {
              bookGenres.add(genre)
              lcBookGenres.add(genre.toLowerCase())
            }
          }

          const genres = book.common.genres
          if (Array.isArray(genres))
            genres.forEach(addNewGenre)
          else
            addNewGenre(genres)

          const shelves = book.reviews[myId].shelves
          if (shelves)
            bookShelves.add(shelves)

          book.readers.map(reader => bookReaders.add(reader))

          if (queryKey && queryValue) {
            if (queryKey == "reader") {
              if (book.readers.indexOf(queryValue) != -1)
                books.push(book)

              return
            }

            let lowercaseQueryValue = queryValue.toLowerCase()

            let value = book.common[queryKey]
            if (!value)
              value = book.reviews[myId][queryKey]
            if (value)
              value = value.toLowerCase()
            if (value == lowercaseQueryValue)
              books.push(book)
          } else
            books.push(book)
        }, () => {

          authors.set(bookAuthors())
          genres.set(bookGenres())
          shelves.set(bookShelves())
          readers.set(bookReaders())

          pull(
            pull.values(books),
            Scroller(container, scrollerContent, render, true, true)
          )
        })
      )
    })

    container.title = '/books'
    return container
  }
}
