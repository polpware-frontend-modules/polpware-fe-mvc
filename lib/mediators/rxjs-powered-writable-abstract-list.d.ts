import { Subscription } from 'rxjs';
import { IWritableListMediatorDev } from './writable-abstract-list';
export interface IRxjsPoweredDirContentMediatorDev extends IWritableListMediatorDev {
    _emitEventDelay: number;
    _globalSubr: Subscription;
}
export declare const RxjsPoweredWritableListMediator: any;
