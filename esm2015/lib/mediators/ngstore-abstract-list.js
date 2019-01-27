/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ListMediator } from './abstract-list';
/**
 * @record
 */
export function INgStoreListMediatorPublic() { }
if (false) {
    /**
     * @template T
     * @param {?} store
     * @return {?}
     */
    INgStoreListMediatorPublic.prototype.setNgStore = function (store) { };
    /**
     * @template T
     * @return {?}
     */
    INgStoreListMediatorPublic.prototype.getNgStore = function () { };
}
/**
 * @record
 */
export function INgStoreListMediatorDev() { }
if (false) {
    /** @type {?} */
    INgStoreListMediatorDev.prototype._ngStore;
    /**
     * @param {?=} value
     * @return {?}
     */
    INgStoreListMediatorDev.prototype._super = function (value) { };
}
/** @type {?} */
export const NgStoreListMediator = ListMediator.extend({
    init: function (settings) {
        /** @type {?} */
        const self = this;
        self._super(settings);
        self._ngStore = null;
    },
    setNgStore: function (store) {
        /** @type {?} */
        const self = this;
        self._ngStore = store;
    },
    getNgStore: function () {
        /** @type {?} */
        const self = this;
        return self._ngStore;
    },
    safelyReadDataProvider: function () {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const models = self._super();
        // Safely push these models into view level data provider
        self._ngStore.add(models);
        // Then return
        return models;
    },
    /**
     * Override.
     * This method uses the data from the ngstore, instead of the
     * the current remote data provider, to generate the list of data
     * to be rendered.
     */
    renderData: function (async) {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
        /** @type {?} */
        const subscription = self._ngStore.getState().subscribe(savedData => {
            /** @type {?} */
            const newData = self.generateItemsInternal(savedData.items);
            if (async === true) {
                $data.asyncPush(newData);
            }
            else {
                $data.syncPush(newData);
            }
            setTimeout(() => {
                subscription.unsubscribe();
            }, 1);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdzdG9yZS1hYnN0cmFjdC1saXN0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL2ZlLW12Yy8iLCJzb3VyY2VzIjpbImxpYi9tZWRpYXRvcnMvbmdzdG9yZS1hYnN0cmFjdC1saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFLQSxPQUFPLEVBQ0gsWUFBWSxFQUlmLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFNekIsZ0RBR0M7Ozs7Ozs7SUFGRyx1RUFBd0U7Ozs7O0lBQ3hFLGtFQUE2RDs7Ozs7QUFHakUsNkNBR0M7OztJQUZHLDJDQUFnQzs7Ozs7SUFDaEMsZ0VBQXlCOzs7QUFHN0IsTUFBTSxPQUFPLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFFbkQsSUFBSSxFQUFFLFVBQVMsUUFBa0M7O2NBQ3ZDLElBQUksR0FBNEIsSUFBSTtRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxVQUFVLEVBQUUsVUFBcUMsS0FBMEI7O2NBQ2pFLElBQUksR0FBNEIsSUFBSTtRQUMxQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUMxQixDQUFDO0lBRUQsVUFBVSxFQUFFOztjQUNGLElBQUksR0FBNEIsSUFBSTtRQUMxQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELHNCQUFzQixFQUFFOztjQUNkLElBQUksR0FBNEIsSUFBSTs7Y0FDcEMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDNUIseURBQXlEO1FBQ3pELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLGNBQWM7UUFDZCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOzs7Ozs7O0lBUUQsVUFBVSxFQUFFLFVBQVMsS0FBZTs7Y0FDMUIsSUFBSSxHQUE0QixJQUFJOztjQUNwQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLO1FBQ3RDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDOztjQUU5QyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUU7O2tCQUUxRCxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDM0QsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUNoQixLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzVCO2lCQUFNO2dCQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0I7WUFFRCxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUM7SUFDTixDQUFDO0NBRUosQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBJQ29sbGVjdGlvbkl0ZW0sIElDb2xsZWN0aW9uU3RvcmVcclxufSBmcm9tICdAcG9scHdhcmUvZmUtZGF0YSc7XHJcblxyXG5cclxuaW1wb3J0IHtcclxuICAgIExpc3RNZWRpYXRvcixcclxuICAgIElMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucyxcclxuICAgIElMaXN0TWVkaWF0b3JQdWJsaWMsXHJcbiAgICBJTGlzdE1lZGlhdG9yRGV2XHJcbn0gZnJvbSAnLi9hYnN0cmFjdC1saXN0JztcclxuXHJcbmV4cG9ydCB7XHJcbiAgICBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMsXHJcbn0gZnJvbSAnLi9hYnN0cmFjdC1saXN0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU5nU3RvcmVMaXN0TWVkaWF0b3JQdWJsaWMgZXh0ZW5kcyBJTGlzdE1lZGlhdG9yUHVibGljIHtcclxuICAgIHNldE5nU3RvcmU8VCBleHRlbmRzIElDb2xsZWN0aW9uSXRlbT4oc3RvcmU6IElDb2xsZWN0aW9uU3RvcmU8VD4pOiB2b2lkO1xyXG4gICAgZ2V0TmdTdG9yZTxUIGV4dGVuZHMgSUNvbGxlY3Rpb25JdGVtPigpOiBJQ29sbGVjdGlvblN0b3JlPFQ+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElOZ1N0b3JlTGlzdE1lZGlhdG9yRGV2IGV4dGVuZHMgSUxpc3RNZWRpYXRvckRldiB7XHJcbiAgICBfbmdTdG9yZTogSUNvbGxlY3Rpb25TdG9yZTxhbnk+O1xyXG4gICAgX3N1cGVyKHZhbHVlPzogYW55KTogYW55O1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgTmdTdG9yZUxpc3RNZWRpYXRvciA9IExpc3RNZWRpYXRvci5leHRlbmQoe1xyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uKHNldHRpbmdzOiBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBzZWxmOiBJTmdTdG9yZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5fc3VwZXIoc2V0dGluZ3MpO1xyXG4gICAgICAgIHNlbGYuX25nU3RvcmUgPSBudWxsO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXROZ1N0b3JlOiBmdW5jdGlvbiA8VCBleHRlbmRzIElDb2xsZWN0aW9uSXRlbT4oc3RvcmU6IElDb2xsZWN0aW9uU3RvcmU8VD4pOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzZWxmOiBJTmdTdG9yZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5fbmdTdG9yZSA9IHN0b3JlO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXROZ1N0b3JlOiBmdW5jdGlvbiA8VCBleHRlbmRzIElDb2xsZWN0aW9uSXRlbT4oKTogSUNvbGxlY3Rpb25TdG9yZTxUPiB7XHJcbiAgICAgICAgY29uc3Qgc2VsZjogSU5nU3RvcmVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBzZWxmLl9uZ1N0b3JlO1xyXG4gICAgfSxcclxuXHJcbiAgICBzYWZlbHlSZWFkRGF0YVByb3ZpZGVyOiBmdW5jdGlvbigpOiBhbnlbXSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZjogSU5nU3RvcmVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xyXG4gICAgICAgIGNvbnN0IG1vZGVscyA9IHNlbGYuX3N1cGVyKCk7XHJcbiAgICAgICAgLy8gU2FmZWx5IHB1c2ggdGhlc2UgbW9kZWxzIGludG8gdmlldyBsZXZlbCBkYXRhIHByb3ZpZGVyXHJcbiAgICAgICAgc2VsZi5fbmdTdG9yZS5hZGQobW9kZWxzKTtcclxuICAgICAgICAvLyBUaGVuIHJldHVyblxyXG4gICAgICAgIHJldHVybiBtb2RlbHM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3ZlcnJpZGUuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB1c2VzIHRoZSBkYXRhIGZyb20gdGhlIG5nc3RvcmUsIGluc3RlYWQgb2YgdGhlXHJcbiAgICAgKiB0aGUgY3VycmVudCByZW1vdGUgZGF0YSBwcm92aWRlciwgdG8gZ2VuZXJhdGUgdGhlIGxpc3Qgb2YgZGF0YVxyXG4gICAgICogdG8gYmUgcmVuZGVyZWQuXHJcbiAgICAgKi9cclxuICAgIHJlbmRlckRhdGE6IGZ1bmN0aW9uKGFzeW5jPzogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNlbGY6IElOZ1N0b3JlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcclxuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcclxuICAgICAgICAkZGF0YS5jbGVhbigpO1xyXG4gICAgICAgICRkYXRhLmhhc01vcmVEYXRhKHNlbGYuX2RhdGFQcm92aWRlci5oYXNOZXh0UGFnZSgpKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gc2VsZi5fbmdTdG9yZS5nZXRTdGF0ZSgpLnN1YnNjcmliZShzYXZlZERhdGEgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbmV3RGF0YSA9IHNlbGYuZ2VuZXJhdGVJdGVtc0ludGVybmFsKHNhdmVkRGF0YS5pdGVtcyk7XHJcbiAgICAgICAgICAgIGlmIChhc3luYyA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgJGRhdGEuYXN5bmNQdXNoKG5ld0RhdGEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJGRhdGEuc3luY1B1c2gobmV3RGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIH0sIDEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSk7XHJcbiJdfQ==