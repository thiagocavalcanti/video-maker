const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const watsonCredentials = require('../credentials/watson.json');

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonCredentials.apikey,
  version: watsonCredentials.version,
  url: watsonCredentials.url
});

async function robot(content) {
  await fetchTextFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await fetchKeywordsOfAllSentences(content);

  async function fetchTextFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
      'web/WikipediaParser/0.1.2'
    );
    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponse.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(
      content.sourceContentOriginal
    );
    const withoutDatesInParantheses = removeDatesInParantheses(
      withoutBlankLinesAndMarkdown
    );

    content.sourceContentSanitized = withoutDatesInParantheses;

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n');

      const withoutBlankLines = allLines.filter(line =>
        line.trim().length === 0 || line.trim().startsWith('=') ? false : true
      );

      return withoutBlankLines.join(' ');
    }

    function removeDatesInParantheses(text) {
      return text
        .replace(/\((?:\([^()]*\)|[^()])*\)/gm, '')
        .replace(/  /g, ' ');
    }
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];

    const sentences = sentenceBoundaryDetection.sentences(
      content.sourceContentSanitized
    );
    sentences.forEach(sentence =>
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    );
  }

  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }

  async function fetchKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze(
        {
          text: sentence,
          features: {
            keywords: {}
          }
        },
        (error, response) => {
          if (error) throw error;

          const keywords = response.keywords.map(keyword => keyword.text);

          resolve(keywords);
        }
      );
    });
  }
}

module.exports = robot;
