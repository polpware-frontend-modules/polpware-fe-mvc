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
import * as dependencies from '@polpware/fe-dependencies';
const ClassBuilder = dependencies.Class;
import { lift as liftIntoPromise, tojQueryDeferred } from '@polpware/fe-utilities';
import { noopViewInstance } from './noop-view-instance';
const _ = dependencies.underscore;
export const ListMediator = ClassBuilder.extend({
    Properties: 'dataProvider,dataParams,deepCopy,useModel,enableRefresh,enableInfinite,onUpdateView,viewInstance',
    init: function (settings) {
        const self = this;
        self._settings = settings;
        self._viewInstance = noopViewInstance;
        self._dataProvider = settings.dataProvider || null;
        self._dataParams = settings.dataParams || {};
        self._deepCopy = settings.deepCopy || false;
        self._useModel = settings.useModel || false;
        self._enableRefresh = settings.enableRefresh || false;
        self._enableInfinite = settings.enableInfinite || false;
        self._stateContext = {};
        self._isInit = true;
        self._isLoadingData = false;
    },
    generateItemsInternal: function (collection) {
        const self = this;
        const newData = [];
        if (self._useModel) {
            collection.forEach(function (item) {
                newData.push(item);
            });
        }
        else if (self._deepCopy) {
            collection.forEach(function (item) {
                newData.push(_.extend({}, item.attributes));
            });
        }
        else {
            collection.forEach(function (item) {
                newData.push(item.attributes);
            });
        }
        return newData;
    },
    /**
     * Computes the set of models in the current data provider.
     * Note that we support all kinds of data providers, backbone
     * or something similar backbone.
     * Moreover, this method may be overriden.
     * @returns {Array}
     */
    safelyReadDataProvider: function () {
        const self = this;
        let models;
        if (self._dataProvider.models) {
            models = self._dataProvider.models;
        }
        else {
            models = [];
            self._dataProvider.forEach(function (oneItem) {
                models.push(oneItem);
            });
        }
        return models;
    },
    /**
     * Generates the items for the view
     * Note that we only perform the checking in this method;
     * it is Not necessary to peform this kind of checking in other overriden generateItems.
     * @param {Boolean} async
     * @returns {}
     */
    generateItems: function (async) {
        const self = this;
        const $data = self._viewInstance.$data;
        const models = self.safelyReadDataProvider();
        const newData = self.generateItemsInternal(models);
        // newData is ready
        if (async === true) {
            self.onUpdateView({
                add: true,
                source: 'remote',
                data: newData
            });
            $data.asyncPush(newData);
        }
        else {
            self.onUpdateView({
                add: true,
                source: 'cache',
                data: newData
            });
            $data.syncPush(newData);
        }
    },
    /**
     * Load the first page of data from the server,
     * without any loading indicator;
     * This method is used internally.
     * @function loadInitData
     * @returns {Promise}
     */
    loadInitData: function () {
        const self = this;
        const dataProvider = self._dataProvider;
        // We must reset data beforehand
        dataProvider.reset();
        // There are side effects if a parameter is passed in get*page
        // Therefore, we need to clone a new copy of this parameter
        self._isLoadingData = true;
        const dataParams = self._dataParams;
        let promise = dataProvider.getFirstPage({ data: _.extend({}, dataParams) });
        promise = tojQueryDeferred(promise);
        promise.always(function () {
            self._isInit = false;
            self._isLoadingData = false;
        });
        return promise.then(function () {
            const $data = self._viewInstance.$data;
            $data.clean();
            $data.hasMoreData(dataProvider.hasNextPage());
            self.generateItems(true /*aync*/);
            // To ensure that isLoadingData happends very late.
        });
    },
    /**
     * Render data without any loading operations. By default, this is invoked
     * in the context of non-async mode.
     * @param {Boolean} async
     * @function renderData
     */
    renderData: function (async) {
        const self = this;
        const $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
        self.generateItems(async === true);
    },
    /**
     * Reloads data as the result of pulling down operation.
     * It assumes that the user has pulled down the page, thus resetting the refreshing
     * indicator at the end.
     * @param isProgramatic {Boolean} Indicates if this invocation
     * is due to an internal call, without user interaction.
     * @function refresh
     */
    refresh: function (isProgramatic) {
        const self = this;
        const $data = self._viewInstance.$data;
        const $refresher = self._viewInstance.$refresher;
        $data.hasMoreData(true);
        // Refresh loader
        $refresher.show(isProgramatic);
        const prms = self.loadInitData();
        const anotherP = tojQueryDeferred(prms);
        return anotherP.always(function () {
            $refresher.hide(isProgramatic);
        });
    },
    /**
     * Loads more data as the result of scrolling down.
     * It assumes that the user has scroll down enough, thus resetting the loading more
     * indicator at the end.
     * @function loadMore
     */
    loadMore: function () {
        const self = this;
        const dataProvider = self._dataProvider;
        const dataParams = self._dataParams;
        const $data = self._viewInstance.$data;
        const $moreLoader = self._viewInstance.$moreLoader;
        // loadMore may be issued before init
        if (self._isInit) {
            $moreLoader.hide();
            return liftIntoPromise(true, null);
        }
        if (self._isLoadingData) {
            // We do not disable infinite scroll complete ...
            // because we want to prevent from two time loadMore
            // and one disable finally is sufficient to remove inifinite scroll indicator.
            return liftIntoPromise(true, null);
        }
        if (!dataProvider.hasNextPage()) {
            $data.hasMoreData(false);
            $moreLoader.hide();
            return liftIntoPromise(true, null);
        }
        $moreLoader.show();
        // We must clone a copy dataParams, as there are side
        // effects in this parameter
        self._isLoadingData = true;
        const prms = dataProvider.getNextPage({ data: _.extend({}, dataParams) }).then(function () {
            $data.hasMoreData(dataProvider.hasNextPage());
            self.generateItems(true /* async */);
            // To ensure that isLoading happends very later, we have to put isLoading in two functions.
            self._isLoadingData = false;
        }, function () {
            self._isLoadingData = false;
        });
        const anotherP = tojQueryDeferred(prms);
        return anotherP.always(function () {
            $moreLoader.hide();
        });
    },
    /**
     * Check if the context for the data provider has changed, for
     * the purpose of deciding if we need to reload data.
     * @function stateChanged
     * @returns {Boolean}
     */
    stateChanged: function () {
        const stateContext = this._stateContext;
        if (stateContext.enableSearch === true) {
            return stateContext.searchModel.isConfirmed() && stateContext.searchModel.hashCode() !== stateContext.searchCriteria.hashCode;
        }
        return true;
    },
    /**
     * Updates state and reload data, with loading indicator if set
     * @function updateStateAndReload
     */
    updateStateAndReload: function () {
        const self = this;
        const stateContext = self._stateContext;
        const $data = self._viewInstance.$data;
        const $loader = self._viewInstance.$loader;
        if (stateContext.enableSearch === true) {
            stateContext.searchCriteria = stateContext.searchModel.generateFilter();
            self.dataParams(stateContext.searchCriteria.filter);
            $data.updateSearchCriteria(stateContext.searchCriteria);
        }
        $loader.show();
        const prms = self.loadInitData();
        const anotherP = tojQueryDeferred(prms);
        anotherP.always(function () {
            $loader.hide();
        });
    },
    /**
     * Sets up context and hooks up data with view.
     * This method is only invoked once and should be one of the steps following constructor.
     * In other words, it is part of a constructor.
     * @param {Object} options
     */
    setUp: function (options) {
        const self = this;
        options = options || {};
        if (options.enableSearch) {
            self._stateContext.enableSearch = true;
            // We expect the following properties
            // chai.expect(options).to.have.property('searchSettings');
            // chai.expect(options.searchSettings).to.have.property('searchModel');
            // chai.expect(options.searchSettings).to.have.property('searchModelGuid');
            // chai.expect(options.searchSettings).to.have.property('searchURL');
            // Create our state context
            // Keep the search settings into the state context,
            // because these settings are used later for deciding if we
            // need to recompute data parameters or not
            const searchSettings = options.searchSettings;
            self._stateContext.searchURL = searchSettings.searchURL;
            self._stateContext.searchModelGuid = searchSettings.searchModelGuid;
            self._stateContext.searchModel = searchSettings.searchModel;
            self._stateContext.searchCriteria = searchSettings.searchModel.generateFilter();
            self.dataParams(self._stateContext.searchCriteria.filter);
        }
    },
    /**
     * A destructor.
     */
    tearDown: function () {
        const self = this;
        if (self._dataProvider && self._dataProvider.off) {
            // Discard all listening
            self._dataProvider.off('all');
            // Discard all data
            self._dataProvider.reset();
        }
    },
    /**
     * Start to bind a view to this mediator.
     */
    attachView: function (viewInstance) {
        const self = this;
        self._viewInstance = viewInstance;
        const $data = self._viewInstance.$data;
        if (self._enableRefresh) {
            $data.setRefreshCallback(function () {
                self.refresh();
            });
        }
        if (self._enableInfinite) {
            $data.setInfiniteCallback(function () {
                self.loadMore();
            });
        }
        if (self._stateContext.enableSearch) {
            $data.setupSearch(self._stateContext.searchCriteria, function () {
                self._viewInstance.$router.go(self._stateContext.searchURL, {
                    dataId: self._stateContext.searchModelGuid
                });
            });
        }
        $data.init();
    },
    detachView: function () {
        const self = this;
        self._viewInstance = noopViewInstance;
    },
    _defaultStartService: function () {
        const self = this;
        const $loader = self._viewInstance.$loader;
        $loader.show();
        const promise = self.loadInitData();
        const anotherP = tojQueryDeferred(promise);
        anotherP.always(function () {
            $loader.hide();
        });
    },
    /**
     * This method needs to be overrided.
     */
    startServiceImpl: function () {
        const self = this;
        self._defaultStartService();
    },
    startService: function (viewInsance, fromCache) {
        const self = this;
        self.attachView(viewInsance);
        if (fromCache === true) {
            self.renderData();
        }
        else {
            self.startServiceImpl();
        }
    },
    stopService: function () {
        const self = this;
        self.detachView();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Bwb2xwd2FyZS9mZS1tdmMvIiwic291cmNlcyI6WyJsaWIvbWVkaWF0b3JzL2Fic3RyYWN0LWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxPQUFPLEtBQUssWUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBRTFELE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFFeEMsT0FBTyxFQUFFLElBQUksSUFBSSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUduRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUV4RCxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0FBNERsQyxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUU1QyxVQUFVLEVBQUUsa0dBQWtHO0lBRTlHLElBQUksRUFBRSxVQUFTLFFBQWtDO1FBQzdDLE1BQU0sSUFBSSxHQUFxQixJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztRQUN0QyxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDO1FBQ25ELElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztRQUM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUM7UUFDdEQsSUFBSSxDQUFDLGVB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QUFRLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0MsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNaLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQixFQUFFO1FBQ2QsTUFBTSxJQUFJLEdBQXFCLElBQUksQ0FBQztRQUNwQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsWUFBWSxFQUFFLFVBQVMsV0FBMEIsRUFBRSxTQUFtQjtRQUNsRSxNQUFNLElBQUksR0FBcUIsSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0IsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjthQUFNO1lBQ0gsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDM0I7SUFDTCxDQUFDO0lBRUQsV0FBVyxFQUFFO1FBQ1QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0NBRUosQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3XG4gKiBBbiBtZWRpYXRvciAobmFtZWQgYWZ0ZXIgdGhlIG1lZGlhdG9yIHBhdHRlcm4pXG4gKiB3aGljaCBjb29yZGluYXRlcyB2aWV3cyBhbmQgY29udHJvbGxlcnMuXG4gKiBXZSBzdXBwb3J0IHRoZSBmb2xsb3dpbmcgdXNlIGNhc2VzOlxuICogMS4gQSBwYWdlIGlzIGZpcnN0IHRpbWUgbG9hZGVkIGFuZCB0aGVuIHJlbmRlcmVkXG4gKiAyLiBBIHBhZ2UgaXMgcmVmcmVzaGVkIGJ5IHB1bGxpbmcgZG93blxuICogMy4gQSBwYWdlIGlzIHJlbmRlcmVkIHdpdGggbW9yZSBkYXRhXG4gKiA0LiBBIHBhZ2UgaXMgdXBkYXRlZCBhZnRlciBzb21lIHN0YXRlIGhhcyBjaGFuZ2VkXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgaXMgYW4gc2J0cmFjdCBjbGFzczsgeW91IGNhbm5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgaXQuXG4gKi9cblxuaW1wb3J0ICogYXMgZGVwZW5kZW5jaWVzIGZyb20gJ0Bwb2xwd2FyZS9mZS1kZXBlbmRlbmNpZXMnO1xuXG5jb25zdCBDbGFzc0J1aWxkZXIgPSBkZXBlbmRlbmNpZXMuQ2xhc3M7XG5cbmltcG9ydCB7IGxpZnQgYXMgbGlmdEludG9Qcm9taXNlLCB0b2pRdWVyeURlZmVycmVkIH0gZnJvbSAnQHBvbHB3YXJlL2ZlLXV0aWxpdGllcyc7XG5cbmltcG9ydCB7IElWaWV3SW5zdGFuY2UgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgbm9vcFZpZXdJbnN0YW5jZSB9IGZyb20gJy4vbm9vcC12aWV3LWluc3RhbmNlJztcblxuY29uc3QgXyA9IGRlcGVuZGVuY2llcy51bmRlcnNjb3JlO1xuXG5leHBvcnQgaW50ZXJmYWNlIElMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucyB7XG4gICAgZGF0YVByb3ZpZGVyPzogYW55O1xuICAgIGRhdGFQYXJhbXM/OiBhbnk7XG4gICAgZGVlcENvcHk/OiBib29sZWFuO1xuICAgIHVzZU1vZGVsPzogYm9vbGVhbjtcbiAgICBlbmFibGVSZWZyZXNoOiBib29sZWFuO1xuICAgIGVuYWJsZUluZmluaXRlOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElMaXN0TWVkaWF0b3JQdWJsaWMge1xuXG4gICAgZGF0YVByb3ZpZGVyKHZhbHVlPzogYW55KTogYW55O1xuICAgIGRhdGFQYXJhbXModmFsdWU/OiBhbnkpOiBhbnk7XG5cbiAgICB2aWV3SW5zYW5jZSh2YWx1ZT86IElWaWV3SW5zdGFuY2UpOiBJVmlld0luc3RhbmNlO1xuXG4gICAgc3RhcnRTZXJ2aWNlKHZpZXdJbnNhbmNlOiBJVmlld0luc3RhbmNlLCBmcm9tQ2FjaGU/OiBib29sZWFuKTogdm9pZDtcbiAgICBzdG9wU2VydmljZSgpOiB2b2lkO1xuXG4gICAgbG9hZEluaXREYXRhKCk6IFByb21pc2VMaWtlPGFueT47XG4gICAgcmVmcmVzaChpc1Byb2dyYW1hdGljPzogYm9vbGVhbik6IFByb21pc2VMaWtlPGFueT47XG4gICAgbG9hZE1vcmUoKTogUHJvbWlzZUxpa2U8YW55PjtcblxuICAgIHJlbmRlckRhdGEoYXN5bmM/OiBib29sZWFuKTogdm9pZDtcblxuICAgIHNldFVwKG9wdGlvbnM/OiBhbnkpOiB2b2lkO1xuICAgIHRlYXJEb3duKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxpc3RNZWRpYXRvckRldiBleHRlbmRzIElMaXN0TWVkaWF0b3JQdWJsaWMge1xuICAgIF9zZXR0aW5nczogSUxpc3RNZWRpYXRvckN0b3JPcHRpb25zO1xuICAgIF92aWV3SW5zdGFuY2U6IElWaWV3SW5zdGFuY2U7XG4gICAgX2RhdGFQcm92aWRlcjogYW55O1xuICAgIF9kYXRhUGFyYW1zOiBhbnk7XG4gICAgX2RlZXBDb3B5OiBib29sZWFuO1xuICAgIF91c2VNb2RlbDogYm9vbGVhbjtcbiAgICBfZW5hYmxlUmVmcmVzaDogYm9vbGVhbjtcbiAgICBfZW5hYmxlSW5maW5pdGU6IGJvb2xlYW47XG5cbiAgICBfc3RhdGVDb250ZXh0OiBhbnk7XG5cbiAgICBfaXNJbml0OiBib29sZWFuO1xuICAgIF9pc0xvYWRpbmdEYXRhOiBib29sZWFuO1xuXG4gICAgc2FmZWx5UmVhZERhdGFQcm92aWRlcigpOiBhbnlbXTtcbiAgICBnZW5lcmF0ZUl0ZW1zSW50ZXJuYWwoY29sbGVjdGlvbjogYW55KTogYW55W107XG5cbiAgICBvblVwZGF0ZVZpZXcoZXZ0OiBhbnkpOiBhbnk7XG4gICAgZ2VuZXJhdGVJdGVtcyhhc3luYz86IGJvb2xlYW4pOiB2b2lkO1xuXG4gICAgX2RlZmF1bHRTdGFydFNlcnZpY2UoKTogdm9pZDtcblxuICAgIGF0dGFjaFZpZXcodmlld0luc3RhbmNlKTogdm9pZDtcbiAgICBkZXRhY2hWaWV3KCk6IHZvaWQ7XG5cbiAgICBzdGFydFNlcnZpY2VJbXBsKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBMaXN0TWVkaWF0b3IgPSBDbGFzc0J1aWxkZXIuZXh0ZW5kKHtcblxuICAgIFByb3BlcnRpZXM6ICdkYXRhUHJvdmlkZXIsZGF0YVBhcmFtcyxkZWVwQ29weSx1c2VNb2RlbCxlbmFibGVSZWZyZXNoLGVuYWJsZUluZmluaXRlLG9uVXBkYXRlVmlldyx2aWV3SW5zdGFuY2UnLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oc2V0dGluZ3M6IElMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICAgICAgc2VsZi5fdmlld0luc3RhbmNlID0gbm9vcFZpZXdJbnN0YW5jZTtcbiAgICAgICAgc2VsZi5fZGF0YVByb3ZpZGVyID0gc2V0dGluZ3MuZGF0YVByb3ZpZGVyIHx8IG51bGw7XG4gICAgICAgIHNlbGYuX2RhdGFQYXJhbXMgPSBzZXR0aW5ncy5kYXRhUGFyYW1zIHx8IHt9O1xuICAgICAgICBzZWxmLl9kZWVwQ29weSA9IHNldHRpbmdzLmRlZXBDb3B5IHx8IGZhbHNlO1xuICAgICAgICBzZWxmLl91c2VNb2RlbCA9IHNldHRpbmdzLnVzZU1vZGVsIHx8IGZhbHNlO1xuICAgICAgICBzZWxmLl9lbmFibGVSZWZyZXNoID0gc2V0dGluZ3MuZW5hYmxlUmVmcmVzaCB8fCBmYWxzZTtcbiAgICAgICAgc2VsZi5fZW5hYmxlSW5maW5pdGUgPSBzZXR0aW5ncy5lbmFibGVJbmZpbml0ZSB8fCBmYWxzZTtcblxuICAgICAgICBzZWxmLl9zdGF0ZUNvbnRleHQgPSB7fTtcbiAgICAgICAgc2VsZi5faXNJbml0ID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5faXNMb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBnZW5lcmF0ZUl0ZW1zSW50ZXJuYWw6IGZ1bmN0aW9uKGNvbGxlY3Rpb24pOiBhbnlbXSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBuZXdEYXRhID0gW107XG4gICAgICAgIGlmIChzZWxmLl91c2VNb2RlbCkge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBuZXdEYXRhLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWxmLl9kZWVwQ29weSkge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBuZXdEYXRhLnB1c2goXy5leHRlbmQoe30sIGl0ZW0uYXR0cmlidXRlcykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGEucHVzaChpdGVtLmF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld0RhdGE7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZXMgdGhlIHNldCBvZiBtb2RlbHMgaW4gdGhlIGN1cnJlbnQgZGF0YSBwcm92aWRlci5cbiAgICAgKiBOb3RlIHRoYXQgd2Ugc3VwcG9ydCBhbGwga2luZHMgb2YgZGF0YSBwcm92aWRlcnMsIGJhY2tib25lXG4gICAgICogb3Igc29tZXRoaW5nIHNpbWlsYXIgYmFja2JvbmUuXG4gICAgICogTW9yZW92ZXIsIHRoaXMgbWV0aG9kIG1heSBiZSBvdmVycmlkZW4uXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIHNhZmVseVJlYWREYXRhUHJvdmlkZXI6IGZ1bmN0aW9uKCk6IGFueVtdIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGxldCBtb2RlbHM6IGFueTtcbiAgICAgICAgaWYgKHNlbGYuX2RhdGFQcm92aWRlci5tb2RlbHMpIHtcbiAgICAgICAgICAgIG1vZGVscyA9IHNlbGYuX2RhdGFQcm92aWRlci5tb2RlbHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2RlbHMgPSBbXTtcbiAgICAgICAgICAgIHNlbGYuX2RhdGFQcm92aWRlci5mb3JFYWNoKGZ1bmN0aW9uKG9uZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICBtb2RlbHMucHVzaChvbmVJdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb2RlbHM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyB0aGUgaXRlbXMgZm9yIHRoZSB2aWV3XG4gICAgICogTm90ZSB0aGF0IHdlIG9ubHkgcGVyZm9ybSB0aGUgY2hlY2tpbmcgaW4gdGhpcyBtZXRob2Q7XG4gICAgICogaXQgaXMgTm90IG5lY2Vzc2FyeSB0byBwZWZvcm0gdGhpcyBraW5kIG9mIGNoZWNraW5nIGluIG90aGVyIG92ZXJyaWRlbiBnZW5lcmF0ZUl0ZW1zLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXN5bmNcbiAgICAgKiBAcmV0dXJucyB7fVxuICAgICAqL1xuICAgIGdlbmVyYXRlSXRlbXM6IGZ1bmN0aW9uKGFzeW5jKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgY29uc3QgbW9kZWxzID0gc2VsZi5zYWZlbHlSZWFkRGF0YVByb3ZpZGVyKCk7XG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSBzZWxmLmdlbmVyYXRlSXRlbXNJbnRlcm5hbChtb2RlbHMpO1xuICAgICAgICAvLyBuZXdEYXRhIGlzIHJlYWR5XG4gICAgICAgIGlmIChhc3luYyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2VsZi5vblVwZGF0ZVZpZXcoe1xuICAgICAgICAgICAgICAgIGFkZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICdyZW1vdGUnLFxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld0RhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGRhdGEuYXN5bmNQdXNoKG5ld0RhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5vblVwZGF0ZVZpZXcoe1xuICAgICAgICAgICAgICAgIGFkZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzb3VyY2U6ICdjYWNoZScsXG4gICAgICAgICAgICAgICAgZGF0YTogbmV3RGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZGF0YS5zeW5jUHVzaChuZXdEYXRhKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBmaXJzdCBwYWdlIG9mIGRhdGEgZnJvbSB0aGUgc2VydmVyLFxuICAgICAqIHdpdGhvdXQgYW55IGxvYWRpbmcgaW5kaWNhdG9yO1xuICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgaW50ZXJuYWxseS5cbiAgICAgKiBAZnVuY3Rpb24gbG9hZEluaXREYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgbG9hZEluaXREYXRhOiBmdW5jdGlvbigpOiBQcm9taXNlTGlrZTxhbnk+IHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG5cbiAgICAgICAgY29uc3QgZGF0YVByb3ZpZGVyID0gc2VsZi5fZGF0YVByb3ZpZGVyO1xuICAgICAgICAvLyBXZSBtdXN0IHJlc2V0IGRhdGEgYmVmb3JlaGFuZFxuICAgICAgICBkYXRhUHJvdmlkZXIucmVzZXQoKTtcbiAgICAgICAgLy8gVGhlcmUgYXJlIHNpZGUgZWZmZWN0cyBpZiBhIHBhcmFtZXRlciBpcyBwYXNzZWQgaW4gZ2V0KnBhZ2VcbiAgICAgICAgLy8gVGhlcmVmb3JlLCB3ZSBuZWVkIHRvIGNsb25lIGEgbmV3IGNvcHkgb2YgdGhpcyBwYXJhbWV0ZXJcbiAgICAgICAgc2VsZi5faXNMb2FkaW5nRGF0YSA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgZGF0YVBhcmFtcyA9IHNlbGYuX2RhdGFQYXJhbXM7XG4gICAgICAgIGxldCBwcm9taXNlID0gZGF0YVByb3ZpZGVyLmdldEZpcnN0UGFnZSh7IGRhdGE6IF8uZXh0ZW5kKHt9LCBkYXRhUGFyYW1zKSB9KTtcbiAgICAgICAgcHJvbWlzZSA9IHRvalF1ZXJ5RGVmZXJyZWQocHJvbWlzZSk7XG4gICAgICAgIHByb21pc2UuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5faXNJbml0ID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLl9pc0xvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgICAgICRkYXRhLmNsZWFuKCk7XG4gICAgICAgICAgICAkZGF0YS5oYXNNb3JlRGF0YShkYXRhUHJvdmlkZXIuaGFzTmV4dFBhZ2UoKSk7XG4gICAgICAgICAgICBzZWxmLmdlbmVyYXRlSXRlbXModHJ1ZSAvKmF5bmMqLyk7XG4gICAgICAgICAgICAvLyBUbyBlbnN1cmUgdGhhdCBpc0xvYWRpbmdEYXRhIGhhcHBlbmRzIHZlcnkgbGF0ZS5cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBkYXRhIHdpdGhvdXQgYW55IGxvYWRpbmcgb3BlcmF0aW9ucy4gQnkgZGVmYXVsdCwgdGhpcyBpcyBpbnZva2VkXG4gICAgICogaW4gdGhlIGNvbnRleHQgb2Ygbm9uLWFzeW5jIG1vZGUuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBhc3luY1xuICAgICAqIEBmdW5jdGlvbiByZW5kZXJEYXRhXG4gICAgICovXG4gICAgcmVuZGVyRGF0YTogZnVuY3Rpb24oYXN5bmM/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgJGRhdGEuY2xlYW4oKTtcbiAgICAgICAgJGRhdGEuaGFzTW9yZURhdGEoc2VsZi5fZGF0YVByb3ZpZGVyLmhhc05leHRQYWdlKCkpO1xuICAgICAgICBzZWxmLmdlbmVyYXRlSXRlbXMoYXN5bmMgPT09IHRydWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWxvYWRzIGRhdGEgYXMgdGhlIHJlc3VsdCBvZiBwdWxsaW5nIGRvd24gb3BlcmF0aW9uLlxuICAgICAqIEl0IGFzc3VtZXMgdGhhdCB0aGUgdXNlciBoYXMgcHVsbGVkIGRvd24gdGhlIHBhZ2UsIHRodXMgcmVzZXR0aW5nIHRoZSByZWZyZXNoaW5nXG4gICAgICogaW5kaWNhdG9yIGF0IHRoZSBlbmQuXG4gICAgICogQHBhcmFtIGlzUHJvZ3JhbWF0aWMge0Jvb2xlYW59IEluZGljYXRlcyBpZiB0aGlzIGludm9jYXRpb25cbiAgICAgKiBpcyBkdWUgdG8gYW4gaW50ZXJuYWwgY2FsbCwgd2l0aG91dCB1c2VyIGludGVyYWN0aW9uLlxuICAgICAqIEBmdW5jdGlvbiByZWZyZXNoXG4gICAgICovXG4gICAgcmVmcmVzaDogZnVuY3Rpb24oaXNQcm9ncmFtYXRpYz86IGJvb2xlYW4pOiBQcm9taXNlTGlrZTxhbnk+IHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICBjb25zdCAkcmVmcmVzaGVyID0gc2VsZi5fdmlld0luc3RhbmNlLiRyZWZyZXNoZXI7XG4gICAgICAgICRkYXRhLmhhc01vcmVEYXRhKHRydWUpO1xuICAgICAgICAvLyBSZWZyZXNoIGxvYWRlclxuICAgICAgICAkcmVmcmVzaGVyLnNob3coaXNQcm9ncmFtYXRpYyk7XG4gICAgICAgIGNvbnN0IHBybXMgPSBzZWxmLmxvYWRJbml0RGF0YSgpO1xuICAgICAgICBjb25zdCBhbm90aGVyUCA9IHRvalF1ZXJ5RGVmZXJyZWQocHJtcyk7XG4gICAgICAgIHJldHVybiBhbm90aGVyUC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkcmVmcmVzaGVyLmhpZGUoaXNQcm9ncmFtYXRpYyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBtb3JlIGRhdGEgYXMgdGhlIHJlc3VsdCBvZiBzY3JvbGxpbmcgZG93bi5cbiAgICAgKiBJdCBhc3N1bWVzIHRoYXQgdGhlIHVzZXIgaGFzIHNjcm9sbCBkb3duIGVub3VnaCwgdGh1cyByZXNldHRpbmcgdGhlIGxvYWRpbmcgbW9yZVxuICAgICAqIGluZGljYXRvciBhdCB0aGUgZW5kLlxuICAgICAqIEBmdW5jdGlvbiBsb2FkTW9yZVxuICAgICAqL1xuICAgIGxvYWRNb3JlOiBmdW5jdGlvbigpOiBQcm9taXNlTGlrZTxhbnk+IHtcblxuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgZGF0YVByb3ZpZGVyID0gc2VsZi5fZGF0YVByb3ZpZGVyO1xuICAgICAgICBjb25zdCBkYXRhUGFyYW1zID0gc2VsZi5fZGF0YVBhcmFtcztcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgIGNvbnN0ICRtb3JlTG9hZGVyID0gc2VsZi5fdmlld0luc3RhbmNlLiRtb3JlTG9hZGVyO1xuXG4gICAgICAgIC8vIGxvYWRNb3JlIG1heSBiZSBpc3N1ZWQgYmVmb3JlIGluaXRcbiAgICAgICAgaWYgKHNlbGYuX2lzSW5pdCkge1xuICAgICAgICAgICAgJG1vcmVMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGxpZnRJbnRvUHJvbWlzZSh0cnVlLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLl9pc0xvYWRpbmdEYXRhKSB7XG4gICAgICAgICAgICAvLyBXZSBkbyBub3QgZGlzYWJsZSBpbmZpbml0ZSBzY3JvbGwgY29tcGxldGUgLi4uXG4gICAgICAgICAgICAvLyBiZWNhdXNlIHdlIHdhbnQgdG8gcHJldmVudCBmcm9tIHR3byB0aW1lIGxvYWRNb3JlXG4gICAgICAgICAgICAvLyBhbmQgb25lIGRpc2FibGUgZmluYWxseSBpcyBzdWZmaWNpZW50IHRvIHJlbW92ZSBpbmlmaW5pdGUgc2Nyb2xsIGluZGljYXRvci5cbiAgICAgICAgICAgIHJldHVybiBsaWZ0SW50b1Byb21pc2UodHJ1ZSwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWRhdGFQcm92aWRlci5oYXNOZXh0UGFnZSgpKSB7XG4gICAgICAgICAgICAkZGF0YS5oYXNNb3JlRGF0YShmYWxzZSk7XG4gICAgICAgICAgICAkbW9yZUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICByZXR1cm4gbGlmdEludG9Qcm9taXNlKHRydWUsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgJG1vcmVMb2FkZXIuc2hvdygpO1xuXG4gICAgICAgIC8vIFdlIG11c3QgY2xvbmUgYSBjb3B5IGRhdGFQYXJhbXMsIGFzIHRoZXJlIGFyZSBzaWRlXG4gICAgICAgIC8vIGVmZmVjdHMgaW4gdGhpcyBwYXJhbWV0ZXJcbiAgICAgICAgc2VsZi5faXNMb2FkaW5nRGF0YSA9IHRydWU7XG4gICAgICAgIGNvbnN0IHBybXMgPSBkYXRhUHJvdmlkZXIuZ2V0TmV4dFBhZ2UoeyBkYXRhOiBfLmV4dGVuZCh7fSwgZGF0YVBhcmFtcykgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRkYXRhLmhhc01vcmVEYXRhKGRhdGFQcm92aWRlci5oYXNOZXh0UGFnZSgpKTtcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVJdGVtcyh0cnVlIC8qIGFzeW5jICovKTtcbiAgICAgICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IGlzTG9hZGluZyBoYXBwZW5kcyB2ZXJ5IGxhdGVyLCB3ZSBoYXZlIHRvIHB1dCBpc0xvYWRpbmcgaW4gdHdvIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgIHNlbGYuX2lzTG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9pc0xvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBhbm90aGVyUCA9IHRvalF1ZXJ5RGVmZXJyZWQocHJtcyk7XG5cbiAgICAgICAgcmV0dXJuIGFub3RoZXJQLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRtb3JlTG9hZGVyLmhpZGUoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBjb250ZXh0IGZvciB0aGUgZGF0YSBwcm92aWRlciBoYXMgY2hhbmdlZCwgZm9yXG4gICAgICogdGhlIHB1cnBvc2Ugb2YgZGVjaWRpbmcgaWYgd2UgbmVlZCB0byByZWxvYWQgZGF0YS5cbiAgICAgKiBAZnVuY3Rpb24gc3RhdGVDaGFuZ2VkXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgc3RhdGVDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc3RhdGVDb250ZXh0ID0gdGhpcy5fc3RhdGVDb250ZXh0O1xuICAgICAgICBpZiAoc3RhdGVDb250ZXh0LmVuYWJsZVNlYXJjaCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlQ29udGV4dC5zZWFyY2hNb2RlbC5pc0NvbmZpcm1lZCgpICYmIHN0YXRlQ29udGV4dC5zZWFyY2hNb2RlbC5oYXNoQ29kZSgpICE9PSBzdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEuaGFzaENvZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgc3RhdGUgYW5kIHJlbG9hZCBkYXRhLCB3aXRoIGxvYWRpbmcgaW5kaWNhdG9yIGlmIHNldFxuICAgICAqIEBmdW5jdGlvbiB1cGRhdGVTdGF0ZUFuZFJlbG9hZFxuICAgICAqL1xuICAgIHVwZGF0ZVN0YXRlQW5kUmVsb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHN0YXRlQ29udGV4dCA9IHNlbGYuX3N0YXRlQ29udGV4dDtcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgIGNvbnN0ICRsb2FkZXIgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGxvYWRlcjtcbiAgICAgICAgaWYgKHN0YXRlQ29udGV4dC5lbmFibGVTZWFyY2ggPT09IHRydWUpIHtcbiAgICAgICAgICAgIHN0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYSA9IHN0YXRlQ29udGV4dC5zZWFyY2hNb2RlbC5nZW5lcmF0ZUZpbHRlcigpO1xuICAgICAgICAgICAgc2VsZi5kYXRhUGFyYW1zKHN0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYS5maWx0ZXIpO1xuICAgICAgICAgICAgJGRhdGEudXBkYXRlU2VhcmNoQ3JpdGVyaWEoc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhKTtcbiAgICAgICAgfVxuICAgICAgICAkbG9hZGVyLnNob3coKTtcbiAgICAgICAgY29uc3QgcHJtcyA9IHNlbGYubG9hZEluaXREYXRhKCk7XG4gICAgICAgIGNvbnN0IGFub3RoZXJQID0gdG9qUXVlcnlEZWZlcnJlZChwcm1zKTtcblxuICAgICAgICBhbm90aGVyUC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbG9hZGVyLmhpZGUoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgY29udGV4dCBhbmQgaG9va3MgdXAgZGF0YSB3aXRoIHZpZXcuXG4gICAgICogVGhpcyBtZXRob2QgaXMgb25seSBpbnZva2VkIG9uY2UgYW5kIHNob3VsZCBiZSBvbmUgb2YgdGhlIHN0ZXBzIGZvbGxvd2luZyBjb25zdHJ1Y3Rvci5cbiAgICAgKiBJbiBvdGhlciB3b3JkcywgaXQgaXMgcGFydCBvZiBhIGNvbnN0cnVjdG9yLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICovXG4gICAgc2V0VXA6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZW5hYmxlU2VhcmNoKSB7XG4gICAgICAgICAgICBzZWxmLl9zdGF0ZUNvbnRleHQuZW5hYmxlU2VhcmNoID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIFdlIGV4cGVjdCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXNcbiAgICAgICAgICAgIC8vIGNoYWkuZXhwZWN0KG9wdGlvbnMpLnRvLmhhdmUucHJvcGVydHkoJ3NlYXJjaFNldHRpbmdzJyk7XG4gICAgICAgICAgICAvLyBjaGFpLmV4cGVjdChvcHRpb25zLnNlYXJjaFNldHRpbmdzKS50by5oYXZlLnByb3BlcnR5KCdzZWFyY2hNb2RlbCcpO1xuICAgICAgICAgICAgLy8gY2hhaS5leHBlY3Qob3B0aW9ucy5zZWFyY2hTZXR0aW5ncykudG8uaGF2ZS5wcm9wZXJ0eSgnc2VhcmNoTW9kZWxHdWlkJyk7XG4gICAgICAgICAgICAvLyBjaGFpLmV4cGVjdChvcHRpb25zLnNlYXJjaFNldHRpbmdzKS50by5oYXZlLnByb3BlcnR5KCdzZWFyY2hVUkwnKTtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBvdXIgc3RhdGUgY29udGV4dFxuICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VhcmNoIHNldHRpbmdzIGludG8gdGhlIHN0YXRlIGNvbnRleHQsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIHRoZXNlIHNldHRpbmdzIGFyZSB1c2VkIGxhdGVyIGZvciBkZWNpZGluZyBpZiB3ZVxuICAgICAgICAgICAgLy8gbmVlZCB0byByZWNvbXB1dGUgZGF0YSBwYXJhbWV0ZXJzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3Qgc2VhcmNoU2V0dGluZ3MgPSBvcHRpb25zLnNlYXJjaFNldHRpbmdzO1xuICAgICAgICAgICAgc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaFVSTCA9IHNlYXJjaFNldHRpbmdzLnNlYXJjaFVSTDtcbiAgICAgICAgICAgIHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hNb2RlbEd1aWQgPSBzZWFyY2hTZXR0aW5ncy5zZWFyY2hNb2RlbEd1aWQ7XG4gICAgICAgICAgICBzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoTW9kZWwgPSBzZWFyY2hTZXR0aW5ncy5zZWFyY2hNb2RlbDtcbiAgICAgICAgICAgIHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYSA9IHNlYXJjaFNldHRpbmdzLnNlYXJjaE1vZGVsLmdlbmVyYXRlRmlsdGVyKCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFQYXJhbXMoc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhLmZpbHRlcik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQSBkZXN0cnVjdG9yLlxuICAgICAqL1xuICAgIHRlYXJEb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLl9kYXRhUHJvdmlkZXIgJiYgc2VsZi5fZGF0YVByb3ZpZGVyLm9mZikge1xuICAgICAgICAgICAgLy8gRGlzY2FyZCBhbGwgbGlzdGVuaW5nXG4gICAgICAgICAgICBzZWxmLl9kYXRhUHJvdmlkZXIub2ZmKCdhbGwnKTtcbiAgICAgICAgICAgIC8vIERpc2NhcmQgYWxsIGRhdGFcbiAgICAgICAgICAgIHNlbGYuX2RhdGFQcm92aWRlci5yZXNldCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHRvIGJpbmQgYSB2aWV3IHRvIHRoaXMgbWVkaWF0b3IuXG4gICAgICovXG4gICAgYXR0YWNoVmlldzogZnVuY3Rpb24odmlld0luc3RhbmNlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl92aWV3SW5zdGFuY2UgPSB2aWV3SW5zdGFuY2U7XG5cbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgIGlmIChzZWxmLl9lbmFibGVSZWZyZXNoKSB7XG4gICAgICAgICAgICAkZGF0YS5zZXRSZWZyZXNoQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yZWZyZXNoKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5fZW5hYmxlSW5maW5pdGUpIHtcbiAgICAgICAgICAgICRkYXRhLnNldEluZmluaXRlQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkTW9yZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGYuX3N0YXRlQ29udGV4dC5lbmFibGVTZWFyY2gpIHtcbiAgICAgICAgICAgICRkYXRhLnNldHVwU2VhcmNoKHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fdmlld0luc3RhbmNlLiRyb3V0ZXIuZ28oc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaFVSTCwge1xuICAgICAgICAgICAgICAgICAgICBkYXRhSWQ6IHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hNb2RlbEd1aWRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJGRhdGEuaW5pdCgpO1xuICAgIH0sXG5cbiAgICBkZXRhY2hWaWV3OiBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3ZpZXdJbnN0YW5jZSA9IG5vb3BWaWV3SW5zdGFuY2U7XG4gICAgfSxcblxuICAgIF9kZWZhdWx0U3RhcnRTZXJ2aWNlOiBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0ICRsb2FkZXIgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGxvYWRlcjtcbiAgICAgICAgJGxvYWRlci5zaG93KCk7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBzZWxmLmxvYWRJbml0RGF0YSgpO1xuICAgICAgICBjb25zdCBhbm90aGVyUCA9IHRvalF1ZXJ5RGVmZXJyZWQocHJvbWlzZSk7XG4gICAgICAgIGFub3RoZXJQLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2FkZXIuaGlkZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgbmVlZHMgdG8gYmUgb3ZlcnJpZGVkLlxuICAgICAqL1xuICAgIHN0YXJ0U2VydmljZUltcGw6IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fZGVmYXVsdFN0YXJ0U2VydmljZSgpO1xuICAgIH0sXG5cbiAgICBzdGFydFNlcnZpY2U6IGZ1bmN0aW9uKHZpZXdJbnNhbmNlOiBJVmlld0luc3RhbmNlLCBmcm9tQ2FjaGU/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLmF0dGFjaFZpZXcodmlld0luc2FuY2UpO1xuICAgICAgICBpZiAoZnJvbUNhY2hlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzZWxmLnJlbmRlckRhdGEoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuc3RhcnRTZXJ2aWNlSW1wbCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHN0b3BTZXJ2aWNlOiBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGV0YWNoVmlldygpO1xuICAgIH1cblxufSk7XG5cblxuXG5cblxuXG5cbiJdfQ==