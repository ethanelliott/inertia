module.exports = {
  name: 'Test',
  description: 'Prints TEST and that is it.',
  do: (resolve, reject, config, shell, log) => {
    log.log('TEST');
  },
};
