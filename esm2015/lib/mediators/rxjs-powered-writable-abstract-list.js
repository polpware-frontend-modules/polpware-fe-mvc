/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { fromEvent } from 'rxjs';
import { debounceTime, buffer, map } from 'rxjs/operators';
import * as hInterface from '@polpware/fe-dependencies';
import { pushArray } from '@polpware/fe-utilities';
import { WritableListMediator } from './writable-abstract-list';
/** @type {?} */
const _ = hInterface.underscore;
/**
 * @record
 */
export function IRxjsPoweredDirContentMediatorDev() { }
if (false) {
    /** @type {?} */
    IRxjsPoweredDirContentMediatorDev.prototype._emitEventDelay;
    /** @type {?} */
    IRxjsPoweredDirContentMediatorDev.prototype._globalSubr;
}
/**
 * @record
 */
function IFullChangeSet() { }
if (false) {
    /** @type {?} */
    IFullChangeSet.prototype.add;
    /** @type {?} */
    IFullChangeSet.prototype.remove;
    /** @type {?} */
    IFullChangeSet.prototype.merge;
}
/**
 * @param {?} data
 * @return {?}
 */
function mergeArgs(data) {
    /** @type {?} */
    const finalSet = {
        add: false,
        remove: false,
        merge: false,
        changes: {
            added: [],
            removed: [],
            merged: []
        }
    };
    data.forEach((elem) => {
        /** @type {?} */
        const changeSet = elem[1];
        if (changeSet.changes.added && changeSet.changes.added.length > 0) {
            pushArray(finalSet.changes.added, changeSet.changes.added);
            finalSet.add = true;
        }
        if (changeSet.changes.removed && changeSet.changes.removed.length > 0) {
            pushArray(finalSet.changes.removed, changeSet.changes.removed);
            finalSet.remove = true;
        }
        if (changeSet.changes.merged && changeSet.changes.merged.length > 0) {
            pushArray(finalSet.changes.merged, changeSet.changes.merged);
            finalSet.merge = true;
        }
    });
    return finalSet;
}
/** @type {?} */
export const RxjsPoweredWritableListMediator = WritableListMediator.extend({
    Properties: 'globalSubr, emitEventDelay',
    init: function (settings) {
        /** @type {?} */
        const self = this;
        self._super(settings);
        self._globalSubr = null;
        self._emitEventDelay = 1000;
    },
    /**
     * Starts to listen to the change on the global provider.
     * It is usually used internally on setting up this mediator.
     */
    startListeningGlobalProvider: function (globalProvider) {
        /** @type {?} */
        const self = this;
        self._globalProvider = globalProvider;
        /** @type {?} */
        const eventObserver = fromEvent(globalProvider, 'update');
        /** @type {?} */
        const ctrlObserver = eventObserver.pipe(debounceTime(self._emitEventDelay));
        self._globalSubr = eventObserver.pipe(buffer(ctrlObserver), map((col) => {
            /** @type {?} */
            const x = mergeArgs(col);
            return x;
        })).subscribe(args => {
            self.onGlobalProviderUpdate.apply(self, [null, args]);
        });
    },
    /**
     * Stops listening to the change on the global provider.
     * It is usally used on the tearing down this mediator.
     */
    stopListeningGlobalProvider: function () {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const globalProvider = self._globalProvider;
        if (self._globalSubr) {
            self._globalSubr.unsubscribe();
            self._globalSubr = null;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnhqcy1wb3dlcmVkLXdyaXRhYmxlLWFic3RyYWN0LWxpc3QuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AcG9scHdhcmUvZmUtbXZjLyIsInNvdXJjZXMiOlsibGliL21lZGlhdG9ycy9yeGpzLXBvd2VyZWQtd3JpdGFibGUtYWJzdHJhY3QtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBZ0IsTUFBTSxNQUFNLENBQUM7QUFDL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsT0FBTyxLQUFLLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkQsT0FBTyxFQUdILG9CQUFvQixFQUV2QixNQUFNLDBCQUEwQixDQUFDOztNQUU1QixDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVU7Ozs7QUFFL0IsdURBR0M7OztJQUZHLDREQUF3Qjs7SUFDeEIsd0RBQTBCOzs7OztBQUc5Qiw2QkFJQzs7O0lBSEcsNkJBQWE7O0lBQ2IsZ0NBQWdCOztJQUNoQiwrQkFBZTs7Ozs7O0FBR25CLFNBQVMsU0FBUyxDQUFDLElBQVc7O1VBQ3BCLFFBQVEsR0FBbUI7UUFDN0IsR0FBRyxFQUFFLEtBQUs7UUFDVixNQUFNLEVBQUUsS0FBSztRQUNiLEtBQUssRUFBRSxLQUFLO1FBQ1osT0FBTyxFQUFFO1lBQ0wsS0FBSyxFQUFFLEVBQUU7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLE1BQU0sRUFBRSxFQUFFO1NBQ2I7S0FDSjtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFXLEVBQUUsRUFBRTs7Y0FDbkIsU0FBUyxHQUFlLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQy9ELFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNELFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25FLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pFLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdELFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ3pCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDOztBQUVELE1BQU0sT0FBTywrQkFBK0IsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7SUFDdkUsVUFBVSxFQUFFLDRCQUE0QjtJQUV4QyxJQUFJLEVBQUUsVUFBUyxRQUEwQzs7Y0FDL0MsSUFBSSxHQUFzQyxJQUFJO1FBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDaEMsQ0FBQzs7Ozs7SUFPRCw0QkFBNEIsRUFBRSxVQUFTLGNBQWM7O2NBQzNDLElBQUksR0FBc0MsSUFBSTtRQUNwRCxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQzs7Y0FFaEMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDOztjQUNuRCxZQUFZLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FDakMsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUNwQixHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTs7a0JBQ0YsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDeEIsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FDTCxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNmLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDOzs7OztJQU1ELDJCQUEyQixFQUFFOztjQUNuQixJQUFJLEdBQXNDLElBQUk7O2NBQzlDLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZTtRQUMzQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUMzQjtJQUNMLENBQUM7Q0FFSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZnJvbUV2ZW50LCBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgYnVmZmVyLCBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCAqIGFzIGhJbnRlcmZhY2UgZnJvbSAnQHBvbHB3YXJlL2ZlLWRlcGVuZGVuY2llcyc7XG5cbmltcG9ydCB7IHB1c2hBcnJheSB9IGZyb20gJ0Bwb2xwd2FyZS9mZS11dGlsaXRpZXMnO1xuXG5pbXBvcnQge1xuICAgIElXcml0YWJsZUxpc3RNZWRpYXRvckRldixcbiAgICBJQ2hhbmdlU2V0LFxuICAgIFdyaXRhYmxlTGlzdE1lZGlhdG9yLFxuICAgIElXcml0YWJsZUxpc3RNZWRpYXRvckN0b3JPcHRpb25zXG59IGZyb20gJy4vd3JpdGFibGUtYWJzdHJhY3QtbGlzdCc7XG5cbmNvbnN0IF8gPSBoSW50ZXJmYWNlLnVuZGVyc2NvcmU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJ4anNQb3dlcmVkRGlyQ29udGVudE1lZGlhdG9yRGV2IGV4dGVuZHMgSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2IHtcbiAgICBfZW1pdEV2ZW50RGVsYXk6IG51bWJlcjtcbiAgICBfZ2xvYmFsU3VicjogU3Vic2NyaXB0aW9uO1xufVxuXG5pbnRlcmZhY2UgSUZ1bGxDaGFuZ2VTZXQgZXh0ZW5kcyBJQ2hhbmdlU2V0IHtcbiAgICBhZGQ6IGJvb2xlYW47XG4gICAgcmVtb3ZlOiBib29sZWFuO1xuICAgIG1lcmdlOiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBtZXJnZUFyZ3MoZGF0YTogYW55W10pOiBJQ2hhbmdlU2V0IHtcbiAgICBjb25zdCBmaW5hbFNldDogSUZ1bGxDaGFuZ2VTZXQgPSB7XG4gICAgICAgIGFkZDogZmFsc2UsXG4gICAgICAgIHJlbW92ZTogZmFsc2UsXG4gICAgICAgIG1lcmdlOiBmYWxzZSxcbiAgICAgICAgY2hhbmdlczoge1xuICAgICAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICAgICAgICBtZXJnZWQ6IFtdXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRhdGEuZm9yRWFjaCgoZWxlbTogYW55W10pID0+IHtcbiAgICAgICAgY29uc3QgY2hhbmdlU2V0OiBJQ2hhbmdlU2V0ID0gZWxlbVsxXTtcbiAgICAgICAgaWYgKGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkICYmIGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHB1c2hBcnJheShmaW5hbFNldC5jaGFuZ2VzLmFkZGVkLCBjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZCk7XG4gICAgICAgICAgICBmaW5hbFNldC5hZGQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkICYmIGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcHVzaEFycmF5KGZpbmFsU2V0LmNoYW5nZXMucmVtb3ZlZCwgY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZCk7XG4gICAgICAgICAgICBmaW5hbFNldC5yZW1vdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VTZXQuY2hhbmdlcy5tZXJnZWQgJiYgY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHB1c2hBcnJheShmaW5hbFNldC5jaGFuZ2VzLm1lcmdlZCwgY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkKTtcbiAgICAgICAgICAgIGZpbmFsU2V0Lm1lcmdlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGZpbmFsU2V0O1xufVxuXG5leHBvcnQgY29uc3QgUnhqc1Bvd2VyZWRXcml0YWJsZUxpc3RNZWRpYXRvciA9IFdyaXRhYmxlTGlzdE1lZGlhdG9yLmV4dGVuZCh7XG4gICAgUHJvcGVydGllczogJ2dsb2JhbFN1YnIsIGVtaXRFdmVudERlbGF5JyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHNldHRpbmdzOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZWxmOiBJUnhqc1Bvd2VyZWREaXJDb250ZW50TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zdXBlcihzZXR0aW5ncyk7XG4gICAgICAgIHNlbGYuX2dsb2JhbFN1YnIgPSBudWxsO1xuICAgICAgICBzZWxmLl9lbWl0RXZlbnREZWxheSA9IDEwMDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAgICAgKiBTdGFydHMgdG8gbGlzdGVuIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIGdsb2JhbCBwcm92aWRlci5cbiAgICAgICAgICogSXQgaXMgdXN1YWxseSB1c2VkIGludGVybmFsbHkgb24gc2V0dGluZyB1cCB0aGlzIG1lZGlhdG9yLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZ2xvYmFsUHJvdmlkZXJcbiAgICAgICAgICovXG4gICAgc3RhcnRMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcjogZnVuY3Rpb24oZ2xvYmFsUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVJ4anNQb3dlcmVkRGlyQ29udGVudE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fZ2xvYmFsUHJvdmlkZXIgPSBnbG9iYWxQcm92aWRlcjtcblxuICAgICAgICBjb25zdCBldmVudE9ic2VydmVyID0gZnJvbUV2ZW50KGdsb2JhbFByb3ZpZGVyLCAndXBkYXRlJyk7XG4gICAgICAgIGNvbnN0IGN0cmxPYnNlcnZlciA9IGV2ZW50T2JzZXJ2ZXIucGlwZShkZWJvdW5jZVRpbWUoc2VsZi5fZW1pdEV2ZW50RGVsYXkpKTtcblxuICAgICAgICBzZWxmLl9nbG9iYWxTdWJyID0gZXZlbnRPYnNlcnZlci5waXBlKFxuICAgICAgICAgICAgYnVmZmVyKGN0cmxPYnNlcnZlciksXG4gICAgICAgICAgICBtYXAoKGNvbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBtZXJnZUFyZ3MoY29sKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkuc3Vic2NyaWJlKGFyZ3MgPT4ge1xuICAgICAgICAgICAgc2VsZi5vbkdsb2JhbFByb3ZpZGVyVXBkYXRlLmFwcGx5KHNlbGYsIFtudWxsLCBhcmdzXSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgICAgKiBTdG9wcyBsaXN0ZW5pbmcgdG8gdGhlIGNoYW5nZSBvbiB0aGUgZ2xvYmFsIHByb3ZpZGVyLlxuICAgICAgICAqIEl0IGlzIHVzYWxseSB1c2VkIG9uIHRoZSB0ZWFyaW5nIGRvd24gdGhpcyBtZWRpYXRvci5cbiAgICAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nR2xvYmFsUHJvdmlkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJUnhqc1Bvd2VyZWREaXJDb250ZW50TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBnbG9iYWxQcm92aWRlciA9IHNlbGYuX2dsb2JhbFByb3ZpZGVyO1xuICAgICAgICBpZiAoc2VsZi5fZ2xvYmFsU3Vicikge1xuICAgICAgICAgICAgc2VsZi5fZ2xvYmFsU3Vici51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgc2VsZi5fZ2xvYmFsU3ViciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG4iXX0=