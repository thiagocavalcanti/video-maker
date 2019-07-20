const readLine = require('readline-sync');

function robot(content) {
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  function askAndReturnSearchTerm() {
    return readLine.question('Escreva um termo de pesquisa para Wikipedia: ');
  }
  function askAndReturnPrefix() {
    const prefixes = [
      'Quem e',
      'O que e',
      'A historia de',
      'A historia da',
      'A historia do'
    ];
    const prefixesReal = [
      'Quem é',
      'O que é',
      'A história de',
      'A história da',
      'A história do'
    ];
    const selectedPrefixIndex = readLine.keyInSelect(
      prefixes,
      'Selecione uma opcao',
      { encoding: 'utf8' }
    );
    return prefixesReal[selectedPrefixIndex];
  }
}

module.exports = robot;
