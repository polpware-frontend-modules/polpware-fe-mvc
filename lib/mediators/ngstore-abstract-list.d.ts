import { ICollectionItem, ICollectionStore } from '@polpware/fe-data';
import { IListMediatorPublic, IListMediatorDev } from './abstract-list';
export { IListMediatorCtorOptions, } from './abstract-list';
export interface INgStoreListMediatorPublic extends IListMediatorPublic {
    setNgStore<T extends ICollectionItem>(store: ICollectionStore<T>): void;
    getNgStore<T extends ICollectionItem>(): ICollectionStore<T>;
}
export interface INgStoreListMediatorDev extends IListMediatorDev {
    _ngStore: ICollectionStore<any>;
    _super(value?: any): any;
}
export declare const NgStoreListMediator: any;
