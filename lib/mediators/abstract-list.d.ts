/**
 * @fileOverview
 * An mediator (named after the mediator pattern)
 * which coordinates views and controllers.
 * We support the following use cases:
 * 1. A page is first time loaded and then rendered
 * 2. A page is refreshed by pulling down
 * 3. A page is rendered with more data
 * 4. A page is updated after some state has changed
 *
 * Note that this is an sbtract class; you cannot create an instance of it.
 */
import { IViewInstance } from './interfaces';
export interface IListMediatorCtorOptions {
    dataProvider?: any;
    dataParams?: any;
    deepCopy?: boolean;
    useModel?: boolean;
    enableRefresh: boolean;
    enableInfinite: boolean;
}
export interface IListMediatorPublic {
    dataProvider(value?: any): any;
    dataParams(value?: any): any;
    viewInsance(value?: IViewInstance): IViewInstance;
    startService(viewInsance: IViewInstance, fromCache?: boolean): void;
    stopService(): void;
    loadInitData(): PromiseLike<any>;
    refresh(isProgramatic?: boolean): PromiseLike<any>;
    loadMore(): PromiseLike<any>;
    renderData(async?: boolean): void;
    setUp(options?: any): void;
    tearDown(): void;
}
export interface IListMediatorDev extends IListMediatorPublic {
    _settings: IListMediatorCtorOptions;
    _viewInstance: IViewInstance;
    _dataProvider: any;
    _dataParams: any;
    _deepCopy: boolean;
    _useModel: boolean;
    _enableRefresh: boolean;
    _enableInfinite: boolean;
    _stateContext: any;
    _isInit: boolean;
    _isLoadingData: boolean;
    safelyReadDataProvider(): any[];
    generateItemsInternal(collection: any): any[];
    onUpdateView(evt: any): any;
    generateItems(async?: boolean): void;
    _defaultStartService(): void;
    attachView(viewInstance: any): void;
    detachView(): void;
    startServiceImpl(): void;
}
export declare const ListMediator: any;
