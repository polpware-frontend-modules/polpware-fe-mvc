/**
 * @fileOverview
 * This module implements a list mediator that may quickly
 * get updated on any operation in this list.
 * E.g., add, remove, update
 */
import * as dependencies from '@polpware/fe-dependencies';
import { ListMediator } from './abstract-list';
const _ = dependencies.underscore;
const backbone = dependencies.backbone;
export const WritableListMediator = ListMediator.extend({
    Properties: 'viewLevelData,globalProvider',
    init: function (settings) {
        const self = this;
        self._super(settings);
        const CollectionCtor = backbone.Collection.extend();
        self._viewLevelData = new CollectionCtor();
        self._viewProviderListeners = {};
        self._globalProvider = settings.globalProvider || null;
        self._globalProviderListeners = {};
        self._filterFlags = settings.filterFlags || { added: true, removed: true, updated: true };
    },
    /**
     * A filter on the global data provider.
     * @returns {Boolean}
     */
    globalProviderFilter: function (evtCtx, changeSet, rest) {
        /*jslint unparam:true */
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
     * @param {Object} args
     */
    onGlobalProviderUpdate: function () {
        /*jslint unparam:true */
        const self = this;
        const args = arguments;
        // If we are loading data, the data we are receiving is
        // the result of the current loading behavior.
        // We do not need to do anything. Instead, the loading behavior
        // is responsible for rending data.
        if (self._isLoadingData) {
            return;
        }
        // Shortcircuit
        const changeSet = self.globalProviderFilter.apply(self, args);
        if (!changeSet) {
            return;
        }
        // The interface of changeSet is determined by the above filter
        // method. However, the below view provider listener must be careful.
        // Changes
        if (changeSet.add) {
            const candidate = _.filter(changeSet.changes.added, function (thisItem) {
                return !_.some(self._viewLevelData.models, function (thatItem) {
                    return thisItem.id === thatItem.id;
                });
            });
            if (candidate.length > 0) {
                _.each(candidate, function (v, k) {
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
     * @param {Object} args
     */
    onViewProviderUpdate: function (evtCtx, changeSet, rest) {
        /*jslint unparam:true */
        const self = this;
        const $data = self._viewInstance.$data;
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
        const self = this;
        self._viewLevelData.reset();
        return self._super();
    },
    /**
     * Starts to listen to the change on the global provider.
     * It is usually used internally on setting up this mediator.
     * @param {Object} globalProvider
     */
    startListeningGlobalProvider: function (globalProvider) {
        const self = this;
        const onUpdate = function () {
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
        const self = this;
        const listeners = self._globalProviderListeners;
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
        const self = this;
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
        const self = this;
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
     * @returns {Array}
     */
    safelyReadDataProvider: function () {
        const self = this;
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
        const self = this;
        const $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
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
     * @param {} options
     */
    setUp: function (options) {
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
        const self = this;
        self._super(viewInstance);
        // Start to listen to changes on the view data provider.
        self.startListeningViewProvider();
    },
    /**
     * Override
     */
    detachView: function () {
        const self = this;
        self._super();
        self.stopListeningViewProvider();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGFibGUtYWJzdHJhY3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Bwb2xwd2FyZS9mZS1tdmMvIiwic291cmNlcyI6WyJsaWIvbWVkaWF0b3JzL3dyaXRhYmxlLWFic3RyYWN0LWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFHSCxPQUFPLEtBQUssWUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFDSCxZQUFZLEVBSWYsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QixNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0FBQ2xDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7QUF3RHZDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFFcEQsVUFBVSxFQUFFLDhCQUE4QjtJQUUxQyxJQUFJLEVBQUUsVUFBUyxRQUEwQztRQUNyRCxNQUFNLElBQUksR0FBNkIsSUFBSSxDQUFDO1FBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEIsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNwRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDO1FBQ3ZELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM5RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsb0JBQW9C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ICogQGZpbGVPdmVydmlld1xuICogVGhpcyBtb2R1bGUgaW1wbGVtZW50cyBhIGxpc3QgbWVkaWF0b3IgdGhhdCBtYXkgcXVpY2tseVxuICogZ2V0IHVwZGF0ZWQgb24gYW55IG9wZXJhdGlvbiBpbiB0aGlzIGxpc3QuXG4gKiBFLmcuLCBhZGQsIHJlbW92ZSwgdXBkYXRlXG4gKi9cblxuXG5pbXBvcnQgKiBhcyBkZXBlbmRlbmNpZXMgZnJvbSAnQHBvbHB3YXJlL2ZlLWRlcGVuZGVuY2llcyc7XG5pbXBvcnQge1xuICAgIExpc3RNZWRpYXRvcixcbiAgICBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMsXG4gICAgSUxpc3RNZWRpYXRvclB1YmxpYyxcbiAgICBJTGlzdE1lZGlhdG9yRGV2XG59IGZyb20gJy4vYWJzdHJhY3QtbGlzdCc7XG5cbmNvbnN0IF8gPSBkZXBlbmRlbmNpZXMudW5kZXJzY29yZTtcbmNvbnN0IGJhY2tib25lID0gZGVwZW5kZW5jaWVzLmJhY2tib25lO1xuXG5leHBvcnQgaW50ZXJmYWNlIElDaGFuZ2VTZXQge1xuICAgIGNoYW5nZXM6IHtcbiAgICAgICAgYWRkZWQ6IGFueVtdLFxuICAgICAgICByZW1vdmVkOiBhbnlbXSxcbiAgICAgICAgbWVyZ2VkOiBhbnlbXVxuICAgIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdyaXRhYmxlTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnNcbiAgICBleHRlbmRzIElMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucyB7XG4gICAgZ2xvYmFsUHJvdmlkZXI/OiBhbnk7XG4gICAgZmlsdGVyRmxhZ3M/OiB7XG4gICAgICAgIGFkZGVkPzogYm9vbGVhbixcbiAgICAgICAgcmVtb3ZlZD86IGJvb2xlYW4sXG4gICAgICAgIHVwZGF0ZWQ/OiBib29sZWFuXG4gICAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJV3JpdGFibGVMaXN0TWVkaWF0b3JQdWJsaWNcbiAgICBleHRlbmRzIElMaXN0TWVkaWF0b3JQdWJsaWMge1xuXG4gICAgdmlld0xldmVsRGF0YSh2YWx1ZT86IGFueSk6IGFueTtcbiAgICBnbG9iYWxQcm92aWRlcih2YWx1ZT86IGFueSk6IGFueTtcblxuICAgIGdsb2JhbFByb3ZpZGVyRmlsdGVyKGV2dEN0eDogYW55LCBjaGFuZ2VTZXQ6IElDaGFuZ2VTZXQsIHJlc3Q6IGFueSk6IElDaGFuZ2VTZXQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2IGV4dGVuZHMgSUxpc3RNZWRpYXRvckRldiB7XG4gICAgX3ZpZXdMZXZlbERhdGE6IGFueTtcbiAgICBfdmlld1Byb3ZpZGVyTGlzdGVuZXJzOiBhbnk7XG4gICAgX2dsb2JhbFByb3ZpZGVyOiBhbnk7XG4gICAgX2dsb2JhbFByb3ZpZGVyTGlzdGVuZXJzOiBhbnk7XG4gICAgX2ZpbHRlckZsYWdzOiB7XG4gICAgICAgIGFkZGVkPzogYm9vbGVhbixcbiAgICAgICAgcmVtb3ZlZD86IGJvb2xlYW4sXG4gICAgICAgIHVwZGF0ZWQ/OiBib29sZWFuXG4gICAgfTtcblxuICAgIF9zdXBlcih2YWx1ZT86IGFueSk6IGFueTtcblxuICAgIGdsb2JhbFByb3ZpZGVyRmlsdGVyKGV2dEN0eDogYW55LCBjaGFuZ2VTZXQ6IElDaGFuZ2VTZXQsIHJlc3Q6IGFueSk6IElDaGFuZ2VTZXQ7XG4gICAgb25HbG9iYWxQcm92aWRlclVwZGF0ZSgpO1xuXG4gICAgb25WaWV3UHJvdmlkZXJVcGRhdGUoZXZ0Q3R4OiBhbnksIGNoYW5nZVNldDogSUNoYW5nZVNldCwgcmVzdDogYW55KTogdm9pZDtcblxuICAgIHN0YXJ0TGlzdGVuaW5nR2xvYmFsUHJvdmlkZXIoZ2xvYmFsUHJvdmlkZXIpO1xuICAgIHN0b3BMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcigpO1xuXG4gICAgc3RhcnRMaXN0ZW5pbmdWaWV3UHJvdmlkZXIoKTtcbiAgICBzdG9wTGlzdGVuaW5nVmlld1Byb3ZpZGVyKCk7XG5cbiAgICBmaW5kQXRJbmRleChuZXdNb2RlbDogYW55KTogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgV3JpdGFibGVMaXN0TWVkaWF0b3IgPSBMaXN0TWVkaWF0b3IuZXh0ZW5kKHtcblxuICAgIFByb3BlcnRpZXM6ICd2aWV3TGV2ZWxEYXRhLGdsb2JhbFByb3ZpZGVyJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHNldHRpbmdzOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zdXBlcihzZXR0aW5ncyk7XG5cbiAgICAgICAgY29uc3QgQ29sbGVjdGlvbkN0b3IgPSBiYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCgpO1xuICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhID0gbmV3IENvbGxlY3Rpb25DdG9yKCk7XG4gICAgICAgIHNlbGYuX3ZpZXdQcm92aWRlckxpc3RlbmVycyA9IHt9O1xuICAgICAgICBzZWxmLl9nbG9iYWxQcm92aWRlciA9IHNldHRpbmdzLmdsb2JhbFByb3ZpZGVyIHx8IG51bGw7XG4gICAgICAgIHNlbGYuX2dsb2JhbFByb3ZpZGVyTGlzdGVuZXJzID0ge307XG4gICAgICAgIHNlbGYuX2ZpbHRlckZsYWdzID0gc2V0dGluZ3MuZmlsdGVyRmxhZ3MgfHwgeyBhZGRlZDogdHJ1ZSwgcmVtb3ZlZDogdHJ1ZSwgdXBkYXRlZDogdHJ1ZSB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBIGZpbHRlciBvbiB0aGUgZ2xvYmFsIGRhdGEgcHJvdmlkZXIuXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgZ2xvYmFsUHJvdmlkZXJGaWx0ZXI6IGZ1bmN0aW9uKGV2dEN0eDogYW55LCBjaGFuZ2VTZXQ6IElDaGFuZ2VTZXQsIHJlc3Q6IGFueSk6IElDaGFuZ2VTZXQge1xuICAgICAgICAvKmpzbGludCB1bnBhcmFtOnRydWUgKi9cbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYuX2ZpbHRlckZsYWdzLmFkZGVkICYmXG4gICAgICAgICAgICBjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZCAmJlxuICAgICAgICAgICAgY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZVNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5fZmlsdGVyRmxhZ3MucmVtb3ZlZCAmJlxuICAgICAgICAgICAgY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZCAmJlxuICAgICAgICAgICAgY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlU2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLl9maWx0ZXJGbGFncy51cGRhdGVkICYmXG4gICAgICAgICAgICBjaGFuZ2VTZXQuY2hhbmdlcy5tZXJnZWQgJiZcbiAgICAgICAgICAgIGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlU2V0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cblxuICAgIGZpbmRBdEluZGV4OiBmdW5jdGlvbihuZXdNb2RlbCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW4gaW50ZXJuYWwgbWV0aG9kIGZvciBsaXN0ZW5pbmcgdG8gYW55IGNoYW5nZSBvbiB0aGVcbiAgICAgKiBnbG9iYWwgcHJvdmlkZXIuIExpc3RlbmluZyB0byB0aGUgc29sZSB1cGRhdGUgZXZlbnQgaXNcbiAgICAgKiBzdWZmaWNpZW50IGFuZCBlZmZpY2VudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYXJnc1xuICAgICAqL1xuICAgIG9uR2xvYmFsUHJvdmlkZXJVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKmpzbGludCB1bnBhcmFtOnRydWUgKi9cbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgICAvLyBJZiB3ZSBhcmUgbG9hZGluZyBkYXRhLCB0aGUgZGF0YSB3ZSBhcmUgcmVjZWl2aW5nIGlzXG4gICAgICAgIC8vIHRoZSByZXN1bHQgb2YgdGhlIGN1cnJlbnQgbG9hZGluZyBiZWhhdmlvci5cbiAgICAgICAgLy8gV2UgZG8gbm90IG5lZWQgdG8gZG8gYW55dGhpbmcuIEluc3RlYWQsIHRoZSBsb2FkaW5nIGJlaGF2aW9yXG4gICAgICAgIC8vIGlzIHJlc3BvbnNpYmxlIGZvciByZW5kaW5nIGRhdGEuXG4gICAgICAgIGlmIChzZWxmLl9pc0xvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2hvcnRjaXJjdWl0XG4gICAgICAgIGNvbnN0IGNoYW5nZVNldCA9IHNlbGYuZ2xvYmFsUHJvdmlkZXJGaWx0ZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIGlmICghY2hhbmdlU2V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGhlIGludGVyZmFjZSBvZiBjaGFuZ2VTZXQgaXMgZGV0ZXJtaW5lZCBieSB0aGUgYWJvdmUgZmlsdGVyXG4gICAgICAgIC8vIG1ldGhvZC4gSG93ZXZlciwgdGhlIGJlbG93IHZpZXcgcHJvdmlkZXIgbGlzdGVuZXIgbXVzdCBiZSBjYXJlZnVsLlxuICAgICAgICAvLyBDaGFuZ2VzXG4gICAgICAgIGlmIChjaGFuZ2VTZXQuYWRkKSB7XG4gICAgICAgICAgICBjb25zdCBjYW5kaWRhdGUgPSBfLmZpbHRlcihjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZCwgZnVuY3Rpb24odGhpc0l0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIV8uc29tZShzZWxmLl92aWV3TGV2ZWxEYXRhLm1vZGVscywgZnVuY3Rpb24odGhhdEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNJdGVtLmlkID09PSB0aGF0SXRlbS5pZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKGNhbmRpZGF0ZSwgZnVuY3Rpb24odiwgaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhdEluZGV4ID0gc2VsZi5maW5kQXRJbmRleCh2KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0SW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLmFkZCh2LCB7IGF0OiBhdEluZGV4IH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5hZGQodik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlU2V0LnJlbW92ZSkge1xuICAgICAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5yZW1vdmUoY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZVNldC5tZXJnZSkge1xuICAgICAgICAgICAgLy8gS2VlcCBwcm9wYWdhdGluZ1xuICAgICAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS50cmlnZ2VyKCd1cGRhdGUnLCBjaGFuZ2VTZXQuY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQW4gaW50ZXJuYWwgbWV0aG9kIGZvciBsaXN0ZW5pbmcgdG8gdGhlIGNoYW5nZSBvbiB0aGUgdmlld1xuICAgICAqIGRhdGEgcHJvdmlkZXIuIFVzdWFsbHksIHN1Y2gga2luZCBvZiBsaXN0ZW5pbmcgc2hhbGwgYmUgc3RvcHBlZFxuICAgICAqIHdoZW4gdGhlcmUgaXMgbm8gdmlldyBiaW5kaW5nIHRvIHRoZSBjdXJyZW50IG1pZGlhdG9yIGxpc3QuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3NcbiAgICAgKi9cbiAgICBvblZpZXdQcm92aWRlclVwZGF0ZTogZnVuY3Rpb24oZXZ0Q3R4OiBhbnksIGNoYW5nZVNldDogSUNoYW5nZVNldCwgcmVzdDogYW55KTogdm9pZCB7XG4gICAgICAgIC8qanNsaW50IHVucGFyYW06dHJ1ZSAqL1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgbGV0IG5ld0RhdGE6IGFueTtcbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSBpbnRlcmZhY2Ugb2YgY2hhbmdlU2V0IHZhcmllcyBmcm9tXG4gICAgICAgIC8vIGV2ZW50cyB0byBldmVudHMgaW4gQmFja2JvbmUuIFdlIGhhdmUgdG8gYmUgdmVyeSBjYXJlZnVsLlxuICAgICAgICBpZiAoY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQgJiYgY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBkYXRhIG9yIG5vdFxuICAgICAgICAgICAgbmV3RGF0YSA9IHNlbGYuZ2VuZXJhdGVJdGVtc0ludGVybmFsKGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkKTtcbiAgICAgICAgICAgIHNlbGYub25VcGRhdGVWaWV3KHtcbiAgICAgICAgICAgICAgICBhZGQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnZXZlbnQnLFxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld0RhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGRhdGEuYXN5bmNQcmVwZW5kKG5ld0RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkICYmIGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbmV3RGF0YSA9IHNlbGYuZ2VuZXJhdGVJdGVtc0ludGVybmFsKGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQpO1xuICAgICAgICAgICAgc2VsZi5vblVwZGF0ZVZpZXcoe1xuICAgICAgICAgICAgICAgIHJlbW92ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICdldmVudCcsXG4gICAgICAgICAgICAgICAgZGF0YTogbmV3RGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZGF0YS5hc3luY1BvcChuZXdEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkICYmIGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBuZXdEYXRhID0gc2VsZi5nZW5lcmF0ZUl0ZW1zSW50ZXJuYWwoY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkKTtcbiAgICAgICAgICAgIHNlbGYub25VcGRhdGVWaWV3KHtcbiAgICAgICAgICAgICAgICBtZXJnZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICdldmVudCcsXG4gICAgICAgICAgICAgICAgZGF0YTogbmV3RGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZGF0YS5hc3luY1JlZnJlc2gobmV3RGF0YSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUuXG4gICAgICogU28gdGhhdCB3ZSBjYW4gY2xlYW4gdXAgdGhlIHZpZXcgZGF0YS5cbiAgICAgKi9cbiAgICBsb2FkSW5pdERhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLnJlc2V0KCk7XG4gICAgICAgIHJldHVybiBzZWxmLl9zdXBlcigpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyB0byBsaXN0ZW4gdG8gdGhlIGNoYW5nZSBvbiB0aGUgZ2xvYmFsIHByb3ZpZGVyLlxuICAgICAqIEl0IGlzIHVzdWFsbHkgdXNlZCBpbnRlcm5hbGx5IG9uIHNldHRpbmcgdXAgdGhpcyBtZWRpYXRvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ2xvYmFsUHJvdmlkZXJcbiAgICAgKi9cbiAgICBzdGFydExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyOiBmdW5jdGlvbihnbG9iYWxQcm92aWRlcikge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBvblVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gc2NoZWR1bGUgc3VjaCB1cGRhdGUgc28gdGhhdCBzb21lIG90aGVyIG9wZXJhdGlvbnMgY2FuXG4gICAgICAgICAgICAvLyBiZWVuIGNvbXBsZXRlZCBmaXJzdC4gRS5nLiwgZ2V0Rm9yZWlnbk1vZGVsIHNob3VsZCBiZSBzZXQgdXAuXG4gICAgICAgICAgICBfLmRlZmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYub25HbG9iYWxQcm92aWRlclVwZGF0ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBzZWxmLl9nbG9iYWxQcm92aWRlckxpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIHVwZGF0ZTogb25VcGRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5fZ2xvYmFsUHJvdmlkZXIgPSBnbG9iYWxQcm92aWRlcjtcbiAgICAgICAgZ2xvYmFsUHJvdmlkZXIub24oJ3VwZGF0ZScsIG9uVXBkYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgbGlzdGVuaW5nIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIGdsb2JhbCBwcm92aWRlci5cbiAgICAgKiBJdCBpcyB1c2FsbHkgdXNlZCBvbiB0aGUgdGVhcmluZyBkb3duIHRoaXMgbWVkaWF0b3IuXG4gICAgICovXG4gICAgc3RvcExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gc2VsZi5fZ2xvYmFsUHJvdmlkZXJMaXN0ZW5lcnM7XG4gICAgICAgIGNvbnN0IGdsb2JhbFByb3ZpZGVyID0gc2VsZi5fZ2xvYmFsUHJvdmlkZXI7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGxpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsUHJvdmlkZXIub2ZmKGtleSwgbGlzdGVuZXJzW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHRvIGxpc3RlbiB0byB0aGUgY2hhbmdlIG9uIHRoZSB2aWV3IGRhdGEgcHJvdmlkZXIuXG4gICAgICogVGhpcyBtZXRob2QgaXMgaW52b2tlZCBvbiBiaW5kaW5nIGEgdmlldyB0byB0aGlzIG1lZGlhdG9yLlxuICAgICAqL1xuICAgIHN0YXJ0TGlzdGVuaW5nVmlld1Byb3ZpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3Qgb25VcGRhdGUgPSBmdW5jdGlvbihldnRDdHgsIGNoYW5nZVNldCwgcmVzdCkge1xuICAgICAgICAgICAgc2VsZi5vblZpZXdQcm92aWRlclVwZGF0ZShldnRDdHgsIGNoYW5nZVNldCwgcmVzdCk7XG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuX3ZpZXdQcm92aWRlckxpc3RlbmVycyA9IHtcbiAgICAgICAgICAgIHVwZGF0ZTogb25VcGRhdGVcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5vbigndXBkYXRlJywgb25VcGRhdGUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBsaXN0ZW5pbmcgdG8gdGhlIGNoYW5nZSBvbiB0aGUgdmlldyBkYXRhIHByb3ZpZGVyLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGludm9rZWQgb24gdW5iaW5kaW5nIGEgdmlldyB0byB0aGlzIG1lZGlhdG9yLlxuICAgICAqL1xuICAgIHN0b3BMaXN0ZW5pbmdWaWV3UHJvdmlkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSBzZWxmLl92aWV3UHJvdmlkZXJMaXN0ZW5lcnM7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGxpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5vZmYoa2V5LCBsaXN0ZW5lcnNba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGUuXG4gICAgICogQ29tcGFyZWQgaXRzIGJhc2UgY291bnRlcnBhcnQsIHRoaXMgbWV0aG9kIHBlcmZvcm1zIGFkZGl0aW9uYWxcbiAgICAgKiBjaGVja2luZyBvbiBnZW5lcmF0aW5nIGRhdGEgZm9yIHRoZSB2aWV3IG1vZHVsZSwgc28gdGhhdCBubyByZXBlYXRlZFxuICAgICAqIGl0ZW1zIG1heSBiZSBnZW5lcmF0ZWQuXG4gICAgICogU2ltcGx5IGJlY2F1c2UsIHRoZSBkYXRhIGluIHRoZSB2aWV3IGxldmVsIGRhdGEgaXMgZGlzdGluY3QuXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIHNhZmVseVJlYWREYXRhUHJvdmlkZXI6IGZ1bmN0aW9uKCk6IGFueVtdIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgbGV0IG1vZGVscyA9IHNlbGYuX3N1cGVyKCk7XG4gICAgICAgIG1vZGVscyA9IF8uZmlsdGVyKG1vZGVscywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgcmV0dXJuICFfLnNvbWUoc2VsZi5fdmlld0xldmVsRGF0YS5tb2RlbHMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5pZCA9PT0gZWxlbS5pZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2FmZWx5IHB1c2ggdGhlc2UgbW9kZWxzIGludG8gdmlldyBsZXZlbCBkYXRhIHByb3ZpZGVyXG4gICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEuYWRkKG1vZGVscywgeyBzaWxlbnQ6IHRydWUgfSk7XG4gICAgICAgIC8vIFRoZW4gcmV0dXJuXG4gICAgICAgIHJldHVybiBtb2RlbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlLlxuICAgICAqIFRoaXMgbWV0aG9kIHVzZXMgdGhlIGRhdGEgZnJvbSB0aGUgdmlldyBsZXZlbCBkYXRhLCBpbnN0ZWFkIG9mIHRoZVxuICAgICAqIHRoZSBjdXJyZW50IHJlbW90ZSBkYXRhIHByb3ZpZGVyLCB0byBnZW5lcmF0ZSB0aGUgbGlzdCBvZiBkYXRhXG4gICAgICogdG8gYmUgcmVuZGVyZWQuXG4gICAgICovXG4gICAgcmVuZGVyRGF0YTogZnVuY3Rpb24oYXN5bmM/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICAkZGF0YS5jbGVhbigpO1xuICAgICAgICAkZGF0YS5oYXNNb3JlRGF0YShzZWxmLl9kYXRhUHJvdmlkZXIuaGFzTmV4dFBhZ2UoKSk7XG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSBzZWxmLmdlbmVyYXRlSXRlbXNJbnRlcm5hbChzZWxmLl92aWV3TGV2ZWxEYXRhLm1vZGVscyk7XG4gICAgICAgIGlmIChhc3luYyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJGRhdGEuYXN5bmNQdXNoKG5ld0RhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGRhdGEuc3luY1B1c2gobmV3RGF0YSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge30gb3B0aW9uc1xuICAgICAqL1xuICAgIHNldFVwOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3N1cGVyKG9wdGlvbnMpO1xuICAgICAgICBpZiAoc2VsZi5fZ2xvYmFsUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHNlbGYuc3RhcnRMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcihzZWxmLl9nbG9iYWxQcm92aWRlcik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGVcbiAgICAgKi9cbiAgICB0ZWFyRG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIC8vIENhbGwgc3VwZXJcbiAgICAgICAgc2VsZi5fc3VwZXIoKTtcbiAgICAgICAgLy8gVGVhciBvZmYgd2hhdCB3ZSBpbnRyb2R1Y2UgaW4gdGhpcyBjbGFzc1xuICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLm9mZignYWxsJyk7XG4gICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEucmVzZXQoKTtcbiAgICAgICAgLy8gU3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGdsb2JhbFxuICAgICAgICBpZiAoc2VsZi5fZ2xvYmFsUHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHNlbGYuc3RvcExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGVcbiAgICAgKi9cbiAgICBhdHRhY2hWaWV3OiBmdW5jdGlvbih2aWV3SW5zdGFuY2UpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3VwZXIodmlld0luc3RhbmNlKTtcbiAgICAgICAgLy8gU3RhcnQgdG8gbGlzdGVuIHRvIGNoYW5nZXMgb24gdGhlIHZpZXcgZGF0YSBwcm92aWRlci5cbiAgICAgICAgc2VsZi5zdGFydExpc3RlbmluZ1ZpZXdQcm92aWRlcigpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZVxuICAgICAqL1xuICAgIGRldGFjaFZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zdXBlcigpO1xuICAgICAgICBzZWxmLnN0b3BMaXN0ZW5pbmdWaWV3UHJvdmlkZXIoKTtcbiAgICB9XG59KTtcbiJdfQ==