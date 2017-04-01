const cheerio = require('cheerio')
const request = require('request-promise')
const argv = require('yargs').argv

require('console.table')

const { band, album } = argv

if (!band) {
  throw new Error('missing parameter --band')
}

if (!album) {
  throw new Error('missing parameter --album')
}

(async function ({ band, album }) {
  const ignoreWords = require('./ignore-words')

  function normalize (value) {
    return value.toLocaleLowerCase().replace(/\s/g, '').replace(/'/g, '')
  }

  const url = `http://www.darklyrics.com/lyrics/${normalize(band)}/${normalize(album)}.html`

  console.info(`\nLooking up ${url}\n`)
  console.time(`${band} - ${album}`)

  const response = await request.get(url)
  const $ = cheerio.load(response)

  const lyrics = $('div.lyrics').text().toLocaleLowerCase().replace(/\s/g, ' ').replace(/!|\?|,|\./g, '')
  const wordMap = {}

  lyrics.split(' ').forEach((word) => {
    wordMap[word] = (wordMap[word] || 0) + 1
  })

  const words = Object.keys(wordMap).filter((word) => {
    return word.length > 2 && wordMap[word] > 2 && ignoreWords.indexOf(word) === -1
  }).map((word, i) => ({
    word,
    count: wordMap[word]
  })).sort((a, b) => b.count - a.count).filter((word, i) => i < 20).map((word, i) => Object.assign({
    rank: i + 1
  }, word))

  console.table(words)

  console.timeEnd(`${band} - ${album}`)
})({ band, album })
