const robots = {
  text: require('./robots/text'),
  userInput: require('./robots/user-input')
};

async function start() {
  const content = {};

  robots.userInput(content);
  await robots.text(content);

  console.log(content);
}

start();
