import yup from 'yup';
import { orderSchema } from './helpers';

export type ISchema = yup.InferType<typeof orderSchema>;

export type IPlatform = {
  id: number;
  company_id: number;
  partner_id: string;
  partner: {
    id: string;
    key: string;
    name: string;
    inn?: string;
    short_name: string;
  };
  company: {
    id: number;
    inn: string;
    name: string;
  };
  config?: {
    username?: string;
    login?: string;
    password?: string;
    companies?: string;
    token?: string;
    auth_key?: string;
  } & {
    [key: string]: any;
  };
  contacts: any[];
  only_inn: any[];
};

export interface ICompany {
  id: number;
  company: {
    id: number;
    inn: string;
    name: string;
    is_work_time: boolean;
  };
  config: Record<string, any>;
  partner: {
    id: string;
    name: string;
  };
}
