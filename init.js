import { execute } from './execute.js';

const init = async () => {
  await execute();
};

init()
  .then(() => {
    console.log('Init finished');
  })
  .catch((error) => {
    console.error('Init failed', error);
  });
