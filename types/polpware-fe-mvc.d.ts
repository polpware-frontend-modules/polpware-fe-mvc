import { ICollectionStore, ICollectionItem } from '@polpware/fe-data';
import { Subscription } from 'rxjs';

interface IViewInstance {
    $data: {
        init: any;
        setRefreshCallback: any;
        setInfiniteCallback: any;
        clean: any;
        asyncPush: any;
        syncPush: any;
        asyncPop: any;
        syncPop: any;
        asyncPrepend: any;
        syncPrepend: any;
        asyncRefresh: any;
        syncRefresh: any;
        hasMoreData: any;
        getItems: any;
        setupSearch: any;
        updateSearchCriteria: any;
        getAncestor: any;
    };
    $loader: {
        show: any;
        hide: any;
    };
    $refresher: {
        show: any;
        hide: any;
    };
    $moreLoader: {
        show: any;
        hide: any;
    };
    $router: {
        go: any;
    };
    $render: {
        ready: any;
        destroy: any;
        asyncDigest: any;
    };
    $navBar: {
        /**
         * Get current state
         * @returns {}
         */
        getState: any;
        /**
         * Set state
         * @param {Boolean} s
         */
        setState: any;
    };
    $modal: {
        setData: any;
        getData: any;
        build: any;
    };
    $popover: {
        setData: any;
        getData: any;
        build: any;
        onHidden: any;
    };
    $popup: {
        setData: any;
        getData: any;
        build: any;
        confirm: any;
        prompt: any;
        alert: any;
    };
    $progressBar: {
        create: any;
        reset: any;
        createInfinite: any;
        onProgress: any;
        destroy: any;
        destroyInfinite: any;
        showAbort: any;
    };
    $alertify: any;
    $history: {
        goBack: any;
    };
}

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

interface IListMediatorCtorOptions {
    dataProvider?: any;
    dataParams?: any;
    deepCopy?: boolean;
    useModel?: boolean;
    enableRefresh: boolean;
    enableInfinite: boolean;
}
interface IListMediatorPublic {
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
interface IListMediatorDev extends IListMediatorPublic {
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
declare const ListMediator: any;

declare const noopViewInstance: IViewInstance;

interface INgStoreListMediatorPublic extends IListMediatorPublic {
    setNgStore<T extends ICollectionItem>(store: ICollectionStore<T>): void;
    getNgStore<T extends ICollectionItem>(): ICollectionStore<T>;
}
interface INgStoreListMediatorDev extends IListMediatorDev {
    _ngStore: ICollectionStore<any>;
    _super(value?: any): any;
}
declare const NgStoreListMediator: any;

/**
 * @fileOverview
 * This module implements a list mediator that may quickly
 * get updated on any operation in this list.
 * E.g., add, remove, update
 */

interface IChangeSet {
    changes: {
        added: any[];
        removed: any[];
        merged: any[];
    };
}
interface IWritableListMediatorCtorOptions extends IListMediatorCtorOptions {
    globalProvider?: any;
    filterFlags?: {
        added?: boolean;
        removed?: boolean;
        updated?: boolean;
    };
}
interface IWritableListMediatorPublic extends IListMediatorPublic {
    viewLevelData(value?: any): any;
    globalProvider(value?: any): any;
    globalProviderFilter(evtCtx: any, changeSet: IChangeSet, rest: any): IChangeSet;
}
interface IWritableListMediatorDev extends IListMediatorDev {
    _viewLevelData: any;
    _viewProviderListeners: any;
    _globalProvider: any;
    _globalProviderListeners: any;
    _filterFlags: {
        added?: boolean;
        removed?: boolean;
        updated?: boolean;
    };
    _super(value?: any): any;
    globalProviderFilter(evtCtx: any, changeSet: IChangeSet, rest: any): IChangeSet;
    onGlobalProviderUpdate(): any;
    onViewProviderUpdate(evtCtx: any, changeSet: IChangeSet, rest: any): void;
    startListeningGlobalProvider(globalProvider: any): any;
    stopListeningGlobalProvider(): any;
    startListeningViewProvider(): any;
    stopListeningViewProvider(): any;
    findAtIndex(newModel: any): number;
}
declare const WritableListMediator: any;

interface IRxjsPoweredDirContentMediatorDev extends IWritableListMediatorDev {
    _emitEventDelay: number;
    _globalSubr: Subscription;
}
declare const RxjsPoweredWritableListMediator: any;

declare const ListControllerCtor: any;

export { ListControllerCtor, ListMediator, NgStoreListMediator, RxjsPoweredWritableListMediator, WritableListMediator, noopViewInstance };
export type { IChangeSet, IListMediatorCtorOptions, IListMediatorDev, IListMediatorPublic, INgStoreListMediatorDev, INgStoreListMediatorPublic, IRxjsPoweredDirContentMediatorDev, IViewInstance, IWritableListMediatorCtorOptions, IWritableListMediatorDev, IWritableListMediatorPublic };
//# sourceMappingURL=polpware-fe-mvc.d.ts.map
