/**
 * @fileOverview
 * This module implements a list mediator that may quickly
 * get updated on any operation in this list.
 * E.g., add, remove, update
 */
import { IListMediatorCtorOptions, IListMediatorPublic, IListMediatorDev } from './abstract-list';
export interface IChangeSet {
    changes: {
        added: any[];
        removed: any[];
        merged: any[];
    };
}
export interface IWritableListMediatorCtorOptions extends IListMediatorCtorOptions {
    globalProvider?: any;
    filterFlags?: {
        added?: boolean;
        removed?: boolean;
        updated?: boolean;
    };
}
export interface IWritableListMediatorPublic extends IListMediatorPublic {
    viewLevelData(value?: any): any;
    globalProvider(value?: any): any;
    globalProviderFilter(evtCtx: any, changeSet: IChangeSet, rest: any): IChangeSet;
}
export interface IWritableListMediatorDev extends IListMediatorDev {
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
export declare const WritableListMediator: any;
