const { h, Value, computed, when, map, resolve } = require('mutant')
const Edit = require('./edit-review')

module.exports = function BookShow (opts) {
  const {
    myKey,
    book,
    scuttle,
    blobUrl = i => i,
    avatar = i => h('div', i),
    name = i => h('div', i),
    markdown = i => i,
    timestamp = i => i,
    modal = i => i,
    goTo,
    editBtn
  } = opts

  const state = Value()
  const isPublishing = Value(false)

  scuttle.get(book.key, true, (err, data) => {
    state.set(data)
  })

  function renderReview(user, review) {
    // review modal
    const isOpen = Value(false)
    const form = Edit({
      bookKey: book.key,
      review,
      scuttle,
      markdown,
      onCancel: () => isOpen.set(false),
      afterPublish: (msg) => {
        isOpen.set(false)
      }
    })

    const ratingModal = modal(form, { isOpen })

    if (!review["key"]) {
      return [
        ratingModal,
        h('section.left',
          avatar(user)),
        h('section.body', h('section.addRating', {
          'ev-click': () => isOpen.set(true) }, [
            h('label', 'Add rating'),
            h('i.fa.fa-star')
        ]))
      ]
    }

    let ratingLine = ''
    if (review.rating) {
      ratingLine = resolve(name(user)) + ' rated ' + review.rating
      if (review.ratingMax)
        ratingLine += ' / ' + review.ratingMax
      ratingLine += review.ratingType
    }

    // patchcore expect a normal message
    review.value = { timestamp: review.timestamp }

    return [
      h('section.left',
        [avatar(user),
         h('div.timestamp', timestamp(review))]),
      h('section.body', [
        h('div', computed(ratingLine, markdown)),
        when(review.shelve,
             h('div', ['Shelve: ', review.shelve])),
        when(review.review,
             h('div', ['Review: ', computed(review.review, markdown)]))
      ]),
      h('section.right', when(user == myKey, [
        ratingModal,
        h('i.fa.fa-pencil', { 'ev-click': () => isOpen.set(true) })
      ])),
      h('section.comments', [
        when(review.comments.length, h('div.header', 'Comments:')),
        map(review.comments, com => {
          com.value = { timestamp: com.timestamp }
          return h('div',
                   [h('section.left', [avatar(com.author), name(com.author), timestamp(com)]),
                    h('section.content', computed(com.content.text, markdown))])
        })
      ])
    ]
  }

  return h('BookShow', computed(state, state => {
    if (!state) return h('div.loading', 'Loading...')

    const { title, description, authors, image, series, seriesNo, genres, pages } = state.common

    let src = ''
    if (image)
      src = blobUrl(image.link)

    function showGenre(genre) {
      return h('a', {
        href: '#', 'ev-click': () => goTo({ page: 'books', query: 'genre=' + genre })
      }, genre)
    }

    function showGenres(genres) {
      if (Array.isArray(genres)) {
        return genres.map(function(genre) {
          return showGenre(genre)
        })
      } else
        return showGenre(genres)
    }

    return [
      h('section.about', [
        h('h1', title),
        editBtn ? h('div.edit', editBtn) : null
      ]),
      h('Series', [
        h('a', {
          'href': '#', 'ev-click': () => goTo({ page: 'books', query: 'series=' + series })
        }, series),
        when(seriesNo, h('span.seriesNo', seriesNo))
      ]),
      h('Authors', [
        'Authors: ',
        h('a', {
          href: '#', 'ev-click': () => goTo({ page: 'books', query: 'authors=' + authors })
        }, authors)
      ]),
      h('Genres', [
        'Genres: ', showGenres(genres)
      ]),
      h('Pages', [
        'Pages: ', pages
      ]),
      h('section.content', [
        h('Images',
          h('img', { src })),
        h('Description',
          markdown(description))
      ]),
      h('section.clear'),
      h('section.reviews', [
        computed(state.reviews, reviews => {
          let reviewsHTML = []
          Object.keys(reviews).forEach(user => {
            reviewsHTML.push(renderReview(user, reviews[user]))
          })
          return reviewsHTML
        })
      ])
    ]
  }))
}
