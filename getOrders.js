const companyInn = '7729101200'

/**
 * @param {import('./types').IPlatform} target
 * @param {import('puppeteer').Page} page
 */
export const getOrders = async (target, page) => {
  /** @type {import('./types').ISchema['cargo']['points']} */
  const points = []

  /** @type {import('./types').ISchema[]} */
  const orders = [{
    cargo: {
      type: 'auction',
      external_id: '1',

      price: 0,
      weight: 0,
      volume: 0,

      cargo_type_id: 1,
      truck_types: ['Тент'],
      load_types: ['Задняя'],

      points,
    }
  }];

  return orders;
};
