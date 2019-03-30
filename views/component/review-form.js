const { h, when, computed, resolve } = require('mutant')

module.exports = function ReviewForm (opts) {
  const {
    state,
    markdown,
    onCancel,
    publish
  } = opts

  return h('ReviewForm', [
    h('div.details', [
      h('label.rating', 'Rating'),
      h('div.rating', [
        h('input', {
          'ev-input': ev => state.rating.set(ev.target.value),
          value: state.rating
        }),
        h('span', ' / '),
        h('input.ratingMax', {
          'ev-input': ev => state.ratingMax.set(ev.target.value),
          value: state.ratingMax
        }),
        h('span.type', ' Type '),
        h('input.ratingType', {
          'ev-input': ev => state.ratingType.set(ev.target.value),
          value: state.ratingType
        }),
        h('span', computed(state.ratingType, markdown))
      ]),
      h('label.shelves', 'Shelves'),
      h('input.shelves', {
        'ev-input': ev => state.shelves.set(ev.target.value),
        value: state.shelves
      }),
      h('label', 'Review'),
      h('textarea', {
        'ev-input': ev => state.review.set(ev.target.value),
        value: state.review
      }),
    ]),
    h('div.actions', [
      h('button -subtle', { 'ev-click': onCancel }, 'Cancel'),
      h('button', {
        className: '-primary',
        'ev-click': publish
      }, 'Publish')
    ])
  ])
}
