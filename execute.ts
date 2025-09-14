import dotenv from 'dotenv';
import { Page } from 'puppeteer';
import {
  closeBrowser,
  initBrowser,
  isSelector,
  loadCookies,
  newPage,
  saveCookies,
} from './browser.js';
import { getOrders } from './getOrders.js';
import { saveOrders } from './helpers.js';
import { IPlatform } from './types.js';

dotenv.config({ path: '.env', override: true });

export const mainUrl = 'http://nzsp-logistic.ru';
const cargosUrl = `${mainUrl}/index.php`;

const login = async (target: IPlatform, page: Page): Promise<void> => {
  await page.goto(cargosUrl, { waitUntil: 'networkidle2' });

  await page.waitForSelector('#authForm');

  await page.evaluate(() => {
    (document.querySelector('#authEmail') as HTMLInputElement).value = '';
    (document.querySelector('#authPass') as HTMLInputElement).value = '';
  });

  await page.type('#authEmail', target.config.username, { delay: 50 });
  await page.type('#authPass', target.config.password, { delay: 50 });

  await Promise.all([
    page.click('#authForm button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log('[LOGIN] авторизация завершена');
};

export const execute = async (): Promise<void> => {
  const target: IPlatform = {
    id: 1,
    company_id: 2,
    partner_id: 'smart-logist',
    partner: { id: 'nzsp', key: '1', name: 'Smart Logist' },
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
  };

  const browser = await initBrowser();

  try {
    const page = await newPage(browser);
    await loadCookies(page);

    await page.goto(cargosUrl, { waitUntil: 'networkidle2' });
    const loggedIn = await isSelector(page, '#table-master tbody tr', 5000);

    if (!loggedIn) {
      console.log('[LOGIN] авторизация...');
      await login(target, page);
      await saveCookies(page);
    } else {
      console.log('[LOGIN] использованы куки для авторизации');
    }

    const orders = await getOrders(target, page);
    await saveOrders(
      target.partner.id,
      target.company.id,
      orders,
      0,
      Date.now(),
      Date.now()
    );
  } catch (err) {
    console.error('[ERROR] Ошибка в execute:', err);
  } finally {
    await closeBrowser(browser);
  }
};
