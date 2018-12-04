const nest = require('depnest')
const { h, Value, when, computed } = require('mutant')

exports.needs = nest({
  'message.html': {
    meta: 'map',
    timestamp: 'first'
  },
  'keys.sync.id': 'first',
  'about.html.image': 'first',
  'book.obs.book': 'first',
  'book.html': {
    shortDescription: 'first',
    title: 'first',
    series: 'first',
    authors: 'first',
    images: 'first',
    simpleEmoji: 'first'
  }
})

exports.gives = nest('book.html.layout')

exports.create = (api) => {
  return nest('book.html.layout', bookLayout)

  function bookLayout (msg, opts) {
    const { layout, obs, isCard } = opts

    if (layout !== undefined && layout !== 'card') return

    const { timestamp, meta } = api.message.html

    const { shortDescription, title, series, authors, images } = api.book.html

    let hasRating = computed([obs.subjective], subjectives => {
      return api.keys.sync.id() in subjectives && subjectives[api.keys.sync.id()].rating != ''
    })

    let ratingComputed = computed([obs.subjective], subjectives => {
      if (api.keys.sync.id() in subjectives) {
        let subj = subjectives[api.keys.sync.id()]
        return 'Your rating: ' + subj.rating + ' ' + api.book.html.simpleEmoji(subj.ratingType)
      } else
        return ''
    })

    const content = [
      h('.toggle-layout', {
        'ev-click': e => {
          e.preventDefault()
          isCard.set(false)
        }
      }, '+'),
      h('.details', [
        images({images: obs.images}),
        h('div', [
          title({title: obs.title, msg}),
          series({series: obs.series, seriesNo: obs.seriesNo}),
          authors({authors: obs.authors}),
          when(hasRating, h('span.text', { innerHTML: ratingComputed })),
          shortDescription(obs.description)
        ])
      ])
    ]

    let rawMessage = Value(null)

    return h('Message -book-card', [
      h('section.avatar', {}, api.about.html.image(msg.value.author)),
      h('section.content', {}, content),
      h('section.raw-content', rawMessage),
      h('section.bottom', [
        h('section.timestamp', {}, timestamp(msg)),
        h('section.meta', {}, meta(msg, { rawMessage }))
      ])
    ])
  }
}
