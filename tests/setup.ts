import './setup/matchers';

jest.setTimeout(10000);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection in test:', err);
  process.exit(1);
});
