import { ElementHandle, Page } from 'puppeteer';
import { extractOrderData } from './extractOrderData.js';
import { IPlatform, ISchema } from './types.js';

export const getOrders = async (
  target: IPlatform,
  page: Page
): Promise<ISchema[]> => {
  console.log('старт парсинга');

  try {
    // ожидание, пока таблица загрузится
    await page.waitForSelector('#table-master', { timeout: 5000 });

    const rows: ElementHandle<Element>[] = await page.$$(
      '#table-master tbody tr:not(.table-titles)'
    );

    console.log(`найдено строк в таблице: ${rows.length}`);

    const orders: ISchema[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row: ElementHandle<Element> | undefined = rows[i];

      if (!row) {
        continue;
      }

      const order: ISchema | null = await extractOrderData(row, i);

      if (order) {
        orders.push(order);
      }
    }

    console.log(`найдено заказов: ${orders.length}`);
    return orders;
  } catch (error) {
    console.error('ошибка при парсинге заказов:', error);
    return [];
  }
};
