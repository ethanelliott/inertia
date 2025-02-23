module.exports = {
  name: 'hello-world',
  description: 'Prints HELLO WORLD and that is it.',
  do: (resolve, reject, config, shell, log) => {
    log.log('Hello World');
  },
};
