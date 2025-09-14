import { execute } from './execute.js';

const init = async (): Promise<void> => {
  console.log('запуск парсера');

  const runParsingCycle = async (): Promise<void> => {
    try {
      await execute();

      console.log(
        `=== цикл парсинга завершен: ${new Date().toLocaleString()} ===\n`
      );
    } catch (error) {
      console.error('Ошибка в цикле парсинга:', error);
    }
  };

  await runParsingCycle();

  const restartInterval = 3 * 60 * 1000; // 3 минуты

  setInterval(async () => {
    await runParsingCycle();
  }, restartInterval);

  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
};

init()
  .then(() => {
    console.log('парсер запущен');
  })
  .catch((error: Error) => {
    console.error('ошибка при запуске парсера:', error);
    process.exit(1);
  });
