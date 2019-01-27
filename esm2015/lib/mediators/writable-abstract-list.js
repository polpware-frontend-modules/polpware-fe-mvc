/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @fileOverview
 * This module implements a list mediator that may quickly
 * get updated on any operation in this list.
 * E.g., add, remove, update
 */
import * as dependencies from '@polpware/fe-dependencies';
import { ListMediator } from './abstract-list';
/** @type {?} */
const _ = dependencies.underscore;
/** @type {?} */
const backbone = dependencies.backbone;
/**
 * @record
 */
export function IChangeSet() { }
if (false) {
    /** @type {?} */
    IChangeSet.prototype.changes;
}
/**
 * @record
 */
export function IWritableListMediatorCtorOptions() { }
if (false) {
    /** @type {?|undefined} */
    IWritableListMediatorCtorOptions.prototype.globalProvider;
    /** @type {?|undefined} */
    IWritableListMediatorCtorOptions.prototype.filterFlags;
}
/**
 * @record
 */
export function IWritableListMediatorPublic() { }
if (false) {
    /**
     * @param {?=} value
     * @return {?}
     */
    IWritableListMediatorPublic.prototype.viewLevelData = function (value) { };
    /**
     * @param {?=} value
     * @return {?}
     */
    IWritableListMediatorPublic.prototype.globalProvider = function (value) { };
    /**
     * @param {?} evtCtx
     * @param {?} changeSet
     * @param {?} rest
     * @return {?}
     */
    IWritableListMediatorPublic.prototype.globalProviderFilter = function (evtCtx, changeSet, rest) { };
}
/**
 * @record
 */
