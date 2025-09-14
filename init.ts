import { execute } from './execute.js';
import { IPlatform } from './types.js';

const runningCompanies = new Set<string>();

const targets: IPlatform[] = [
  {
    id: 1,
    company_id: 2,
    partner_id: 'nzsp',
    partner: { id: 'nzsp', key: '1', name: 'NZSP' },
    company: {
      id: 2,
      inn: '9716027491',
      name: 'ООО "Амурский Региональный Торговый Порт"',
    },
    config: {
      username: process.env.USERNAME || '',
      password: process.env.PASSWORD || '',
    },
    contacts: [],
    only_inn: [],
  },
];

const init = async (): Promise<void> => {
  console.log('запуск парсера');

  const runParsingCycle = async (target: IPlatform): Promise<void> => {
    const companyKey = target.partner.id;

    if (runningCompanies.has(companyKey)) {
      console.log(`Цикл для ${companyKey} уже запущен`);
      return;
    }

    runningCompanies.add(companyKey);

    try {
      await execute(target);
      console.log(
        `=== цикл парсинга для ${companyKey} завершен: ${new Date().toLocaleString()} ===\n`
      );
    } catch (error) {
      console.error(`ошибка в цикле парсинга ${companyKey}:`, error);
    } finally {
      runningCompanies.delete(companyKey);
    }
  };

  const scheduleCycle = async (): Promise<void> => {
    for (const target of targets) {
      await runParsingCycle(target);
    }
    setTimeout(scheduleCycle, 3 * 60 * 1000); // 3 минуты
  };

  await scheduleCycle();

  process.on('SIGINT', () => process.exit(0));
  process.on('SIGTERM', () => process.exit(0));
};

init()
  .then(() => console.log('парсер запущен'))
  .catch((error: Error) => {
    console.error('ошибка при запуске парсера:', error);
    process.exit(1);
  });
