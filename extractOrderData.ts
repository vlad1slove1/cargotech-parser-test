import { ElementHandle } from 'puppeteer';
import { getCargoType, getLoadTypes, getTruckTypes } from './helpers.js';
import { ISchema } from './types.js';

const companyInn = '7729101200';

export async function extractOrderData(
  element: ElementHandle<Element>,
  index: number
): Promise<ISchema | null> {
  try {
    // ид заказа
    const externalId = await element
      .$eval('.shipping_id', (el) => (el as HTMLInputElement).value)
      .catch(() => `order_${index}_${Date.now()}`);

    // цена
    const price = await element
      .$eval('.shipping_price_act', (el) =>
        parseFloat((el as HTMLInputElement).value.replace(',', '.'))
      )
      .catch(() => 0);

    // вес
    const weightText = await element
      .$eval('.shipping_weight_summ input', (el: HTMLInputElement) => el.value)
      .catch(() => '0');

    const weight = Math.round(
      parseFloat(weightText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
    );

    // объём
    const volumeText = await element
      .$eval('.shipping_length input', (el: HTMLInputElement) => el.value)
      .catch(() => '0');

    const volume =
      parseFloat(volumeText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    // тип груза
    const cargoType = await element
      .$eval('.shipping_products input', (el) => (el as HTMLInputElement).value)
      .catch(() => 'ТНП');

    // точки
    const startPointAddress = await element
      .$eval('.shipping_point input', (el: HTMLInputElement) => el.value.trim())
      .catch(() => '');

    const finishPointAddress = await element
      .$eval('.shipping_city textarea', (el: HTMLTextAreaElement) =>
        el.value.trim()
      )
      .catch(() => '');

    if (!startPointAddress || !finishPointAddress) {
      console.warn(
        `Строка ${index}: пустой адрес точки маршрута (start: "${startPointAddress}", finish: "${finishPointAddress}")`
      );
    }

    const pointsArray = [
      {
        position: 'start',
        type: 'load',
        first_date: new Date().toISOString(),
        company_inn: companyInn,
        address: startPointAddress,
      },
      {
        position: 'finish',
        type: 'unload',
        address: finishPointAddress,
      },
    ];

    const order: ISchema = {
      cargo: {
        external_id: externalId,
        type: 'auction',
        price,
        weight,
        volume,
        cargo_type_id: getCargoType(cargoType),
        truck_types: getTruckTypes('Тент'),
        load_types: getLoadTypes('Задняя'),
        points: pointsArray,
      },
    };

    console.log(`Строка ${index} успешно извлечена: ${externalId}`);
    return order;
  } catch (error) {
    console.error(`Ошибка извлечения данных строки №${index}:`, error);
    return null;
  }
}