export function IWritableListMediatorDev() { }
if (false) {
    /** @type {?} */
    IWritableListMediatorDev.prototype._viewLevelData;
    /** @type {?} */
    IWritableListMediatorDev.prototype._viewProviderListeners;
    /** @type {?} */
    IWritableListMediatorDev.prototype._globalProvider;
    /** @type {?} */
    IWritableListMediatorDev.prototype._globalProviderListeners;
    /** @type {?} */
    IWritableListMediatorDev.prototype._filterFlags;
    /**
     * @param {?=} value
     * @return {?}
     */
    IWritableListMediatorDev.prototype._super = function (value) { };
    /**
     * @param {?} evtCtx
     * @param {?} changeSet
     * @param {?} rest
     * @return {?}
     */
    IWritableListMediatorDev.prototype.globalProviderFilter = function (evtCtx, changeSet, rest) { };
    /**
     * @return {?}
     */
    IWritableListMediatorDev.prototype.onGlobalProviderUpdate = function () { };
    /**
     * @param {?} evtCtx
     * @param {?} changeSet
     * @param {?} rest
     * @return {?}
     */
    IWritableListMediatorDev.prototype.onViewProviderUpdate = function (evtCtx, changeSet, rest) { };
    /**
     * @param {?} globalProvider
     * @return {?}
     */
    IWritableListMediatorDev.prototype.startListeningGlobalProvider = function (globalProvider) { };
    /**
     * @return {?}
     */
    IWritableListMediatorDev.prototype.stopListeningGlobalProvider = function () { };
    /**
     * @return {?}
     */
    IWritableListMediatorDev.prototype.startListeningViewProvider = function () { };
    /**
     * @return {?}
     */
    IWritableListMediatorDev.prototype.stopListeningViewProvider = function () { };
    /**
     * @param {?} newModel
     * @return {?}
     */
    IWritableListMediatorDev.prototype.findAtIndex = function (newModel) { };
}
/** @type {?} */
export const WritableListMediator = ListMediator.extend({
    Properties: 'viewLevelData,globalProvider',
    init: function (settings) {
        /** @type {?} */
        const self = this;
        self._super(settings);
        /** @type {?} */
        const CollectionCtor = backbone.Collection.extend();
        self._viewLevelData = new CollectionCtor();
        self._viewProviderListeners = {};
        self._globalProvider = settings.globalProvider || null;
        self._globalProviderListeners = {};
        self._filterFlags = settings.filterFlags || { added: true, removed: true, updated: true };
    },
    /**
     * A filter on the global data provider.
     */
    globalProviderFilter: function (evtCtx, changeSet, rest) {
        /*jslint unparam:true */
        /** @type {?} */
        const self = this;
        if (self._filterFlags.added &&
            changeSet.changes.added &&
            changeSet.changes.added.length > 0) {
            return changeSet;
        }
        if (self._filterFlags.removed &&
            changeSet.changes.removed &&
            changeSet.changes.removed.length > 0) {
            return changeSet;
        }
        if (self._filterFlags.updated &&
            changeSet.changes.merged &&
            changeSet.changes.merged.length > 0) {
            return changeSet;
        }
        return null;
    },
    findAtIndex: function (newModel) {
        return -1;
    },
    /**
     * An internal method for listening to any change on the
     * global provider. Listening to the sole update event is
     * sufficient and efficent.
     */
    onGlobalProviderUpdate: function () {
        /*jslint unparam:true */
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const args = arguments;
        // If we are loading data, the data we are receiving is
        // the result of the current loading behavior.
        // We do not need to do anything. Instead, the loading behavior
        // is responsible for rending data.
        if (self._isLoadingData) {
            return;
        }
        // Shortcircuit
        /** @type {?} */
        const changeSet = self.globalProviderFilter.apply(self, args);
        if (!changeSet) {
            return;
        }
        // The interface of changeSet is determined by the above filter
        // method. However, the below view provider listener must be careful.
        // Changes
        if (changeSet.add) {
            /** @type {?} */
            const candidate = _.filter(changeSet.changes.added, function (thisItem) {
                return !_.some(self._viewLevelData.models, function (thatItem) {
                    return thisItem.id === thatItem.id;
                });
            });
            if (candidate.length > 0) {
                _.each(candidate, function (v, k) {
                    /** @type {?} */
                    const atIndex = self.findAtIndex(v);
                    if (atIndex !== -1) {
                        self._viewLevelData.add(v, { at: atIndex });
                    }
                    else {
                        self._viewLevelData.add(v);
                    }
                });
            }
        }
        if (changeSet.remove) {
            self._viewLevelData.remove(changeSet.changes.removed);
        }
        if (changeSet.merge) {
            // Keep propagating
            self._viewLevelData.trigger('update', changeSet.changes);
        }
    },
    /**
     * An internal method for listening to the change on the view
     * data provider. Usually, such kind of listening shall be stopped
     * when there is no view binding to the current midiator list.
     */
    onViewProviderUpdate: function (evtCtx, changeSet, rest) {
        /*jslint unparam:true */
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const $data = self._viewInstance.$data;
        /** @type {?} */
        let newData;
        // Note that the interface of changeSet varies from
        // events to events in Backbone. We have to be very careful.
        if (changeSet.changes.added && changeSet.changes.added.length > 0) {
            // Check if we have data or not
            newData = self.generateItemsInternal(changeSet.changes.added);
            self.onUpdateView({
                add: true,
                source: 'event',
                data: newData
            });
            $data.asyncPrepend(newData);
        }
        if (changeSet.changes.removed && changeSet.changes.removed.length > 0) {
            newData = self.generateItemsInternal(changeSet.changes.removed);
            self.onUpdateView({
                remove: true,
                source: 'event',
                data: newData
            });
            $data.asyncPop(newData);
        }
        if (changeSet.changes.merged && changeSet.changes.merged.length > 0) {
            newData = self.generateItemsInternal(changeSet.changes.merged);
            self.onUpdateView({
                merge: true,
                source: 'event',
                data: newData
            });
            $data.asyncRefresh(newData);
        }
    },
    /**
     * Override.
     * So that we can clean up the view data.
     */
    loadInitData: function () {
        /** @type {?} */
        const self = this;
        self._viewLevelData.reset();
        return self._super();
    },
    /**
     * Starts to listen to the change on the global provider.
     * It is usually used internally on setting up this mediator.
     */
    startListeningGlobalProvider: function (globalProvider) {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const onUpdate = function () {
            /** @type {?} */
            const args = arguments;
            // We have to schedule such update so that some other operations can
            // been completed first. E.g., getForeignModel should be set up.
            _.defer(function () {
                self.onGlobalProviderUpdate.apply(self, args);
            });
        };
        self._globalProviderListeners = {
            update: onUpdate
        };
        self._globalProvider = globalProvider;
        globalProvider.on('update', onUpdate);
    },
    /**
     * Stops listening to the change on the global provider.
     * It is usally used on the tearing down this mediator.
     */
    stopListeningGlobalProvider: function () {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const listeners = self._globalProviderListeners;
        /** @type {?} */
        const globalProvider = self._globalProvider;
        for (const key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                globalProvider.off(key, listeners[key]);
            }
        }
    },
    /**
     * Start to listen to the change on the view data provider.
     * This method is invoked on binding a view to this mediator.
     */
    startListeningViewProvider: function () {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const onUpdate = function (evtCtx, changeSet, rest) {
            self.onViewProviderUpdate(evtCtx, changeSet, rest);
        };
        self._viewProviderListeners = {
            update: onUpdate
        };
        self._viewLevelData.on('update', onUpdate);
    },
    /**
     * Stops listening to the change on the view data provider.
     * This method is invoked on unbinding a view to this mediator.
     */
    stopListeningViewProvider: function () {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const listeners = self._viewProviderListeners;
        for (const key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                self._viewLevelData.off(key, listeners[key]);
            }
        }
    },
    /**
     * Override.
     * Compared its base counterpart, this method performs additional
     * checking on generating data for the view module, so that no repeated
     * items may be generated.
     * Simply because, the data in the view level data is distinct.
     */
    safelyReadDataProvider: function () {
        /** @type {?} */
        const self = this;
        /** @type {?} */
        let models = self._super();
        models = _.filter(models, function (elem) {
            return !_.some(self._viewLevelData.models, function (item) {
                return item.id === elem.id;
            });
        });
        // Safely push these models into view level data provider
        self._viewLevelData.add(models, { silent: true });
        // Then return
        return models;
    },
    /**
     * Override.
     * This method uses the data from the view level data, instead of the
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
        const newData = self.generateItemsInternal(self._viewLevelData.models);
        if (async === true) {
            $data.asyncPush(newData);
        }
        else {
            $data.syncPush(newData);
        }
    },
    /**
     * Override
     */
    setUp: function (options) {
        /** @type {?} */
        const self = this;
        self._super(options);
        if (self._globalProvider) {
            self.startListeningGlobalProvider(self._globalProvider);
        }
    },
    /**
     * Override
     */
    tearDown: function () {
        /** @type {?} */
        const self = this;
        // Call super
        self._super();
        // Tear off what we introduce in this class
        self._viewLevelData.off('all');
        self._viewLevelData.reset();
        // Stop listening to the global
        if (self._globalProvider) {
            self.stopListeningGlobalProvider();
        }
    },
    /**
     * Override
     */
    attachView: function (viewInstance) {
        /** @type {?} */
        const self = this;
        self._super(viewInstance);
        // Start to listen to changes on the view data provider.
        self.startListeningViewProvider();
    },
    /**
     * Override
     */
    detachView: function () {
        /** @type {?} */
        const self = this;
        self._super();
        self.stopListeningViewProvider();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGFibGUtYWJzdHJhY3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Bwb2xwd2FyZS9mZS1tdmMvIiwic291cmNlcyI6WyJsaWIvbWVkaWF0b3JzL3dyaXRhYmxlLWFic3RyYWN0LWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVFBLE9BQU8sS0FBSyxZQUFZLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUNILFlBQVksRUFJZixNQUFNLGlCQUFpQixDQUFDOztNQUVuQixDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVU7O01BQzNCLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUTs7OztBQUV0QyxnQ0FNQzs7O0lBTEcsNkJBSUU7Ozs7O0FBR04sc0RBUUM7OztJQU5HLDBEQUFxQjs7SUFDckIsdURBSUU7Ozs7O0FBR04saURBT0M7Ozs7OztJQUpHLDJFQUFnQzs7Ozs7SUFDaEMsNEVBQWlDOzs7Ozs7O0lBRWpDLG9HQUFnRjs7Ozs7QUFHcEYsOENBeUJDOzs7SUF4Qkcsa0RBQW9COztJQUNwQiwwREFBNEI7O0lBQzVCLG1EQUFxQjs7SUFDckIsNERBQThCOztJQUM5QixnREFJRTs7Ozs7SUFFRixpRUFBeUI7Ozs7Ozs7SUFFekIsaUdBQWdGOzs7O0lBQ2hGLDRFQUF5Qjs7Ozs7OztJQUV6QixpR0FBMEU7Ozs7O0lBRTFFLGdHQUE2Qzs7OztJQUM3QyxpRkFBOEI7Ozs7SUFFOUIsZ0ZBQTZCOzs7O0lBQzdCLCtFQUE0Qjs7Ozs7SUFFNUIseUVBQW1DOzs7QUFHdkMsTUFBTSxPQUFPLG9CQUFvQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFFcEQsVUFBVSxFQUFFLDhCQUE4QjtJQUUxQyxJQUFJLEVBQUUsVUFBUyxRQUEwQzs7Y0FDL0MsSUFBSSxHQUE2QixJQUFJO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7O2NBRWhCLGNBQWMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0s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Q0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQjtJQUNMLENBQUM7Ozs7SUFNRCxLQUFLLEVBQUUsVUFBUyxPQUFPOztjQUNiLElBQUksR0FBNkIsSUFBSTtRQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN0QixJQUFJLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQzNEO0lBQ0wsQ0FBQzs7OztJQUtELFFBQVEsRUFBRTs7Y0FDQSxJQUFJLEdBQTZCLElBQUk7UUFDM0MsYUFBYTtRQUNiLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLDJDQUEyQztRQUMzQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLCtCQUErQjtRQUMvQixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdEIsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7U0FDdEM7SUFDTCxDQUFDOzs7O0lBS0QsVUFBVSxFQUFFLFVBQVMsWUFBWTs7Y0FDdkIsSUFBSSxHQUE2QixJQUFJO1FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsd0RBQXdEO1FBQ3hELElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQ3RDLENBQUM7Ozs7SUFLRCxVQUFVLEVBQUU7O2NBQ0YsSUFBSSxHQUE2QixJQUFJO1FBQzNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO0lBQ3JDLENBQUM7Q0FDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3XG4gKiBUaGlzIG1vZHVsZSBpbXBsZW1lbnRzIGEgbGlzdCBtZWRpYXRvciB0aGF0IG1heSBxdWlja2x5XG4gKiBnZXQgdXBkYXRlZCBvbiBhbnkgb3BlcmF0aW9uIGluIHRoaXMgbGlzdC5cbiAqIEUuZy4sIGFkZCwgcmVtb3ZlLCB1cGRhdGVcbiAqL1xuXG5cbmltcG9ydCAqIGFzIGRlcGVuZGVuY2llcyBmcm9tICdAcG9scHdhcmUvZmUtZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7XG4gICAgTGlzdE1lZGlhdG9yLFxuICAgIElMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucyxcbiAgICBJTGlzdE1lZGlhdG9yUHVibGljLFxuICAgIElMaXN0TWVkaWF0b3JEZXZcbn0gZnJvbSAnLi9hYnN0cmFjdC1saXN0JztcblxuY29uc3QgXyA9IGRlcGVuZGVuY2llcy51bmRlcnNjb3JlO1xuY29uc3QgYmFja2JvbmUgPSBkZXBlbmRlbmNpZXMuYmFja2JvbmU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNoYW5nZVNldCB7XG4gICAgY2hhbmdlczoge1xuICAgICAgICBhZGRlZDogYW55W10sXG4gICAgICAgIHJlbW92ZWQ6IGFueVtdLFxuICAgICAgICBtZXJnZWQ6IGFueVtdXG4gICAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJV3JpdGFibGVMaXN0TWVkaWF0b3JDdG9yT3B0aW9uc1xuICAgIGV4dGVuZHMgSUxpc3RNZWRpYXRvckN0b3JPcHRpb25zIHtcbiAgICBnbG9iYWxQcm92aWRlcj86IGFueTtcbiAgICBmaWx0ZXJGbGFncz86IHtcbiAgICAgICAgYWRkZWQ/OiBib29sZWFuLFxuICAgICAgICByZW1vdmVkPzogYm9vbGVhbixcbiAgICAgICAgdXBkYXRlZD86IGJvb2xlYW5cbiAgICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXcml0YWJsZUxpc3RNZWRpYXRvclB1YmxpY1xuICAgIGV4dGVuZHMgSUxpc3RNZWRpYXRvclB1YmxpYyB7XG5cbiAgICB2aWV3TGV2ZWxEYXRhKHZhbHVlPzogYW55KTogYW55O1xuICAgIGdsb2JhbFByb3ZpZGVyKHZhbHVlPzogYW55KTogYW55O1xuXG4gICAgZ2xvYmFsUHJvdmlkZXJGaWx0ZXIoZXZ0Q3R4OiBhbnksIGNoYW5nZVNldDogSUNoYW5nZVNldCwgcmVzdDogYW55KTogSUNoYW5nZVNldDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgZXh0ZW5kcyBJTGlzdE1lZGlhdG9yRGV2IHtcbiAgICBfdmlld0xldmVsRGF0YTogYW55O1xuICAgIF92aWV3UHJvdmlkZXJMaXN0ZW5lcnM6IGFueTtcbiAgICBfZ2xvYmFsUHJvdmlkZXI6IGFueTtcbiAgICBfZ2xvYmFsUHJvdmlkZXJMaXN0ZW5lcnM6IGFueTtcbiAgICBfZmlsdGVyRmxhZ3M6IHtcbiAgICAgICAgYWRkZWQ/OiBib29sZWFuLFxuICAgICAgICByZW1vdmVkPzogYm9vbGVhbixcbiAgICAgICAgdXBkYXRlZD86IGJvb2xlYW5cbiAgICB9O1xuXG4gICAgX3N1cGVyKHZhbHVlPzogYW55KTogYW55O1xuXG4gICAgZ2xvYmFsUHJvdmlkZXJGaWx0ZXIoZXZ0Q3R4OiBhbnksIGNoYW5nZVNldDogSUNoYW5nZVNldCwgcmVzdDogYW55KTogSUNoYW5nZVNldDtcbiAgICBvbkdsb2JhbFByb3ZpZGVyVXBkYXRlKCk7XG5cbiAgICBvblZpZXdQcm92aWRlclVwZGF0ZShldnRDdHg6IGFueSwgY2hhbmdlU2V0OiBJQ2hhbmdlU2V0LCByZXN0OiBhbnkpOiB2b2lkO1xuXG4gICAgc3RhcnRMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcihnbG9iYWxQcm92aWRlcik7XG4gICAgc3RvcExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyKCk7XG5cbiAgICBzdGFydExpc3RlbmluZ1ZpZXdQcm92aWRlcigpO1xuICAgIHN0b3BMaXN0ZW5pbmdWaWV3UHJvdmlkZXIoKTtcblxuICAgIGZpbmRBdEluZGV4KG5ld01vZGVsOiBhbnkpOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBXcml0YWJsZUxpc3RNZWRpYXRvciA9IExpc3RNZWRpYXRvci5leHRlbmQoe1xuXG4gICAgUHJvcGVydGllczogJ3ZpZXdMZXZlbERhdGEsZ2xvYmFsUHJvdmlkZXInLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oc2V0dGluZ3M6IElXcml0YWJsZUxpc3RNZWRpYXRvckN0b3JPcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3N1cGVyKHNldHRpbmdzKTtcblxuICAgICAgICBjb25zdCBDb2xsZWN0aW9uQ3RvciA9IGJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKCk7XG4gICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEgPSBuZXcgQ29sbGVjdGlvbkN0b3IoKTtcbiAgICAgICAgc2VsZi5fdmlld1Byb3ZpZGVyTGlzdGVuZXJzID0ge307XG4gICAgICAgIHNlbGYuX2dsb2JhbFByb3ZpZGVyID0gc2V0dGluZ3MuZ2xvYmFsUHJvdmlkZXIgfHwgbnVsbDtcbiAgICAgICAgc2VsZi5fZ2xvYmFsUHJvdmlkZXJMaXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgc2VsZi5fZmlsdGVyRmxhZ3MgPSBzZXR0aW5ncy5maWx0ZXJGbGFncyB8fCB7IGFkZGVkOiB0cnVlLCByZW1vdmVkOiB0cnVlLCB1cGRhdGVkOiB0cnVlIH07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEEgZmlsdGVyIG9uIHRoZSBnbG9iYWwgZGF0YSBwcm92aWRlci5cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBnbG9iYWxQcm92aWRlckZpbHRlcjogZnVuY3Rpb24oZXZ0Q3R4OiBhbnksIGNoYW5nZVNldDogSUNoYW5nZVNldCwgcmVzdDogYW55KTogSUNoYW5nZVNldCB7XG4gICAgICAgIC8qanNsaW50IHVucGFyYW06dHJ1ZSAqL1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VsZi5fZmlsdGVyRmxhZ3MuYWRkZWQgJiZcbiAgICAgICAgICAgIGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkICYmXG4gICAgICAgICAgICBjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlU2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLl9maWx0ZXJGbGFncy5yZW1vdmVkICYmXG4gICAgICAgICAgICBjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkICYmXG4gICAgICAgICAgICBjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2VTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGYuX2ZpbHRlckZsYWdzLnVwZGF0ZWQgJiZcbiAgICAgICAgICAgIGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZCAmJlxuICAgICAgICAgICAgY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2VTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuXG4gICAgZmluZEF0SW5kZXg6IGZ1bmN0aW9uKG5ld01vZGVsKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlcm5hbCBtZXRob2QgZm9yIGxpc3RlbmluZyB0byBhbnkgY2hhbmdlIG9uIHRoZVxuICAgICAqIGdsb2JhbCBwcm92aWRlci4gTGlzdGVuaW5nIHRvIHRoZSBzb2xlIHVwZGF0ZSBldmVudCBpc1xuICAgICAqIHN1ZmZpY2llbnQgYW5kIGVmZmljZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzXG4gICAgICovXG4gICAgb25HbG9iYWxQcm92aWRlclVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qanNsaW50IHVucGFyYW06dHJ1ZSAqL1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIC8vIElmIHdlIGFyZSBsb2FkaW5nIGRhdGEsIHRoZSBkYXRhIHdlIGFyZSByZWNlaXZpbmcgaXNcbiAgICAgICAgLy8gdGhlIHJlc3VsdCBvZiB0aGUgY3VycmVudCBsb2FkaW5nIGJlaGF2aW9yLlxuICAgICAgICAvLyBXZSBkbyBub3QgbmVlZCB0byBkbyBhbnl0aGluZy4gSW5zdGVhZCwgdGhlIGxvYWRpbmcgYmVoYXZpb3JcbiAgICAgICAgLy8gaXMgcmVzcG9uc2libGUgZm9yIHJlbmRpbmcgZGF0YS5cbiAgICAgICAgaWYgKHNlbGYuX2lzTG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaG9ydGNpcmN1aXRcbiAgICAgICAgY29uc3QgY2hhbmdlU2V0ID0gc2VsZi5nbG9iYWxQcm92aWRlckZpbHRlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgaWYgKCFjaGFuZ2VTZXQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGUgaW50ZXJmYWNlIG9mIGNoYW5nZVNldCBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBhYm92ZSBmaWx0ZXJcbiAgICAgICAgLy8gbWV0aG9kLiBIb3dldmVyLCB0aGUgYmVsb3cgdmlldyBwcm92aWRlciBsaXN0ZW5lciBtdXN0IGJlIGNhcmVmdWwuXG4gICAgICAgIC8vIENoYW5nZXNcbiAgICAgICAgaWYgKGNoYW5nZVNldC5hZGQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IF8uZmlsdGVyKGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkLCBmdW5jdGlvbih0aGlzSXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhXy5zb21lKHNlbGYuX3ZpZXdMZXZlbERhdGEubW9kZWxzLCBmdW5jdGlvbih0aGF0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0l0ZW0uaWQgPT09IHRoYXRJdGVtLmlkO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY2FuZGlkYXRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBfLmVhY2goY2FuZGlkYXRlLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGF0SW5kZXggPSBzZWxmLmZpbmRBdEluZGV4KHYpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEuYWRkKHYsIHsgYXQ6IGF0SW5kZXggfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLmFkZCh2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VTZXQucmVtb3ZlKSB7XG4gICAgICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLnJlbW92ZShjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlU2V0Lm1lcmdlKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHByb3BhZ2F0aW5nXG4gICAgICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLnRyaWdnZXIoJ3VwZGF0ZScsIGNoYW5nZVNldC5jaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBbiBpbnRlcm5hbCBtZXRob2QgZm9yIGxpc3RlbmluZyB0byB0aGUgY2hhbmdlIG9uIHRoZSB2aWV3XG4gICAgICogZGF0YSBwcm92aWRlci4gVXN1YWxseSwgc3VjaCBraW5kIG9mIGxpc3RlbmluZyBzaGFsbCBiZSBzdG9wcGVkXG4gICAgICogd2hlbiB0aGVyZSBpcyBubyB2aWV3IGJpbmRpbmcgdG8gdGhlIGN1cnJlbnQgbWlkaWF0b3IgbGlzdC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJnc1xuICAgICAqL1xuICAgIG9uVmlld1Byb3ZpZGVyVXBkYXRlOiBmdW5jdGlvbihldnRDdHg6IGFueSwgY2hhbmdlU2V0OiBJQ2hhbmdlU2V0LCByZXN0OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLypqc2xpbnQgdW5wYXJhbTp0cnVlICovXG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICBsZXQgbmV3RGF0YTogYW55O1xuICAgICAgICAvLyBOb3RlIHRoYXQgdGhlIGludGVyZmFjZSBvZiBjaGFuZ2VTZXQgdmFyaWVzIGZyb21cbiAgICAgICAgLy8gZXZlbnRzIHRvIGV2ZW50cyBpbiBCYWNrYm9uZS4gV2UgaGF2ZSB0byBiZSB2ZXJ5IGNhcmVmdWwuXG4gICAgICAgIGlmIChjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZCAmJiBjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGRhdGEgb3Igbm90XG4gICAgICAgICAgICBuZXdEYXRhID0gc2VsZi5nZW5lcmF0ZUl0ZW1zSW50ZXJuYWwoY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQpO1xuICAgICAgICAgICAgc2VsZi5vblVwZGF0ZVZpZXcoe1xuICAgICAgICAgICAgICAgIGFkZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICdldmVudCcsXG4gICAgICAgICAgICAgICAgZGF0YTogbmV3RGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZGF0YS5hc3luY1ByZXBlbmQobmV3RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQgJiYgY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBuZXdEYXRhID0gc2VsZi5nZW5lcmF0ZUl0ZW1zSW50ZXJuYWwoY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZCk7XG4gICAgICAgICAgICBzZWxmLm9uVXBkYXRlVmlldyh7XG4gICAgICAgICAgICAgICAgcmVtb3ZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V2ZW50JyxcbiAgICAgICAgICAgICAgICBkYXRhOiBuZXdEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRkYXRhLmFzeW5jUG9wKG5ld0RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VTZXQuY2hhbmdlcy5tZXJnZWQgJiYgY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG5ld0RhdGEgPSBzZWxmLmdlbmVyYXRlSXRlbXNJbnRlcm5hbChjaGFuZ2VTZXQuY2hhbmdlcy5tZXJnZWQpO1xuICAgICAgICAgICAgc2VsZi5vblVwZGF0ZVZpZXcoe1xuICAgICAgICAgICAgICAgIG1lcmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V2ZW50JyxcbiAgICAgICAgICAgICAgICBkYXRhOiBuZXdEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRkYXRhLmFzeW5jUmVmcmVzaChuZXdEYXRhKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZS5cbiAgICAgKiBTbyB0aGF0IHdlIGNhbiBjbGVhbiB1cCB0aGUgdmlldyBkYXRhLlxuICAgICAqL1xuICAgIGxvYWRJbml0RGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3N1cGVyKCk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIHRvIGxpc3RlbiB0byB0aGUgY2hhbmdlIG9uIHRoZSBnbG9iYWwgcHJvdmlkZXIuXG4gICAgICogSXQgaXMgdXN1YWxseSB1c2VkIGludGVybmFsbHkgb24gc2V0dGluZyB1cCB0aGlzIG1lZGlhdG9yLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBnbG9iYWxQcm92aWRlclxuICAgICAqL1xuICAgIHN0YXJ0TGlzdGVuaW5nR2xvYmFsUHJvdmlkZXI6IGZ1bmN0aW9uKGdsb2JhbFByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IG9uVXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byBzY2hlZHVsZSBzdWNoIHVwZGF0ZSBzbyB0aGF0IHNvbWUgb3RoZXIgb3BlcmF0aW9ucyBjYW5cbiAgICAgICAgICAgIC8vIGJlZW4gY29tcGxldGVkIGZpcnN0LiBFLmcuLCBnZXRGb3JlaWduTW9kZWwgc2hvdWxkIGJlIHNldCB1cC5cbiAgICAgICAgICAgIF8uZGVmZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5vbkdsb2JhbFByb3ZpZGVyVXBkYXRlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuX2dsb2JhbFByb3ZpZGVyTGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgdXBkYXRlOiBvblVwZGF0ZVxuICAgICAgICB9O1xuICAgICAgICBzZWxmLl9nbG9iYWxQcm92aWRlciA9IGdsb2JhbFByb3ZpZGVyO1xuICAgICAgICBnbG9iYWxQcm92aWRlci5vbigndXBkYXRlJywgb25VcGRhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBsaXN0ZW5pbmcgdG8gdGhlIGNoYW5nZSBvbiB0aGUgZ2xvYmFsIHByb3ZpZGVyLlxuICAgICAqIEl0IGlzIHVzYWxseSB1c2VkIG9uIHRoZSB0ZWFyaW5nIGRvd24gdGhpcyBtZWRpYXRvci5cbiAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nR2xvYmFsUHJvdmlkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSBzZWxmLl9nbG9iYWxQcm92aWRlckxpc3RlbmVycztcbiAgICAgICAgY29uc3QgZ2xvYmFsUHJvdmlkZXIgPSBzZWxmLl9nbG9iYWxQcm92aWRlcjtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBnbG9iYWxQcm92aWRlci5vZmYoa2V5LCBsaXN0ZW5lcnNba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgdG8gbGlzdGVuIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIHZpZXcgZGF0YSBwcm92aWRlci5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbnZva2VkIG9uIGJpbmRpbmcgYSB2aWV3IHRvIHRoaXMgbWVkaWF0b3IuXG4gICAgICovXG4gICAgc3RhcnRMaXN0ZW5pbmdWaWV3UHJvdmlkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBvblVwZGF0ZSA9IGZ1bmN0aW9uKGV2dEN0eCwgY2hhbmdlU2V0LCByZXN0KSB7XG4gICAgICAgICAgICBzZWxmLm9uVmlld1Byb3ZpZGVyVXBkYXRlKGV2dEN0eCwgY2hhbmdlU2V0LCByZXN0KTtcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5fdmlld1Byb3ZpZGVyTGlzdGVuZXJzID0ge1xuICAgICAgICAgICAgdXBkYXRlOiBvblVwZGF0ZVxuICAgICAgICB9O1xuICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLm9uKCd1cGRhdGUnLCBvblVwZGF0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGxpc3RlbmluZyB0byB0aGUgY2hhbmdlIG9uIHRoZSB2aWV3IGRhdGEgcHJvdmlkZXIuXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW52b2tlZCBvbiB1bmJpbmRpbmcgYSB2aWV3IHRvIHRoaXMgbWVkaWF0b3IuXG4gICAgICovXG4gICAgc3RvcExpc3RlbmluZ1ZpZXdQcm92aWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHNlbGYuX3ZpZXdQcm92aWRlckxpc3RlbmVycztcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLm9mZihrZXksIGxpc3RlbmVyc1trZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZS5cbiAgICAgKiBDb21wYXJlZCBpdHMgYmFzZSBjb3VudGVycGFydCwgdGhpcyBtZXRob2QgcGVyZm9ybXMgYWRkaXRpb25hbFxuICAgICAqIGNoZWNraW5nIG9uIGdlbmVyYXRpbmcgZGF0YSBmb3IgdGhlIHZpZXcgbW9kdWxlLCBzbyB0aGF0IG5vIHJlcGVhdGVkXG4gICAgICogaXRlbXMgbWF5IGJlIGdlbmVyYXRlZC5cbiAgICAgKiBTaW1wbHkgYmVjYXVzZSwgdGhlIGRhdGEgaW4gdGhlIHZpZXcgbGV2ZWwgZGF0YSBpcyBkaXN0aW5jdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgc2FmZWx5UmVhZERhdGFQcm92aWRlcjogZnVuY3Rpb24oKTogYW55W10ge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBsZXQgbW9kZWxzID0gc2VsZi5fc3VwZXIoKTtcbiAgICAgICAgbW9kZWxzID0gXy5maWx0ZXIobW9kZWxzLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gIV8uc29tZShzZWxmLl92aWV3TGV2ZWxEYXRhLm1vZGVscywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmlkID09PSBlbGVtLmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTYWZlbHkgcHVzaCB0aGVzZSBtb2RlbHMgaW50byB2aWV3IGxldmVsIGRhdGEgcHJvdmlkZXJcbiAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5hZGQobW9kZWxzLCB7IHNpbGVudDogdHJ1ZSB9KTtcbiAgICAgICAgLy8gVGhlbiByZXR1cm5cbiAgICAgICAgcmV0dXJuIG1vZGVscztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUuXG4gICAgICogVGhpcyBtZXRob2QgdXNlcyB0aGUgZGF0YSBmcm9tIHRoZSB2aWV3IGxldmVsIGRhdGEsIGluc3RlYWQgb2YgdGhlXG4gICAgICogdGhlIGN1cnJlbnQgcmVtb3RlIGRhdGEgcHJvdmlkZXIsIHRvIGdlbmVyYXRlIHRoZSBsaXN0IG9mIGRhdGFcbiAgICAgKiB0byBiZSByZW5kZXJlZC5cbiAgICAgKi9cbiAgICByZW5kZXJEYXRhOiBmdW5jdGlvbihhc3luYz86IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgICRkYXRhLmNsZWFuKCk7XG4gICAgICAgICRkYXRhLmhhc01vcmVEYXRhKHNlbGYuX2RhdGFQcm92aWRlci5oYXNOZXh0UGFnZSgpKTtcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IHNlbGYuZ2VuZXJhdGVJdGVtc0ludGVybmFsKHNlbGYuX3ZpZXdMZXZlbERhdGEubW9kZWxzKTtcbiAgICAgICAgaWYgKGFzeW5jID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkZGF0YS5hc3luY1B1c2gobmV3RGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkZGF0YS5zeW5jUHVzaChuZXdEYXRhKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZVxuICAgICAqIEBwYXJhbSB7fSBvcHRpb25zXG4gICAgICovXG4gICAgc2V0VXA6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3VwZXIob3B0aW9ucyk7XG4gICAgICAgIGlmIChzZWxmLl9nbG9iYWxQcm92aWRlcikge1xuICAgICAgICAgICAgc2VsZi5zdGFydExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyKHNlbGYuX2dsb2JhbFByb3ZpZGVyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZVxuICAgICAqL1xuICAgIHRlYXJEb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgLy8gQ2FsbCBzdXBlclxuICAgICAgICBzZWxmLl9zdXBlcigpO1xuICAgICAgICAvLyBUZWFyIG9mZiB3aGF0IHdlIGludHJvZHVjZSBpbiB0aGlzIGNsYXNzXG4gICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEub2ZmKCdhbGwnKTtcbiAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5yZXNldCgpO1xuICAgICAgICAvLyBTdG9wIGxpc3RlbmluZyB0byB0aGUgZ2xvYmFsXG4gICAgICAgIGlmIChzZWxmLl9nbG9iYWxQcm92aWRlcikge1xuICAgICAgICAgICAgc2VsZi5zdG9wTGlzdGVuaW5nR2xvYmFsUHJvdmlkZXIoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZVxuICAgICAqL1xuICAgIGF0dGFjaFZpZXc6IGZ1bmN0aW9uKHZpZXdJbnN0YW5jZSkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zdXBlcih2aWV3SW5zdGFuY2UpO1xuICAgICAgICAvLyBTdGFydCB0byBsaXN0ZW4gdG8gY2hhbmdlcyBvbiB0aGUgdmlldyBkYXRhIHByb3ZpZGVyLlxuICAgICAgICBzZWxmLnN0YXJ0TGlzdGVuaW5nVmlld1Byb3ZpZGVyKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlXG4gICAgICovXG4gICAgZGV0YWNoVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3N1cGVyKCk7XG4gICAgICAgIHNlbGYuc3RvcExpc3RlbmluZ1ZpZXdQcm92aWRlcigpO1xuICAgIH1cbn0pO1xuIl19