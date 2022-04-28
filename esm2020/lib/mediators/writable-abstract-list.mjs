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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGFibGUtYWJzdHJhY3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvbHB3YXJlL2ZlLW12Yy9zcmMvbGliL21lZGlhdG9ycy93cml0YWJsZS1hYnN0cmFjdC1saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBR0gsT0FBTyxLQUFLLFlBQVksTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQ0gsWUFBWSxFQUlmLE1BQU0saUJBQWlCLENBQUM7QUFFekIsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO0FBd0R2QyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBRXBELFVBQVUsRUFBRSw4QkFBOEI7SUFFMUMsSUFBSSxFQUFFLFVBQVMsUUFBMEM7UUFDckQsTUFBTSxJQUFJLEdBQTZCLElBQUksQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXRCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQztRQUN2RCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFdBQVcsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDOUYsQ0FB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LCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlT3ZlcnZpZXdcbiAqIFRoaXMgbW9kdWxlIGltcGxlbWVudHMgYSBsaXN0IG1lZGlhdG9yIHRoYXQgbWF5IHF1aWNrbHlcbiAqIGdldCB1cGRhdGVkIG9uIGFueSBvcGVyYXRpb24gaW4gdGhpcyBsaXN0LlxuICogRS5nLiwgYWRkLCByZW1vdmUsIHVwZGF0ZVxuICovXG5cblxuaW1wb3J0ICogYXMgZGVwZW5kZW5jaWVzIGZyb20gJ0Bwb2xwd2FyZS9mZS1kZXBlbmRlbmNpZXMnO1xuaW1wb3J0IHtcbiAgICBMaXN0TWVkaWF0b3IsXG4gICAgSUxpc3RNZWRpYXRvckN0b3JPcHRpb25zLFxuICAgIElMaXN0TWVkaWF0b3JQdWJsaWMsXG4gICAgSUxpc3RNZWRpYXRvckRldlxufSBmcm9tICcuL2Fic3RyYWN0LWxpc3QnO1xuXG5jb25zdCBfID0gZGVwZW5kZW5jaWVzLnVuZGVyc2NvcmU7XG5jb25zdCBiYWNrYm9uZSA9IGRlcGVuZGVuY2llcy5iYWNrYm9uZTtcblxuZXhwb3J0IGludGVyZmFjZSBJQ2hhbmdlU2V0IHtcbiAgICBjaGFuZ2VzOiB7XG4gICAgICAgIGFkZGVkOiBhbnlbXSxcbiAgICAgICAgcmVtb3ZlZDogYW55W10sXG4gICAgICAgIG1lcmdlZDogYW55W11cbiAgICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXcml0YWJsZUxpc3RNZWRpYXRvckN0b3JPcHRpb25zXG4gICAgZXh0ZW5kcyBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMge1xuICAgIGdsb2JhbFByb3ZpZGVyPzogYW55O1xuICAgIGZpbHRlckZsYWdzPzoge1xuICAgICAgICBhZGRlZD86IGJvb2xlYW4sXG4gICAgICAgIHJlbW92ZWQ/OiBib29sZWFuLFxuICAgICAgICB1cGRhdGVkPzogYm9vbGVhblxuICAgIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdyaXRhYmxlTGlzdE1lZGlhdG9yUHVibGljXG4gICAgZXh0ZW5kcyBJTGlzdE1lZGlhdG9yUHVibGljIHtcblxuICAgIHZpZXdMZXZlbERhdGEodmFsdWU/OiBhbnkpOiBhbnk7XG4gICAgZ2xvYmFsUHJvdmlkZXIodmFsdWU/OiBhbnkpOiBhbnk7XG5cbiAgICBnbG9iYWxQcm92aWRlckZpbHRlcihldnRDdHg6IGFueSwgY2hhbmdlU2V0OiBJQ2hhbmdlU2V0LCByZXN0OiBhbnkpOiBJQ2hhbmdlU2V0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXcml0YWJsZUxpc3RNZWRpYXRvckRldiBleHRlbmRzIElMaXN0TWVkaWF0b3JEZXYge1xuICAgIF92aWV3TGV2ZWxEYXRhOiBhbnk7XG4gICAgX3ZpZXdQcm92aWRlckxpc3RlbmVyczogYW55O1xuICAgIF9nbG9iYWxQcm92aWRlcjogYW55O1xuICAgIF9nbG9iYWxQcm92aWRlckxpc3RlbmVyczogYW55O1xuICAgIF9maWx0ZXJGbGFnczoge1xuICAgICAgICBhZGRlZD86IGJvb2xlYW4sXG4gICAgICAgIHJlbW92ZWQ/OiBib29sZWFuLFxuICAgICAgICB1cGRhdGVkPzogYm9vbGVhblxuICAgIH07XG5cbiAgICBfc3VwZXIodmFsdWU/OiBhbnkpOiBhbnk7XG5cbiAgICBnbG9iYWxQcm92aWRlckZpbHRlcihldnRDdHg6IGFueSwgY2hhbmdlU2V0OiBJQ2hhbmdlU2V0LCByZXN0OiBhbnkpOiBJQ2hhbmdlU2V0O1xuICAgIG9uR2xvYmFsUHJvdmlkZXJVcGRhdGUoKTtcblxuICAgIG9uVmlld1Byb3ZpZGVyVXBkYXRlKGV2dEN0eDogYW55LCBjaGFuZ2VTZXQ6IElDaGFuZ2VTZXQsIHJlc3Q6IGFueSk6IHZvaWQ7XG5cbiAgICBzdGFydExpc3RlbmluZ0dsb2JhbFByb3ZpZGVyKGdsb2JhbFByb3ZpZGVyKTtcbiAgICBzdG9wTGlzdGVuaW5nR2xvYmFsUHJvdmlkZXIoKTtcblxuICAgIHN0YXJ0TGlzdGVuaW5nVmlld1Byb3ZpZGVyKCk7XG4gICAgc3RvcExpc3RlbmluZ1ZpZXdQcm92aWRlcigpO1xuXG4gICAgZmluZEF0SW5kZXgobmV3TW9kZWw6IGFueSk6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IFdyaXRhYmxlTGlzdE1lZGlhdG9yID0gTGlzdE1lZGlhdG9yLmV4dGVuZCh7XG5cbiAgICBQcm9wZXJ0aWVzOiAndmlld0xldmVsRGF0YSxnbG9iYWxQcm92aWRlcicsXG5cbiAgICBpbml0OiBmdW5jdGlvbihzZXR0aW5nczogSVdyaXRhYmxlTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3VwZXIoc2V0dGluZ3MpO1xuXG4gICAgICAgIGNvbnN0IENvbGxlY3Rpb25DdG9yID0gYmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoKTtcbiAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YSA9IG5ldyBDb2xsZWN0aW9uQ3RvcigpO1xuICAgICAgICBzZWxmLl92aWV3UHJvdmlkZXJMaXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgc2VsZi5fZ2xvYmFsUHJvdmlkZXIgPSBzZXR0aW5ncy5nbG9iYWxQcm92aWRlciB8fCBudWxsO1xuICAgICAgICBzZWxmLl9nbG9iYWxQcm92aWRlckxpc3RlbmVycyA9IHt9O1xuICAgICAgICBzZWxmLl9maWx0ZXJGbGFncyA9IHNldHRpbmdzLmZpbHRlckZsYWdzIHx8IHsgYWRkZWQ6IHRydWUsIHJlbW92ZWQ6IHRydWUsIHVwZGF0ZWQ6IHRydWUgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQSBmaWx0ZXIgb24gdGhlIGdsb2JhbCBkYXRhIHByb3ZpZGVyLlxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGdsb2JhbFByb3ZpZGVyRmlsdGVyOiBmdW5jdGlvbihldnRDdHg6IGFueSwgY2hhbmdlU2V0OiBJQ2hhbmdlU2V0LCByZXN0OiBhbnkpOiBJQ2hhbmdlU2V0IHtcbiAgICAgICAgLypqc2xpbnQgdW5wYXJhbTp0cnVlICovXG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLl9maWx0ZXJGbGFncy5hZGRlZCAmJlxuICAgICAgICAgICAgY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQgJiZcbiAgICAgICAgICAgIGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjaGFuZ2VTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGYuX2ZpbHRlckZsYWdzLnJlbW92ZWQgJiZcbiAgICAgICAgICAgIGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQgJiZcbiAgICAgICAgICAgIGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZVNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5fZmlsdGVyRmxhZ3MudXBkYXRlZCAmJlxuICAgICAgICAgICAgY2hhbmdlU2V0LmNoYW5nZXMubWVyZ2VkICYmXG4gICAgICAgICAgICBjaGFuZ2VTZXQuY2hhbmdlcy5tZXJnZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZVNldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG5cbiAgICBmaW5kQXRJbmRleDogZnVuY3Rpb24obmV3TW9kZWwpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuIGludGVybmFsIG1ldGhvZCBmb3IgbGlzdGVuaW5nIHRvIGFueSBjaGFuZ2Ugb24gdGhlXG4gICAgICogZ2xvYmFsIHByb3ZpZGVyLiBMaXN0ZW5pbmcgdG8gdGhlIHNvbGUgdXBkYXRlIGV2ZW50IGlzXG4gICAgICogc3VmZmljaWVudCBhbmQgZWZmaWNlbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFyZ3NcbiAgICAgKi9cbiAgICBvbkdsb2JhbFByb3ZpZGVyVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLypqc2xpbnQgdW5wYXJhbTp0cnVlICovXG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgLy8gSWYgd2UgYXJlIGxvYWRpbmcgZGF0YSwgdGhlIGRhdGEgd2UgYXJlIHJlY2VpdmluZyBpc1xuICAgICAgICAvLyB0aGUgcmVzdWx0IG9mIHRoZSBjdXJyZW50IGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgICAgIC8vIFdlIGRvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nLiBJbnN0ZWFkLCB0aGUgbG9hZGluZyBiZWhhdmlvclxuICAgICAgICAvLyBpcyByZXNwb25zaWJsZSBmb3IgcmVuZGluZyBkYXRhLlxuICAgICAgICBpZiAoc2VsZi5faXNMb2FkaW5nRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNob3J0Y2lyY3VpdFxuICAgICAgICBjb25zdCBjaGFuZ2VTZXQgPSBzZWxmLmdsb2JhbFByb3ZpZGVyRmlsdGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICBpZiAoIWNoYW5nZVNldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoZSBpbnRlcmZhY2Ugb2YgY2hhbmdlU2V0IGlzIGRldGVybWluZWQgYnkgdGhlIGFib3ZlIGZpbHRlclxuICAgICAgICAvLyBtZXRob2QuIEhvd2V2ZXIsIHRoZSBiZWxvdyB2aWV3IHByb3ZpZGVyIGxpc3RlbmVyIG11c3QgYmUgY2FyZWZ1bC5cbiAgICAgICAgLy8gQ2hhbmdlc1xuICAgICAgICBpZiAoY2hhbmdlU2V0LmFkZCkge1xuICAgICAgICAgICAgY29uc3QgY2FuZGlkYXRlID0gXy5maWx0ZXIoY2hhbmdlU2V0LmNoYW5nZXMuYWRkZWQsIGZ1bmN0aW9uKHRoaXNJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFfLnNvbWUoc2VsZi5fdmlld0xldmVsRGF0YS5tb2RlbHMsIGZ1bmN0aW9uKHRoYXRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzSXRlbS5pZCA9PT0gdGhhdEl0ZW0uaWQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIF8uZWFjaChjYW5kaWRhdGUsIGZ1bmN0aW9uKHYsIGspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXRJbmRleCA9IHNlbGYuZmluZEF0SW5kZXgodik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5hZGQodiwgeyBhdDogYXRJbmRleCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEuYWRkKHYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZVNldC5yZW1vdmUpIHtcbiAgICAgICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEucmVtb3ZlKGNoYW5nZVNldC5jaGFuZ2VzLnJlbW92ZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VTZXQubWVyZ2UpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgcHJvcGFnYXRpbmdcbiAgICAgICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEudHJpZ2dlcigndXBkYXRlJywgY2hhbmdlU2V0LmNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFuIGludGVybmFsIG1ldGhvZCBmb3IgbGlzdGVuaW5nIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIHZpZXdcbiAgICAgKiBkYXRhIHByb3ZpZGVyLiBVc3VhbGx5LCBzdWNoIGtpbmQgb2YgbGlzdGVuaW5nIHNoYWxsIGJlIHN0b3BwZWRcbiAgICAgKiB3aGVuIHRoZXJlIGlzIG5vIHZpZXcgYmluZGluZyB0byB0aGUgY3VycmVudCBtaWRpYXRvciBsaXN0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBhcmdzXG4gICAgICovXG4gICAgb25WaWV3UHJvdmlkZXJVcGRhdGU6IGZ1bmN0aW9uKGV2dEN0eDogYW55LCBjaGFuZ2VTZXQ6IElDaGFuZ2VTZXQsIHJlc3Q6IGFueSk6IHZvaWQge1xuICAgICAgICAvKmpzbGludCB1bnBhcmFtOnRydWUgKi9cbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgIGxldCBuZXdEYXRhOiBhbnk7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGUgaW50ZXJmYWNlIG9mIGNoYW5nZVNldCB2YXJpZXMgZnJvbVxuICAgICAgICAvLyBldmVudHMgdG8gZXZlbnRzIGluIEJhY2tib25lLiBXZSBoYXZlIHRvIGJlIHZlcnkgY2FyZWZ1bC5cbiAgICAgICAgaWYgKGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkICYmIGNoYW5nZVNldC5jaGFuZ2VzLmFkZGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGhhdmUgZGF0YSBvciBub3RcbiAgICAgICAgICAgIG5ld0RhdGEgPSBzZWxmLmdlbmVyYXRlSXRlbXNJbnRlcm5hbChjaGFuZ2VTZXQuY2hhbmdlcy5hZGRlZCk7XG4gICAgICAgICAgICBzZWxmLm9uVXBkYXRlVmlldyh7XG4gICAgICAgICAgICAgICAgYWRkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJ2V2ZW50JyxcbiAgICAgICAgICAgICAgICBkYXRhOiBuZXdEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRkYXRhLmFzeW5jUHJlcGVuZChuZXdEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhbmdlU2V0LmNoYW5nZXMucmVtb3ZlZCAmJiBjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG5ld0RhdGEgPSBzZWxmLmdlbmVyYXRlSXRlbXNJbnRlcm5hbChjaGFuZ2VTZXQuY2hhbmdlcy5yZW1vdmVkKTtcbiAgICAgICAgICAgIHNlbGYub25VcGRhdGVWaWV3KHtcbiAgICAgICAgICAgICAgICByZW1vdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnZXZlbnQnLFxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld0RhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGRhdGEuYXN5bmNQb3AobmV3RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZCAmJiBjaGFuZ2VTZXQuY2hhbmdlcy5tZXJnZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbmV3RGF0YSA9IHNlbGYuZ2VuZXJhdGVJdGVtc0ludGVybmFsKGNoYW5nZVNldC5jaGFuZ2VzLm1lcmdlZCk7XG4gICAgICAgICAgICBzZWxmLm9uVXBkYXRlVmlldyh7XG4gICAgICAgICAgICAgICAgbWVyZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnZXZlbnQnLFxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld0RhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGRhdGEuYXN5bmNSZWZyZXNoKG5ld0RhdGEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlLlxuICAgICAqIFNvIHRoYXQgd2UgY2FuIGNsZWFuIHVwIHRoZSB2aWV3IGRhdGEuXG4gICAgICovXG4gICAgbG9hZEluaXREYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5yZXNldCgpO1xuICAgICAgICByZXR1cm4gc2VsZi5fc3VwZXIoKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgdG8gbGlzdGVuIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIGdsb2JhbCBwcm92aWRlci5cbiAgICAgKiBJdCBpcyB1c3VhbGx5IHVzZWQgaW50ZXJuYWxseSBvbiBzZXR0aW5nIHVwIHRoaXMgbWVkaWF0b3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGdsb2JhbFByb3ZpZGVyXG4gICAgICovXG4gICAgc3RhcnRMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcjogZnVuY3Rpb24oZ2xvYmFsUHJvdmlkZXIpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3Qgb25VcGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAvLyBXZSBoYXZlIHRvIHNjaGVkdWxlIHN1Y2ggdXBkYXRlIHNvIHRoYXQgc29tZSBvdGhlciBvcGVyYXRpb25zIGNhblxuICAgICAgICAgICAgLy8gYmVlbiBjb21wbGV0ZWQgZmlyc3QuIEUuZy4sIGdldEZvcmVpZ25Nb2RlbCBzaG91bGQgYmUgc2V0IHVwLlxuICAgICAgICAgICAgXy5kZWZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uR2xvYmFsUHJvdmlkZXJVcGRhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5fZ2xvYmFsUHJvdmlkZXJMaXN0ZW5lcnMgPSB7XG4gICAgICAgICAgICB1cGRhdGU6IG9uVXBkYXRlXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuX2dsb2JhbFByb3ZpZGVyID0gZ2xvYmFsUHJvdmlkZXI7XG4gICAgICAgIGdsb2JhbFByb3ZpZGVyLm9uKCd1cGRhdGUnLCBvblVwZGF0ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGxpc3RlbmluZyB0byB0aGUgY2hhbmdlIG9uIHRoZSBnbG9iYWwgcHJvdmlkZXIuXG4gICAgICogSXQgaXMgdXNhbGx5IHVzZWQgb24gdGhlIHRlYXJpbmcgZG93biB0aGlzIG1lZGlhdG9yLlxuICAgICAqL1xuICAgIHN0b3BMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHNlbGYuX2dsb2JhbFByb3ZpZGVyTGlzdGVuZXJzO1xuICAgICAgICBjb25zdCBnbG9iYWxQcm92aWRlciA9IHNlbGYuX2dsb2JhbFByb3ZpZGVyO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGdsb2JhbFByb3ZpZGVyLm9mZihrZXksIGxpc3RlbmVyc1trZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCB0byBsaXN0ZW4gdG8gdGhlIGNoYW5nZSBvbiB0aGUgdmlldyBkYXRhIHByb3ZpZGVyLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGludm9rZWQgb24gYmluZGluZyBhIHZpZXcgdG8gdGhpcyBtZWRpYXRvci5cbiAgICAgKi9cbiAgICBzdGFydExpc3RlbmluZ1ZpZXdQcm92aWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IG9uVXBkYXRlID0gZnVuY3Rpb24oZXZ0Q3R4LCBjaGFuZ2VTZXQsIHJlc3QpIHtcbiAgICAgICAgICAgIHNlbGYub25WaWV3UHJvdmlkZXJVcGRhdGUoZXZ0Q3R4LCBjaGFuZ2VTZXQsIHJlc3QpO1xuICAgICAgICB9O1xuICAgICAgICBzZWxmLl92aWV3UHJvdmlkZXJMaXN0ZW5lcnMgPSB7XG4gICAgICAgICAgICB1cGRhdGU6IG9uVXBkYXRlXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEub24oJ3VwZGF0ZScsIG9uVXBkYXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgbGlzdGVuaW5nIHRvIHRoZSBjaGFuZ2Ugb24gdGhlIHZpZXcgZGF0YSBwcm92aWRlci5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbnZva2VkIG9uIHVuYmluZGluZyBhIHZpZXcgdG8gdGhpcyBtZWRpYXRvci5cbiAgICAgKi9cbiAgICBzdG9wTGlzdGVuaW5nVmlld1Byb3ZpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gc2VsZi5fdmlld1Byb3ZpZGVyTGlzdGVuZXJzO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3ZpZXdMZXZlbERhdGEub2ZmKGtleSwgbGlzdGVuZXJzW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlLlxuICAgICAqIENvbXBhcmVkIGl0cyBiYXNlIGNvdW50ZXJwYXJ0LCB0aGlzIG1ldGhvZCBwZXJmb3JtcyBhZGRpdGlvbmFsXG4gICAgICogY2hlY2tpbmcgb24gZ2VuZXJhdGluZyBkYXRhIGZvciB0aGUgdmlldyBtb2R1bGUsIHNvIHRoYXQgbm8gcmVwZWF0ZWRcbiAgICAgKiBpdGVtcyBtYXkgYmUgZ2VuZXJhdGVkLlxuICAgICAqIFNpbXBseSBiZWNhdXNlLCB0aGUgZGF0YSBpbiB0aGUgdmlldyBsZXZlbCBkYXRhIGlzIGRpc3RpbmN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBzYWZlbHlSZWFkRGF0YVByb3ZpZGVyOiBmdW5jdGlvbigpOiBhbnlbXSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGxldCBtb2RlbHMgPSBzZWxmLl9zdXBlcigpO1xuICAgICAgICBtb2RlbHMgPSBfLmZpbHRlcihtb2RlbHMsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHJldHVybiAhXy5zb21lKHNlbGYuX3ZpZXdMZXZlbERhdGEubW9kZWxzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaWQgPT09IGVsZW0uaWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNhZmVseSBwdXNoIHRoZXNlIG1vZGVscyBpbnRvIHZpZXcgbGV2ZWwgZGF0YSBwcm92aWRlclxuICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLmFkZChtb2RlbHMsIHsgc2lsZW50OiB0cnVlIH0pO1xuICAgICAgICAvLyBUaGVuIHJldHVyblxuICAgICAgICByZXR1cm4gbW9kZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZS5cbiAgICAgKiBUaGlzIG1ldGhvZCB1c2VzIHRoZSBkYXRhIGZyb20gdGhlIHZpZXcgbGV2ZWwgZGF0YSwgaW5zdGVhZCBvZiB0aGVcbiAgICAgKiB0aGUgY3VycmVudCByZW1vdGUgZGF0YSBwcm92aWRlciwgdG8gZ2VuZXJhdGUgdGhlIGxpc3Qgb2YgZGF0YVxuICAgICAqIHRvIGJlIHJlbmRlcmVkLlxuICAgICAqL1xuICAgIHJlbmRlckRhdGE6IGZ1bmN0aW9uKGFzeW5jPzogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgJGRhdGEuY2xlYW4oKTtcbiAgICAgICAgJGRhdGEuaGFzTW9yZURhdGEoc2VsZi5fZGF0YVByb3ZpZGVyLmhhc05leHRQYWdlKCkpO1xuICAgICAgICBjb25zdCBuZXdEYXRhID0gc2VsZi5nZW5lcmF0ZUl0ZW1zSW50ZXJuYWwoc2VsZi5fdmlld0xldmVsRGF0YS5tb2RlbHMpO1xuICAgICAgICBpZiAoYXN5bmMgPT09IHRydWUpIHtcbiAgICAgICAgICAgICRkYXRhLmFzeW5jUHVzaChuZXdEYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRkYXRhLnN5bmNQdXNoKG5ld0RhdGEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlXG4gICAgICogQHBhcmFtIHt9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBzZXRVcDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zdXBlcihvcHRpb25zKTtcbiAgICAgICAgaWYgKHNlbGYuX2dsb2JhbFByb3ZpZGVyKSB7XG4gICAgICAgICAgICBzZWxmLnN0YXJ0TGlzdGVuaW5nR2xvYmFsUHJvdmlkZXIoc2VsZi5fZ2xvYmFsUHJvdmlkZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlXG4gICAgICovXG4gICAgdGVhckRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJV3JpdGFibGVMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICAvLyBDYWxsIHN1cGVyXG4gICAgICAgIHNlbGYuX3N1cGVyKCk7XG4gICAgICAgIC8vIFRlYXIgb2ZmIHdoYXQgd2UgaW50cm9kdWNlIGluIHRoaXMgY2xhc3NcbiAgICAgICAgc2VsZi5fdmlld0xldmVsRGF0YS5vZmYoJ2FsbCcpO1xuICAgICAgICBzZWxmLl92aWV3TGV2ZWxEYXRhLnJlc2V0KCk7XG4gICAgICAgIC8vIFN0b3AgbGlzdGVuaW5nIHRvIHRoZSBnbG9iYWxcbiAgICAgICAgaWYgKHNlbGYuX2dsb2JhbFByb3ZpZGVyKSB7XG4gICAgICAgICAgICBzZWxmLnN0b3BMaXN0ZW5pbmdHbG9iYWxQcm92aWRlcigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlXG4gICAgICovXG4gICAgYXR0YWNoVmlldzogZnVuY3Rpb24odmlld0luc3RhbmNlKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElXcml0YWJsZUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3N1cGVyKHZpZXdJbnN0YW5jZSk7XG4gICAgICAgIC8vIFN0YXJ0IHRvIGxpc3RlbiB0byBjaGFuZ2VzIG9uIHRoZSB2aWV3IGRhdGEgcHJvdmlkZXIuXG4gICAgICAgIHNlbGYuc3RhcnRMaXN0ZW5pbmdWaWV3UHJvdmlkZXIoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGVcbiAgICAgKi9cbiAgICBkZXRhY2hWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSVdyaXRhYmxlTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fc3VwZXIoKTtcbiAgICAgICAgc2VsZi5zdG9wTGlzdGVuaW5nVmlld1Byb3ZpZGVyKCk7XG4gICAgfVxufSk7XG4iXX0=