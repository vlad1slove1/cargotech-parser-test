import 'dotenv/config';

import { launch } from 'puppeteer';

/**
 * Запуск браузера
 * @param {import("puppeteer").LaunchOptions} puppeteerLaunchOptions
 * @returns {Promise<import("puppeteer").Browser>}
 */
export async function initBrowser(
  puppeteerLaunchOptions = {}
) {
  const browser = await launch({
    // Выбираем режим, если dev - обычный режим браузера, для дебага. Если prod - значит безголовый режим (он же new).
    headless: process.env.APP_ENV === 'dev' ? false : 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-features=NetworkService',
      '--ignore-certificate-errors',
      '--disable-web-security',
      '--disable-blink-features=AutomationControlled',
    ],
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

/**
 * Настраиваем страницу
 * @param {import("puppeteer").Browser} browser
 * @param {number} timeout
 * @param {{width: number, height: number}} viewport
 * @returns {Promise<import("puppeteer").Page>}
 */
export async function newPage(
  browser,
  timeout = 60 * 1000,
  viewport = { width: 1333, height: 900 }
) {
  // Создаем новую страницу. По возможности в ней и работаем, не расходуем лишние ресурсы.
  const page = await browser.newPage();

  await page.setUserAgent(process.env.USER_AGENT); // Установка user-agent. Обязательно!
  page.setDefaultTimeout(timeout); // Стандартный таймаут функция на странице (типо сколько ждать селекта, и так далее)
  await page.setViewport(viewport); // Размер страницы, для удобства или бывает нужен, что бы растянуть таблицу и забрать все заказы.

  return page;
}

/**
 * Закрыть браузер
 * @param {puppeteer.Browser} browser
 */
export async function closeBrowser(browser) {
  await browser.close();
}

/**
 * Checks if an element matching the given selector exists on the page.
 * @param {Page} page - страница
 * @param {string} selector - селектор css
 * @param {number} timeout - таймаут
 * @returns {Promise<boolean>}
 */
export async function isSelector(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    console.log(`Selector ${selector} exist`);
    return true;
  } catch (err) {
    console.log(`Selector ${selector} does not exist`);
    return false;
  }
}
