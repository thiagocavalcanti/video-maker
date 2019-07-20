const { google } = require('googleapis');
const customSearch = google.customsearch('v1');
const state = require('./state');

const googleSearchCredentials = require('../credentials/google-search.json');
async function robot() {
  const content = state.load();

  const imagesArray = await fetchGoogleAndReturnImagesLinks('Michael Jackson');
  await fetchImagesOfAllSentences(content);
  console.dir(content, { depth: null });

  state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);
      sentence.googleSearchQuery = query;
    }
  }

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      num: 2,
      searchType: 'image'
    });

    const imagesUrl = response.data.items.map(item => item.link);

    return imagesUrl;
  }

  process.exit(0);
}

module.exports = robot;
