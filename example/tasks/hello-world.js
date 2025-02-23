module.exports = {
  name: 'Hello world',
  description: 'Prints HELLO WORLD and that is it.',
  do: ({ log, resolve }) => {
    log.log('Hello World');
    resolve();
  },
};
