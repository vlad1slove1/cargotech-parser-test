export const isProd = process.env.APP_ENV === 'prod';

/** @type {(truckType: string) => string[]} */
export const getTruckTypes = (truckType) => {
  if (typeof truckType !== 'string') {
    return ['тент'];
  }

  const regexes = [
    [/awning|curtainsider|тент|закрытый|тс до/i, 'тент'],
    [/thermally_insulated|isothermal|терм/i, 'изотерм'],
    [/refrigerator|реф/i, 'рефрижератор'],

    [/фургон/i, 'фургон'],
    [/борт/i, 'бортовой'],
    [/контейнеро/i, 'контейнеровоз'],
    [/открытый|откр|open/i, 'открытый'],
    [/все закр/i, 'все закр.+изотерм'],

    [/контейнер\s+40/i, "40' танк-контейнер"],
    [/контейнер\s+20/i, "20' танк-контейнер"],
    [/контейнер/i, 'контейнер'],
    [/цельномет/i, 'цельнометалл.'],
    [/manipulator|манипулятор/i, 'манипулятор'],
    [/ломовоз|dump_truck/i, 'ломовоз'],
    [/тягач/i, 'седельный тягач'],
    [/трал/i, 'трал'],
    [/зерно/i, 'зерновоз'],
    [/тонар/i, 'тонар'],
  ];

  const res = [];

  for (const [regex, type] of regexes) {
    if (truckType.match(regex)) {
      res.push(type);
    }
  }

  if (res.length === 0) {
    res.push('тент');
  }

  return [...new Set(res)];
};

/** @type {(loadTypes: string) => string[]} */
export const getLoadTypes = (loadTypes) => {
  if (typeof loadTypes !== 'string') {
    return ['задняя'];
  }

  const regexes = [
    [/зад|rear|zad/i, 'задняя'],
    [/верх|top/i, 'верхняя'],
    [/бок|side/i, 'боковая'],
    [/растент|full/i, 'с полной растентовкой'],
    [/аппарели/i, 'аппарели'],
  ];

  const res = [];

  for (const [regex, type] of regexes) {
    if (loadTypes.match(regex)) {
      res.push(type);
    }
  }

  if (res.length === 0) {
    res.push('задняя');
  }

  return [...new Set(res)];
};

export const getCargoType = (cargoType) => {
  if (typeof cargoType !== 'string') {
    return 'ТНП';
  }

  const regexes = [
    [/труб/gi, 'Трубы'],
    [
      /полипропилен|полиэтилен|полиэтилентерефталат|ПЭТФ|ПЭ|полистирол/gi,
      'Пластик',
    ],
    [/каучук|абс-пластик|ТЭП|полиэтилен|полимер/gi, 'Пластик'],
    [/поликарбонат/gi, 'Поликарбонат'],
    [/переход ПШС|опора/gi, 'Изделия из металла'],
    [/электрод/gi, 'электрод'],
    [/лист г\/к/gi, 'Лист г/к'],
    [/труба \d+|отвод/gi, 'Трубы'],
    [/кольцо уплот|задвиж|затвор/gi, 'Оборудование и запчасти'],
    [/тройник|металлоконструкции/gi, 'Оборудование и запчасти'],
    [/пленка БОПП/gi, 'Пленка БОПП'],
    [/кабель/gi, 50],
    [/ТНП|Продукты питания|Личные вещи/gi, 'ТНП'],
    [/Хим.+опас/gi, 'Хим. продукты опасные'],
    [/Хим/gi, 'Хим. продукты неопасные'],
    [/Алкоголь|Пиво/gi, 'Алогольные напитки'],
    [/Безалко/gi, 'Безалкогольные напитки'],
    [/Металлические изделия/gi, 'Металлические изделия'],
    [/Оборудование/gi, 'Оборудование и запчасти'],
    [/Стройматериалы/gi, 'Стройматериалы'],
    [/Мясо/gi, 'Мясо'],
    [/Текстиль/gi, 'Текстиль'],
    [/бананы|фров|фрукты/gi, 'фрукты'],
    [/^алко/gi, 'алкогольные напитки'],
    [/соки/gi, 'соки'],
    [/кондитер/gi, 'кондитерские изделия'],
    [/флокамин/gi, 'Удобрения'],
    [/drugoe/gi, 'Другое'],
  ];

  for (const [regex, type] of regexes) {
    if (cargoType.match(regex)) {
      return type;
    }
  }

  return 'ТНП';
};

const saveJson = (fileName, preparedData) => {
  writeFileSync(`public/${fileName}.json`, JSON.stringify(preparedData));
};

export const orderDicts = /** @type {const} */ ({
  additionalConditions: {
    temperatureRegime: 1,
    medicalBook: 2,
    sanitization: 3,
    partialLoad: 4, // Единственное что работает пока что
    MKAD: 5,
  },
});

/** @typedef {keyof typeof orderDicts.additionalConditions} AdditionalConditions */
/** @typedef {typeof orderDicts.additionalConditions[AdditionalConditions]} AdditionalConditionsValues */

