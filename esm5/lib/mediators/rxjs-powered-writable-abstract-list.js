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
var _ = hInterface.underscore;
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
    var finalSet = {
        add: false,
        remove: false,
        merge: false,
        changes: {
            added: [],
            removed: [],
            merged: []
        }
    };
    data.forEach(function (elem) {
        /** @type {?} */
        var changeSet = elem[1];
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
export var RxjsPoweredWritableListMediator = WritableListMediator.extend({
    Properties: 'globalSubr, emitEventDelay',
    init: function (settings) {
        /** @type {?} */
        var self = this;
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
        var self = this;
        self._globalProvider = globalProvider;
        /** @type {?} */
        var eventObserver = fromEvent(globalProvider, 'update');
        /** @type {?} */
        var ctrlObserver = eventObserver.pipe(debounceTime(self._emitEventDelay));
        self._globalSubr = eventObserver.pipe(buffer(ctrlObserver), map(function (col) {
            /** @type {?} */
            var x = mergeArgs(col);
            return x;
        })).subscribe(function (args) {
            self.onGlobalProviderUpdate.apply(self, [null, args]);
        });
    },
    /**
     * Stops listening to the change on the global provider.
     * It is usally used on the tearing down this mediator.
     */
    stopListeningGlobalProvider: function () {
        /** @type {?} */
        var self = this;
        /** @type {?} */
        var globalProvider = self._globalProvider;
        if (self._globalSubr) {
            self._globalSubr.unsubscribe();
            self._globalSubr = null;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnhqcy1wb3dlcmVkLXdyaXRhYmxlLWFic3RyYWN0LWxpc3QuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AcG9scHdhcmUvZmUtbXZjLyIsInNvdXJjZXMiOlsibGliL21lZGlhdG9ycy9yeGpzLXBvd2VyZWQtd3JpdGFibGUtYWJzdHJhY3QtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBZ0IsTUFBTSxNQUFNLENBQUM7QUFDL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0QsT0FBTyxLQUFLLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkQsT0FBTyxFQUdILG9CQUFvQixFQUV2QixNQUFNLDBCQUEwQixDQUFDOztJQUU1QixDQUFDLEdBQUcsVUFBVSxDQUFDLFVBQVU7Ozs7QUFFL0IsdURBR0M7OztJQUZHLDREQUF3Qjs7SUFDeEIsd0RBQTBCOzs7OztBQUc5Qiw2QkFJQzs7O0lBSEcsNkJBQWE7O0lBQ2IsZ0NBQWdCOztJQUNoQiwrQkFBZTs7Ozs7O0FBR25CLFNBQVMsU0FBUyxDQUFDLElBQVc7O1FBQ3BCLFFBQVEsR0FBbUI7UUFDN0IsR0FBRyxFQUFFLEtBQUs7UUFDVixNQUFNLEVBQUUsS0FBSztRQUNiLEtBQUssRUFBRSxLQUFLO1FBQ1osT0FBTyxFQUFFO1lBQ0wsS0FBSyxFQUFFLEVBQUU7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLE1BQU0sRUFBRSxFQUFFO1NBQ2I7S0FDSjtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFXOztZQUNmLFNBQVMsR0FBZSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvRCxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzRCxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztTQUN2QjtRQUNELElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRCxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztTQUMxQjtRQUNELElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqRSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztTQUN6QjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxRQUFRLENBQUM7QUFDcEIsQ0FBQzs7QUFFRCxNQUFNLEtBQU8sK0JBQStCLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDO0lBQ3ZFLFVBQVUsRUFBRSw0QkFBNEI7SUFFeEMsSUFBSSxFQUFFLFVBQVMsUUFBMEM7O1lBQy9DLElBQUksR0FBc0MsSUFBSTtRQUNwRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLENBQUM7Ozs7O0lBT0QsNEJBQTRCLEVBQUUsVUFBUyxjQUFjOztZQUMzQyxJQUFJLEdBQXNDLElBQUk7UUFDcEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7O1lBRWhDLGFBQWEsR0FBRyxTQUFTLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQzs7WUFDbkQsWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUUzRSxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQ2pDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFDcEIsR0FBRyxDQUFDLFVBQUMsR0FBRzs7Z0JBQ0UsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7WUFDeEIsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FDTCxDQUFDLFNBQVMsQ0FBQyxVQUFBLElBQUk7WUFDWixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7Ozs7SUFNRCwyQkFBMkIsRUFBRTs7WUFDbkIsSUFBSSxHQUFzQyxJQUFJOztZQUM5QyxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWU7UUFDM0MsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDM0I7SUFDTCxDQUFDO0NBRUosQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZyb21FdmVudCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGJ1ZmZlciwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgKiBhcyBoSW50ZXJmYWNlIGZyb20gJ0Bwb2xwd2FyZS9mZS1kZXBlbmRlbmNpZXMnO1xuXG5pbXBvcnQgeyBwdXNoQXJyYXkgfSBmcm9tICdAcG9scHdhcmUvZmUtdXRpbGl0aWVzJztcblxuaW1wb3J0IHtcbiAgICBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYsXG4gICAgSUNoYW5nZVNldCxcbiAgICBXcml0YWJsZUxpc3RNZWRpYXRvcixcbiAgICBJV3JpdGFibGVMaXN0TWVkaWF0b3JDdG9yT3B0aW9uc1xufSBmcm9tICcuL3dyaXRhYmxlLWFic3RyYWN0LWxpc3QnO1xuXG5jb25zdCBfID0gaEludGVyZmFjZS51bmRlcnNjb3JlO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSeGpzUG93ZXJlZERpckNvbnRlbnRNZWRpYXRvckRldiBleHRlbmRzIElXcml0YWJsZUxpc3RNZWRpYXRvckRldiB7XG4gICAgX2VtaXRFdmVudERlbGF5OiBudW1iZXI7XG4gICAgX2dsb2JhbFN1YnI6IFN1YnNjcmlwdGlvbjtcbn1cblxuaW50ZXJmYWNlIElGdWxsQ2hhbmdlU2V0IGV4dGVuZHMgSUNoYW5nZVNldCB7XG4gICAgYWRkOiBib29sZWFuO1xuICAgIHJlbW92ZTogYm9vbGVhbjtcbiAgICBtZXJnZTogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gbWVyZ2VBcmdzKGRhdGE6IGFueVtdKTogSUNoYW5nZVNldCB7XG4gICAgY29uc3QgZmluYWxTZXQ6IElGdWxsQ2hhbmdlU2V0ID0ge1xuICAgICAgICBhZGQ6IGZhbHNlLFxuICAgICAgICByZW1vdmU6IGZhbHNlLFxuICAgICAgICBtZXJnZTogZmFsc2UsXG4gICAgICAgIGNoYW5nZXM6IHtcbiAgICAgICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgICAgICAgbWVyZ2VkOiBbXVxuICAgICAgICB9XG4gICAgfTtcbiAgICBkYXRhLmZvckVhY2goKGVsZW06IGFueVtdKSA9PiB7XG4gICAgICAgIGNvbnN0IGNoYW5nZVNldDogSUNoYW5nZVNldCA9IGVsZW1bMV07XG4gICAgICAgIGlmIChjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZCAmJiBjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwdXNoQXJyYXkoZmluYWxTZXQuY2hhbmdlcy5hZGRlZCwgY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQpO1xuICAgICAgICAgICAgZmluYWxTZXQuYWRkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZCAmJiBjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHB1c2hBcnJheShmaW5hbFNldC5jaGFuZ2VzLnJlbW92ZWQsIGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQpO1xuICAgICAgICAgICAgZmluYWxTZXQucmVtb3ZlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkICYmIGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwdXNoQXJyYXkoZmluYWxTZXQuY2hhbmdlcy5tZXJnZWQsIGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZCk7XG4gICAgICAgICAgICBmaW5hbFNldC5tZXJnZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBmaW5hbFNldDtcbn1cblxuZXhwb3J0IGNvbnN0IFJ4anNQb3dlcmVkV3JpdGFibGVMaXN0TWVkaWF0b3IgPSBXcml0YWJsZUxpc3RNZWRpYXRvci5leHRlbmQoe1xuICAgIFByb3BlcnRpZXM6ICdnbG9iYWxTdWJyLCBlbWl0RXZlbnREZWxheScsXG5cbiAgICBpbml0OiBmdW5jdGlvbihzZXR0aW5nczogSVdyaXRhYmxlTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVJ4anNQb3dlcmVkRGlyQ29udGVudE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3VwZXIoc2V0dGluZ3MpO1xuICAgICAgICBzZWxmLl9nbG9iYWxTdWJyID0gbnVsbDtcbiAgICAgICAgc2VsZi5fZW1pdEV2ZW50RGVsYXkgPSAxMDAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgICAgICogU3RhcnRzIHRvIGxpc3RlbiB0byB0aGUgY2hhbmdlIG9uIHRoZSBnbG9iYWwgcHJvdmlkZXIuXG4gICAgICAgICAqIEl0IGlzIHVzdWFsbHkgdXNlZCBpbnRlcm5hbGx5IG9uIHNldHRpbmcgdXAgdGhpcyBtZWRpYXRvci5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGdsb2JhbFByb3ZpZGVyXG4gICAgICAgICAqL1xuICAgIHN0YXJ0TGlzdGVuaW5nR2xvYmFsUHJvdmlkZXI6IGZ1bmN0aW9uKGdsb2JhbFByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElSeGpzUG93ZXJlZERpckNvbnRlbnRNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX2dsb2JhbFByb3ZpZGVyID0gZ2xvYmFsUHJvdmlkZXI7XG5cbiAgICAgICAgY29uc3QgZXZlbnRPYnNlcnZlciA9IGZyb21FdmVudChnbG9iYWxQcm92aWRlciwgJ3VwZGF0ZScpO1xuICAgICAgICBjb25zdCBjdHJsT2JzZXJ2ZXIgPSBldmVudE9ic2VydmVyLnBpcGUoZGVib3VuY2VUaW1lKHNlbGYuX2VtaXRFdmVudERlbGF5KSk7XG5cbiAgICAgICAgc2VsZi5fZ2xvYmFsU3ViciA9IGV2ZW50T2JzZXJ2ZXIucGlwZShcbiAgICAgICAgICAgIGJ1ZmZlcihjdHJsT2JzZXJ2ZXIpLFxuICAgICAgICAgICAgbWFwKChjb2wpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gbWVyZ2VBcmdzKGNvbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgICAgICB9KVxuICAgICAgICApLnN1YnNjcmliZShhcmdzID0+IHtcbiAgICAgICAgICAgIHNlbGYub25HbG9iYWxQcm92aWRlclVwZGF0ZS5hcHBseShzZWxmLCBbbnVsbCwgYXJnc10pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICAgICogU3RvcHMgbGlzdGVuaW5nIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIGdsb2JhbCBwcm92aWRlci5cbiAgICAgICAgKiBJdCBpcyB1c2FsbHkgdXNlZCBvbiB0aGUgdGVhcmluZyBkb3duIHRoaXMgbWVkaWF0b3IuXG4gICAgICAgICovXG4gICAgc3RvcExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVJ4anNQb3dlcmVkRGlyQ29udGVudE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgZ2xvYmFsUHJvdmlkZXIgPSBzZWxmLl9nbG9iYWxQcm92aWRlcjtcbiAgICAgICAgaWYgKHNlbGYuX2dsb2JhbFN1YnIpIHtcbiAgICAgICAgICAgIHNlbGYuX2dsb2JhbFN1YnIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHNlbGYuX2dsb2JhbFN1YnIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxuIl19