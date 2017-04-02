const cheerio = require('cheerio')
const mollusc = require('mollusc')
const pluralize = require('pluralize')
const request = require('request-promise')
const argv = require('yargs').argv

const ignoreWords = require('./ignore-words')

require('console.table')

const { band, album } = argv

if (!band) {
  throw new Error('missing parameter --band')
}

if (!album) {
  throw new Error('missing parameter --album')
}

(async function ({ band, album }) {
  const molluscOptions = {
    replacement: ''
  }

  const bandSlug = mollusc(band, molluscOptions)
  const albumSlug = mollusc(album, molluscOptions)

  const url = `http://www.darklyrics.com/lyrics/${bandSlug}/${albumSlug}.html`

  console.info(`\nLooking up ${url}\n`)
  console.time(`${band} - ${album}`)

  const response = await request.get(url)
  const $ = cheerio.load(response)

  const lyrics = $('div.lyrics').text().toLocaleLowerCase().replace(/\s/g, ' ').replace(/!|\?|,|\./g, '')
  const wordMap = {}

  lyrics.split(' ').forEach((word) => {
    const slug = pluralize.singular(word.endsWith('\'s') ? word.substring(0, word.length - 2) : word).toLocaleLowerCase()

    wordMap[slug] = (wordMap[slug] || 0) + 1
  })

  const filteredWords = Object.keys(wordMap).filter((word) => {
    if (word.startsWith('[') && word.endsWith(']')) {
      return false
    }

    return word.length > 2 && wordMap[word] > 2 && ignoreWords.indexOf(word) === -1
  })

  const words = filteredWords.map((word, i) => {
    const related = filteredWords.filter((w) => {
      return w !== word && (w.indexOf(word) === 0 || word.indexOf(w) === 0)
    }).reduce((value, word) => {
      const currentValue = `${word} (${wordMap[word]})`

      return value.length === 0 ? currentValue : `${value}, ${currentValue}`
    }, '')

    return {
      word,
      count: wordMap[word],
      related
    }
  }).sort((a, b) => {
    return b.count === a.count ? a.word.localeCompare(b.word) : b.count - a.count
  }).filter((word, i) => i < 25).map((word, i) => Object.assign({
    rank: i + 1
  }, word))

  console.table(words)

  console.timeEnd(`${band} - ${album}`)
})({ band, album })