export const orderSchema = _object().shape({
  cargo: _object()
    .shape({
      external_id: string().required(),
      external_additional_id: string(),
      /** @type {import("yup").StringSchema<"auction" | "express">} */
      type: string()
        .matches(/(auction|express)/)
        .required(),

      price: _number().min(0).required().integer(), // price with vat
      price_vat: _number().min(0).integer(), // price without vat
      weight: _number().min(0).required().integer(),
      volume: _number().min(0).required(),

      cargo_type_id: mixed(),
      money_type_id: mixed(),
      currency_id: mixed(),

      truck_types: array().of(mixed()).required(),
      load_types: array().of(mixed()).required(),
      unload_types: array().of(mixed()),
      /** @type {import("yup").ArraySchema<AdditionalConditionsValues[]>} */
      additional_conditions: array().of(mixed()),

      // Truck object
      truck: _object().shape({
        tir: bool(),
        cmr: bool(),
        t1: bool(),
        quantity: _number(),
        belt_count: _number().min(1).integer(),
        place_count: _number().min(1).integer(),
        pallet_count: _number().integer().min(0).max(100),
        san_passport: bool(),
        medical_book: bool(),
        coupling: bool(),
        koniki: bool(),
        temperature_from: _number().integer().min(-100).max(100),
        temperature_to: _number().integer().min(-100).max(100),
        adr: _number().integer().min(0).max(9),

        height: _number().integer(),
        length: _number().integer(),
        width: _number().integer(),
        weight: _number().integer(),
        volume: _number().integer(),
      }),

      // Auction object
      auction: _object().shape({
        bind: string(),
        duration: _number(),
        start_date: string(),
        finish_date: string(),
      }),

      // Payment object
      payment: _object().shape({
        type: string(),
        prepay: _number(),
        vat: _number(),
        prepay_in_fuel: bool(),
        tax_rate: _number(),
        credit_score: string(),
        payday: _number(),
        pay_on_unload: bool(),
        bargain: bool(),

        in_cash: bool(),

        cargo_price: _number(),

        advance_amount: _number(),
        advance_percent: _number(),

        only_no_vat_price: bool(),
        only_vat_price: bool(),
      }),

      // Size object
      size: _object().shape({
        height: _number().min(0).integer(),
        length: _number().min(0).integer(),
        width: _number().min(0).integer(),
        diameter: _number().min(0).integer(),
      }),

      // Extra object
      extra: _object().shape({
        note: string(),
        note_valid: bool(),

        external_inn: string(),
        custom_cargo_type: string(),

        integrate: _object(),
        integrate_contacts: _object(),

        krugoreis: bool(),
        partial_load: bool(),

        bid_id: string(),
        url: string(),
      }),

      // Грузовладелец
      owner: _object().shape({
        inn: string(),
        name: string(),
        city: string(),
        region: string(),
      }),

      // Cargotech user IDs
      contact_ids: array().of(_number().integer()),

      // USA only
      external_contacts: array().of(
        _object().shape({
          name: string(),
          phones: array().of(string()),
          email: string(),
        })
      ),

      points: array()
        .min(2)
        .required()
        .of(
          _object().shape({
            /** @type {import("yup").StringSchema<"start" | "extra" | "finish">} */
            position: string()
              .matches(/(start|extra|finish)/)
              .required(),
            /** @type {import("yup").StringSchema<"load" | "unload">} */
            type: string()
              .matches(/(load|unload)/)
              .required(),
            first_date: string().when('position', {
              is: 'start',
              then: () =>
                string().required('У стартовой точки всегда должна быть дата'),
            }),
            last_date: string(),
            company_inn: string().when('position', {
              is: 'start',
              then: () =>
                string().required(
                  'У стартовой точки всегда должен быть инн грузовладельца'
                ),
            }),
            address: string().required(),
            latitude: _number(),
            longitude: _number(),
          })
        ),
    })
    .required(),
});

/**
 *
 * @param {string} partnerId
 * @param {number} companyId
 * @param {Helpers.ISchema[]} orders
 * @param {number} beforeOrderCount
 * @param {number} startTime
 * @param {number} finishTime
 * @param {*} error
 * @param {*} timezone
 */
export const saveOrders = async (
  partnerId,
  companyId,
  orders,
  beforeOrderCount = 0,
  startTime = 0,
  finishTime = 0,
  error = null,
  timezone = 'Europe/Moscow'
) => {
  const fileName = `${companyId}_${partnerId}`;

  const preparedData = {
    orders,
    partner_id: partnerId,
    company_id: companyId,
    before_order_count: beforeOrderCount,
    after_order_count: orders.length,
    start_time: startTime,
    finish_time: finishTime,
    errors: error,
    timezone,
  };

  const savedJsonSchema = _object().shape({
    company_id: _number().required(),
    partner_id: string().required(),
    orders: array().of(orderSchema),
  });

  try {
    await savedJsonSchema.validate(preparedData);
    console.log(
      `Orders saved for ${companyId} ${partnerId}\nLength: ${orders.length}`
    );
  } catch (e) {
    console.error(`Error saving orders for ${partnerId} ${companyId}: ${e}`);
    preparedData.errors = JSON.stringify(e.errors);
  }

  saveJson(fileName, preparedData);

  if (!isProd) {
    const iso8601Regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

    preparedData.orders.forEach((order, orderIndex) => {
      order.cargo.points.forEach((point, pointIndex) => {
        if (pointIndex === 0 && !point.first_date) {
          throw new Error(
            `Missing first_date at orders[${orderIndex}].cargo.points[${pointIndex}]`
          );
        }

        if (point.first_date && !iso8601Regex.test(point.first_date)) {
          throw new Error(
            `Invalid date format at orders[${orderIndex}].cargo.points[${pointIndex}].first_date: ${point.first_date}`
          );
        }
      });

      // check every order by orderSchema
      try {
        orderSchema.validateSync(order);
      } catch (e) {
        console.error(
          `Error validating order [${orderIndex}] ${
            order?.cargo?.external_id || 'unknown'
          }: ${e}`
        );
      }
    });
  }

  console.log(`Import finished: ${companyId} ${partnerId}`);
};

export const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}