const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

module.exports = {
  name: 'Test',
  description: 'Waits for 2 seconds and then prints TEST',
  do: async ({ log, spinner }) => {
    log.log('Doing test...');
    const l = spinner('Loading...').start();
    await wait(2000);
    l.success('Done!');
  },
};
