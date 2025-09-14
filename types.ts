import yup from 'yup';
import { orderSchema } from './helpers.js';

export type ISchema = yup.InferType<typeof orderSchema>;

export interface IPartner {
  id: string;
  key: string;
  name: string;
  inn?: string;
  short_name?: string;
}

export interface ICompany {
  id: number;
  inn: string;
  name: string;
}

export interface IPlatformConfig {
  username: string;
  password: string;
  companies?: string;
  token?: string;
  auth_key?: string;
  [key: string]: unknown;
}

export interface IPlatform {
  id: number;
  company_id: number;
  partner_id: string;
  partner: IPartner;
  company: ICompany;
  config: IPlatformConfig;
  contacts: unknown[];
  only_inn: unknown[];
}

export interface ICompanyData {
  id: number;
  company: {
    id: number;
    inn: string;
    name: string;
    is_work_time: boolean;
  };
  config: Record<string, unknown>;
  partner: {
    id: string;
    name: string;
  };
}

export interface IViewport {
  width: number;
  height: number;
}

export interface IExternalContact {
  name: string;
  phones: string[];
  email: string;
}
