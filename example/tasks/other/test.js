module.exports = {
  name: 'Test',
  description: 'Prints TEST and that is it.',
  do: ({ resolve, log, ora }) => {
    log.log('Doing test...');
    const l = ora('Loading...').start();
    setTimeout(() => {
      resolve();
      l.succeed('Done!');
    }, 5000);
  },
};
