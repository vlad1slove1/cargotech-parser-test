import { writeFileSync } from 'fs';
import {
  number as _number,
  object as _object,
  array,
  bool,
  mixed,
  string,
} from 'yup';
import { ISchema } from './types.js';

export const isProd: boolean = process.env.APP_ENV === 'prod';

export const getTruckTypes = (truckType: string): string[] => {
  if (typeof truckType !== 'string') {
    return ['тент'];
  }

  const regexes: Array<[RegExp, string]> = [
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

  const res: string[] = [];

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

export const getLoadTypes = (loadTypes: string): string[] => {
  if (typeof loadTypes !== 'string') {
    return ['задняя'];
  }

  const regexes: Array<[RegExp, string]> = [
    [/зад|rear|zad/i, 'задняя'],
    [/верх|top/i, 'верхняя'],
    [/бок|side/i, 'боковая'],
    [/растент|full/i, 'с полной растентовкой'],
    [/аппарели/i, 'аппарели'],
  ];

  const res: string[] = [];

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

export const getCargoType = (cargoType: string): string => {
  if (typeof cargoType !== 'string') {
    return 'ТНП';
  }

  const regexes: Array<[RegExp, string]> = [
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
    [/кабель/gi, '50'],
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

const saveJson = (fileName: string, preparedData: unknown): void => {
  writeFileSync(
    `public/${fileName}.json`,
    JSON.stringify(preparedData, null, 2)
  );
};

export const orderDicts = {
  additionalConditions: {
    temperatureRegime: 1,
    medicalBook: 2,
    sanitization: 3,
    partialLoad: 4, // Единственное что работает пока что
    MKAD: 5,
  },
} as const;

export const orderSchema = _object().shape({
  cargo: _object()
    .shape({
      external_id: string().required(),
      external_additional_id: string().optional(),
      type: string()
        .matches(/(auction|express)/)
        .required(),

      price: _number().min(0).required().integer(),
      price_vat: _number().min(0).integer().optional(),
      weight: _number().min(0).required().integer(),
      volume: _number().min(0).required(),

      cargo_type_id: mixed().optional(),
      money_type_id: mixed().optional(),
      currency_id: mixed().optional(),

      truck_types: array().of(mixed()).required(),
      load_types: array().of(mixed()).required(),
      unload_types: array().of(mixed()).optional(),
      additional_conditions: array().of(mixed()).optional(),

      // Truck object
      truck: _object()
        .shape({
          tir: bool().optional(),
          cmr: bool().optional(),
          t1: bool().optional(),
          quantity: _number().optional(),
          belt_count: _number().min(1).integer().optional(),
          place_count: _number().min(1).integer().optional(),
          pallet_count: _number().integer().min(0).max(100).optional(),
          san_passport: bool().optional(),
          medical_book: bool().optional(),
          coupling: bool().optional(),
          koniki: bool().optional(),
          temperature_from: _number().integer().min(-100).max(100).optional(),
          temperature_to: _number().integer().min(-100).max(100).optional(),
          adr: _number().integer().min(0).max(9).optional(),

          height: _number().integer().optional(),
          length: _number().integer().optional(),
          width: _number().integer().optional(),
          weight: _number().integer().optional(),
          volume: _number().integer().optional(),
        })
        .optional(),

      // Auction object
      auction: _object()
        .shape({
          bind: string().optional(),
          duration: _number().optional(),
          start_date: string().optional(),
          finish_date: string().optional(),
        })
        .optional(),

      // Payment object
      payment: _object()
        .shape({
          type: string().optional(),
          prepay: _number().optional(),
          vat: _number().optional(),
          prepay_in_fuel: bool().optional(),
          tax_rate: _number().optional(),
          credit_score: string().optional(),
          payday: _number().optional(),
          pay_on_unload: bool().optional(),
          bargain: bool().optional(),

          in_cash: bool().optional(),

          cargo_price: _number().optional(),

          advance_amount: _number().optional(),
          advance_percent: _number().optional(),

          only_no_vat_price: bool().optional(),
          only_vat_price: bool().optional(),
        })
        .optional(),

      // Size object
      size: _object()
        .shape({
          height: _number().min(0).integer().optional(),
          length: _number().min(0).integer().optional(),
          width: _number().min(0).integer().optional(),
          diameter: _number().min(0).integer().optional(),
        })
        .optional(),

      // Extra object
      extra: _object()
        .shape({
          note: string().optional(),
          note_valid: bool().optional(),

          external_inn: string().optional(),
          custom_cargo_type: string().optional(),

          integrate: _object().optional(),
          integrate_contacts: _object().optional(),

          krugoreis: bool().optional(),
          partial_load: bool().optional(),

          bid_id: string().optional(),
          url: string().optional(),
        })
        .optional(),

      // Грузовладелец
      owner: _object()
        .shape({
          inn: string().optional(),
          name: string().optional(),
          city: string().optional(),
          region: string().optional(),
        })
        .optional(),

      // Cargotech user IDs
      contact_ids: array().of(_number().integer()).optional(),

      // USA only
      external_contacts: array()
        .of(
          _object().shape({
            name: string().optional(),
            phones: array().of(string()).optional(),
            email: string().optional(),
          })
        )
        .optional(),

      points: array()
        .min(2)
        .required()
        .of(
          _object().shape({
            position: string()
              .matches(/(start|extra|finish)/)
              .required(),
            type: string()
              .matches(/(load|unload)/)
              .required(),
            first_date: string().when('position', {
              is: 'start',
              then: () =>
                string().required('У стартовой точки всегда должна быть дата'),
            }),
            last_date: string().optional(),
            company_inn: string().when('position', {
              is: 'start',
              then: () =>
                string().required(
                  'У стартовой точки всегда должен быть инн грузовладельца'
                ),
            }),
            address: string().required(),
            latitude: _number().optional(),
            longitude: _number().optional(),
          })
        ),
    })
    .required(),
});

export const saveOrders = async (
  partnerId: string,
  companyId: number,
  orders: ISchema[],
  beforeOrderCount: number = 0,
  startTime: number = 0,
  finishTime: number = 0,
  error: unknown = null,
  timezone: string = 'Europe/Moscow'
): Promise<void> => {
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
    preparedData.errors = JSON.stringify((e as Error).message);
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

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
