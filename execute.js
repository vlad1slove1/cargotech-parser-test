import { initBrowser, newPage } from './browser.js';
import { getOrders } from './getOrders.js';
import { saveOrders } from './helpers.js';
import "dotenv/config.js"

export const mainUrl = 'http://nzsp-logistic.ru';
const cargosUrl = `${mainUrl}/index.php`;


/**
 * @param {import('./types').IPlatform} target
 * @param {import('puppeteer').Page} page
 */
const login = async (target, page) => {
  await page.goto(cargosUrl);
};

export const execute = async () => {
  const start = Date.now();

  /** @type {import('./types').IPlatform} */
  const target = {
    id: 1,
    company_id: 2,
    partner_id: 'smart-logist',
    partner: {
      id: 'smart-logist',
      key: '1',
      name: 'Smart Logist',
    },
    company: {
      id: 2,
      inn: '9716027491',
      name: 'ООО "Амурский Региональный Торговый Порт"',
    },
    config: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    },
    contacts: [],
    only_inn: [],
  };

  const browser = await initBrowser();

  try {
    const page = await newPage(browser);
    await login(target, page);

    const orders = await getOrders(target, page);
    await saveOrders(
      target.partner.id,
      target.company.id,
      orders,
      0,
      start,
      Date.now()
    );
  } catch (error) {
    console.error(error);
  } finally {
    await closeBrowser(browser);
  }
};
