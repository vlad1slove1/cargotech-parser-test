import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  Browser,
  BrowserContext,
  Cookie,
  LaunchOptions,
  Page,
  launch,
} from 'puppeteer';
import { IViewport } from './types.js';

dotenv.config({ path: '.env', override: true });

export async function initBrowser(
  puppeteerLaunchOptions: LaunchOptions = {}
): Promise<Browser> {
  const browser = await launch({
    // Выбираем режим, если dev - обычный режим браузера, для дебага. Если prod - значит безголовый режим (он же new).
    headless: process.env.APP_ENV === 'dev' ? false : true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-features=NetworkService',
      '--ignore-certificate-errors',
      '--disable-web-security',
      '--disable-blink-features=AutomationControlled',
    ],
    userDataDir: './cookies',
    ...puppeteerLaunchOptions,
  });

  process.on('exit', async () => {
    const pages = await browser.pages();
    for (const page of pages) {
      await page.close();
    }
    await browser.close();
  });

  return browser;
}

export async function newPage(
  browser: Browser,
  timeout: number = 60 * 1000,
  viewport: IViewport = { width: 1333, height: 900 }
): Promise<Page> {
  // Создаем новую страницу. По возможности в ней и работаем, не расходуем лишние ресурсы.
  const page = await browser.newPage();

  await page.setUserAgent(process.env.USER_AGENT || ''); // Установка user-agent. Обязательно!
  page.setDefaultTimeout(timeout); // Стандартный таймаут функция на странице (типо сколько ждать селекта, и так далее)
  await page.setViewport(viewport); // Размер страницы, для удобства или бывает нужен, что бы растянуть таблицу и забрать все заказы.

  return page;
}

export async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
}

export async function isSelector(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    console.log(`Selector ${selector} exist`);
    return true;
  } catch (err) {
    console.log(`Selector ${selector} does not exist`);
    return false;
  }
}

export async function saveCookies(
  page: Page,
  filename: string = 'cookies.json'
): Promise<void> {
  try {
    const browserContext: BrowserContext = page.browserContext();

    const cookies: Cookie[] = await browserContext.cookies();

    const cookiePath: string = `./cookies/${filename}`;
    writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));

    console.log(`куки сохранены в ${cookiePath}`);
  } catch (error) {
    console.error('ошибка при сохранении куки:', error);
  }
}

export async function loadCookies(
  page: Page,
  filename: string = 'cookies.json'
): Promise<void> {
  try {
    const cookiePath: string = `./cookies/${filename}`;

    if (existsSync(cookiePath)) {
      const browserContext: BrowserContext = page.browserContext();

      const cookies: Cookie[] = JSON.parse(readFileSync(cookiePath, 'utf8'));
      await browserContext.setCookie(...cookies);

      console.log(`куки загружены из ${cookiePath}`);
    }
  } catch (error) {
    console.error('ошибка при загрузке куки:', error);
  }
}
