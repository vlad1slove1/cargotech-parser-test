import { getCargoType, getLoadTypes, getTruckTypes } from './helpers';

const companyInn = '7729101200';

/**
 * @param {import('./types').IPlatform} target
 * @param {import('puppeteer').Page} page
 */
export const getOrders = async (target, page) => {
  /** @type {import('./types').ISchema['cargo']['points']} */
  const points = [{
    position: 'start',
    type: 'load',
    first_date: '2025-09-10T10:00:00Z',
    company_inn: companyInn,
    address: 'Москва',
  }];

  /** @type {import('./types').ISchema[]} */
  const orders = [
    {
      cargo: {
        type: 'auction',
        external_id: '1',

        price: 0,
        weight: 0,
        volume: 0,

        cargo_type_id: getCargoType('ТНП'),
        truck_types: getTruckTypes('Тент'),
        load_types: getLoadTypes('Задняя'),

        points,
      },
    },
  ];

  return orders;
};
