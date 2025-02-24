const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

module.exports = {
  name: 'Test',
  description: 'Waits for 5 seconds and then prints TEST',
  do: async ({ log, ora }) => {
    log.log('Doing test...');
    const l = ora('Loading...').start();
    await wait(5000);
    l.succeed('Done!');
  },
};
