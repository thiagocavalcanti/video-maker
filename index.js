const robots = {
  text: require('./robots/text'),
  userInput: require('./robots/user-input')
};

async function start() {
  const content = {
    maximumSentences: 7
  };

  robots.userInput(content);
  await robots.text(content);

  console.log(JSON.stringify(content.sentences));
}

start();
