const { Dict, Struct, Array: MutantArray } = require('mutant')
const pick = require('lodash.pick')

module.exports = {
  emptyState,
  buildState,
  initialiseState
}

function emptyState () {
  return {
    title: '',
    description: '',
    authors: '', // FIXME: MutantArray([]),
    series: '',
    seriesNo: '',
    images: '', // FIXME: MutantArray([]),
    genres: '',
    pages: '',
    reviews: Dict()
  }
}

function buildState (givenState) {
  if (!givenState) return emptyState()

  const state = Object.assign(
    emptyState(),
    permittedOpts(givenState)
  )

  return state
}

function initialiseState (givenState) {
  return Struct(buildState(givenState))
}

function permittedOpts (opts) {
  const permitted = 'title description authors series seriesNo images genres pages reviews'.split(' ')

  return pick(opts, permitted)
}
