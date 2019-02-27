import { IStoresModel } from '../schema/stores';
import { IContext as IEtteContext } from 'ette';
export interface IContext extends IEtteContext{
  stores: IStoresModel;
  [propName: string]: any;
}
