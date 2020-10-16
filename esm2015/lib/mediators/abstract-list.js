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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Bwb2xwd2FyZS9mZS1tdmMvIiwic291cmNlcyI6WyJsaWIvbWVkaWF0b3JzL2Fic3RyYWN0LWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxPQUFPLEtBQUssWUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBRTFELE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7QUFFeEMsT0FBTyxFQUFFLElBQUksSUFBSSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUduRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUV4RCxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0FBNERsQyxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztJQUU1QyxVQUFVLEVBQUUsa0dBQWtHO0lBRTlHLElBQUksRUFBRSxVQUFTLFFBQWtDO1FBQzdDLE1BQU0sSUFBSSxHQUFxQixJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztRQUN0QyxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDO1FBQ25ELElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztRQUM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUM7UUFDdEQsSUFBSSxDQUFDLGVB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WUFDWixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxnQkFBZ0IsRUFBRTtRQUNkLE1BQU0sSUFBSSxHQUFxQixJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELFlBQVksRUFBRSxVQUFTLFdBQTBCLEVBQUUsU0FBbUI7UUFDbEUsTUFBTSxJQUFJLEdBQXFCLElBQUksQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdCLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtZQUNwQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDckI7YUFBTTtZQUNILElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQUVELFdBQVcsRUFBRTtRQUNULE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQztDQUVKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVPdmVydmlld1xuICogQW4gbWVkaWF0b3IgKG5hbWVkIGFmdGVyIHRoZSBtZWRpYXRvciBwYXR0ZXJuKVxuICogd2hpY2ggY29vcmRpbmF0ZXMgdmlld3MgYW5kIGNvbnRyb2xsZXJzLlxuICogV2Ugc3VwcG9ydCB0aGUgZm9sbG93aW5nIHVzZSBjYXNlczpcbiAqIDEuIEEgcGFnZSBpcyBmaXJzdCB0aW1lIGxvYWRlZCBhbmQgdGhlbiByZW5kZXJlZFxuICogMi4gQSBwYWdlIGlzIHJlZnJlc2hlZCBieSBwdWxsaW5nIGRvd25cbiAqIDMuIEEgcGFnZSBpcyByZW5kZXJlZCB3aXRoIG1vcmUgZGF0YVxuICogNC4gQSBwYWdlIGlzIHVwZGF0ZWQgYWZ0ZXIgc29tZSBzdGF0ZSBoYXMgY2hhbmdlZFxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGlzIGFuIHNidHJhY3QgY2xhc3M7IHlvdSBjYW5ub3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIGl0LlxuICovXG5cbmltcG9ydCAqIGFzIGRlcGVuZGVuY2llcyBmcm9tICdAcG9scHdhcmUvZmUtZGVwZW5kZW5jaWVzJztcblxuY29uc3QgQ2xhc3NCdWlsZGVyID0gZGVwZW5kZW5jaWVzLkNsYXNzO1xuXG5pbXBvcnQgeyBsaWZ0IGFzIGxpZnRJbnRvUHJvbWlzZSwgdG9qUXVlcnlEZWZlcnJlZCB9IGZyb20gJ0Bwb2xwd2FyZS9mZS11dGlsaXRpZXMnO1xuXG5pbXBvcnQgeyBJVmlld0luc3RhbmNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IG5vb3BWaWV3SW5zdGFuY2UgfSBmcm9tICcuL25vb3Atdmlldy1pbnN0YW5jZSc7XG5cbmNvbnN0IF8gPSBkZXBlbmRlbmNpZXMudW5kZXJzY29yZTtcblxuZXhwb3J0IGludGVyZmFjZSBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMge1xuICAgIGRhdGFQcm92aWRlcj86IGFueTtcbiAgICBkYXRhUGFyYW1zPzogYW55O1xuICAgIGRlZXBDb3B5PzogYm9vbGVhbjtcbiAgICB1c2VNb2RlbD86IGJvb2xlYW47XG4gICAgZW5hYmxlUmVmcmVzaDogYm9vbGVhbjtcbiAgICBlbmFibGVJbmZpbml0ZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTGlzdE1lZGlhdG9yUHVibGljIHtcblxuICAgIGRhdGFQcm92aWRlcih2YWx1ZT86IGFueSk6IGFueTtcbiAgICBkYXRhUGFyYW1zKHZhbHVlPzogYW55KTogYW55O1xuXG4gICAgdmlld0luc2FuY2UodmFsdWU/OiBJVmlld0luc3RhbmNlKTogSVZpZXdJbnN0YW5jZTtcblxuICAgIHN0YXJ0U2VydmljZSh2aWV3SW5zYW5jZTogSVZpZXdJbnN0YW5jZSwgZnJvbUNhY2hlPzogYm9vbGVhbik6IHZvaWQ7XG4gICAgc3RvcFNlcnZpY2UoKTogdm9pZDtcblxuICAgIGxvYWRJbml0RGF0YSgpOiBQcm9taXNlTGlrZTxhbnk+O1xuICAgIHJlZnJlc2goaXNQcm9ncmFtYXRpYz86IGJvb2xlYW4pOiBQcm9taXNlTGlrZTxhbnk+O1xuICAgIGxvYWRNb3JlKCk6IFByb21pc2VMaWtlPGFueT47XG5cbiAgICByZW5kZXJEYXRhKGFzeW5jPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgICBzZXRVcChvcHRpb25zPzogYW55KTogdm9pZDtcbiAgICB0ZWFyRG93bigpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElMaXN0TWVkaWF0b3JEZXYgZXh0ZW5kcyBJTGlzdE1lZGlhdG9yUHVibGljIHtcbiAgICBfc2V0dGluZ3M6IElMaXN0TWVkaWF0b3JDdG9yT3B0aW9ucztcbiAgICBfdmlld0luc3RhbmNlOiBJVmlld0luc3RhbmNlO1xuICAgIF9kYXRhUHJvdmlkZXI6IGFueTtcbiAgICBfZGF0YVBhcmFtczogYW55O1xuICAgIF9kZWVwQ29weTogYm9vbGVhbjtcbiAgICBfdXNlTW9kZWw6IGJvb2xlYW47XG4gICAgX2VuYWJsZVJlZnJlc2g6IGJvb2xlYW47XG4gICAgX2VuYWJsZUluZmluaXRlOiBib29sZWFuO1xuXG4gICAgX3N0YXRlQ29udGV4dDogYW55O1xuXG4gICAgX2lzSW5pdDogYm9vbGVhbjtcbiAgICBfaXNMb2FkaW5nRGF0YTogYm9vbGVhbjtcblxuICAgIHNhZmVseVJlYWREYXRhUHJvdmlkZXIoKTogYW55W107XG4gICAgZ2VuZXJhdGVJdGVtc0ludGVybmFsKGNvbGxlY3Rpb246IGFueSk6IGFueVtdO1xuXG4gICAgb25VcGRhdGVWaWV3KGV2dDogYW55KTogYW55O1xuICAgIGdlbmVyYXRlSXRlbXMoYXN5bmM/OiBib29sZWFuKTogdm9pZDtcblxuICAgIF9kZWZhdWx0U3RhcnRTZXJ2aWNlKCk6IHZvaWQ7XG5cbiAgICBhdHRhY2hWaWV3KHZpZXdJbnN0YW5jZSk6IHZvaWQ7XG4gICAgZGV0YWNoVmlldygpOiB2b2lkO1xuXG4gICAgc3RhcnRTZXJ2aWNlSW1wbCgpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgTGlzdE1lZGlhdG9yID0gQ2xhc3NCdWlsZGVyLmV4dGVuZCh7XG5cbiAgICBQcm9wZXJ0aWVzOiAnZGF0YVByb3ZpZGVyLGRhdGFQYXJhbXMsZGVlcENvcHksdXNlTW9kZWwsZW5hYmxlUmVmcmVzaCxlbmFibGVJbmZpbml0ZSxvblVwZGF0ZVZpZXcsdmlld0luc3RhbmNlJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHNldHRpbmdzOiBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3NldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgICAgIHNlbGYuX3ZpZXdJbnN0YW5jZSA9IG5vb3BWaWV3SW5zdGFuY2U7XG4gICAgICAgIHNlbGYuX2RhdGFQcm92aWRlciA9IHNldHRpbmdzLmRhdGFQcm92aWRlciB8fCBudWxsO1xuICAgICAgICBzZWxmLl9kYXRhUGFyYW1zID0gc2V0dGluZ3MuZGF0YVBhcmFtcyB8fCB7fTtcbiAgICAgICAgc2VsZi5fZGVlcENvcHkgPSBzZXR0aW5ncy5kZWVwQ29weSB8fCBmYWxzZTtcbiAgICAgICAgc2VsZi5fdXNlTW9kZWwgPSBzZXR0aW5ncy51c2VNb2RlbCB8fCBmYWxzZTtcbiAgICAgICAgc2VsZi5fZW5hYmxlUmVmcmVzaCA9IHNldHRpbmdzLmVuYWJsZVJlZnJlc2ggfHwgZmFsc2U7XG4gICAgICAgIHNlbGYuX2VuYWJsZUluZmluaXRlID0gc2V0dGluZ3MuZW5hYmxlSW5maW5pdGUgfHwgZmFsc2U7XG5cbiAgICAgICAgc2VsZi5fc3RhdGVDb250ZXh0ID0ge307XG4gICAgICAgIHNlbGYuX2lzSW5pdCA9IHRydWU7XG4gICAgICAgIHNlbGYuX2lzTG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgZ2VuZXJhdGVJdGVtc0ludGVybmFsOiBmdW5jdGlvbihjb2xsZWN0aW9uKTogYW55W10ge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IFtdO1xuICAgICAgICBpZiAoc2VsZi5fdXNlTW9kZWwpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgbmV3RGF0YS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZi5fZGVlcENvcHkpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgbmV3RGF0YS5wdXNoKF8uZXh0ZW5kKHt9LCBpdGVtLmF0dHJpYnV0ZXMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29sbGVjdGlvbi5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBuZXdEYXRhLnB1c2goaXRlbS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdEYXRhO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENvbXB1dGVzIHRoZSBzZXQgb2YgbW9kZWxzIGluIHRoZSBjdXJyZW50IGRhdGEgcHJvdmlkZXIuXG4gICAgICogTm90ZSB0aGF0IHdlIHN1cHBvcnQgYWxsIGtpbmRzIG9mIGRhdGEgcHJvdmlkZXJzLCBiYWNrYm9uZVxuICAgICAqIG9yIHNvbWV0aGluZyBzaW1pbGFyIGJhY2tib25lLlxuICAgICAqIE1vcmVvdmVyLCB0aGlzIG1ldGhvZCBtYXkgYmUgb3ZlcnJpZGVuLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBzYWZlbHlSZWFkRGF0YVByb3ZpZGVyOiBmdW5jdGlvbigpOiBhbnlbXSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBsZXQgbW9kZWxzOiBhbnk7XG4gICAgICAgIGlmIChzZWxmLl9kYXRhUHJvdmlkZXIubW9kZWxzKSB7XG4gICAgICAgICAgICBtb2RlbHMgPSBzZWxmLl9kYXRhUHJvdmlkZXIubW9kZWxzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbW9kZWxzID0gW107XG4gICAgICAgICAgICBzZWxmLl9kYXRhUHJvdmlkZXIuZm9yRWFjaChmdW5jdGlvbihvbmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgbW9kZWxzLnB1c2gob25lSXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWxzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgdGhlIGl0ZW1zIGZvciB0aGUgdmlld1xuICAgICAqIE5vdGUgdGhhdCB3ZSBvbmx5IHBlcmZvcm0gdGhlIGNoZWNraW5nIGluIHRoaXMgbWV0aG9kO1xuICAgICAqIGl0IGlzIE5vdCBuZWNlc3NhcnkgdG8gcGVmb3JtIHRoaXMga2luZCBvZiBjaGVja2luZyBpbiBvdGhlciBvdmVycmlkZW4gZ2VuZXJhdGVJdGVtcy5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFzeW5jXG4gICAgICogQHJldHVybnMge31cbiAgICAgKi9cbiAgICBnZW5lcmF0ZUl0ZW1zOiBmdW5jdGlvbihhc3luYyk6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgIGNvbnN0IG1vZGVscyA9IHNlbGYuc2FmZWx5UmVhZERhdGFQcm92aWRlcigpO1xuICAgICAgICBjb25zdCBuZXdEYXRhID0gc2VsZi5nZW5lcmF0ZUl0ZW1zSW50ZXJuYWwobW9kZWxzKTtcbiAgICAgICAgLy8gbmV3RGF0YSBpcyByZWFkeVxuICAgICAgICBpZiAoYXN5bmMgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHNlbGYub25VcGRhdGVWaWV3KHtcbiAgICAgICAgICAgICAgICBhZGQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlOiAncmVtb3RlJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBuZXdEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRkYXRhLmFzeW5jUHVzaChuZXdEYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYub25VcGRhdGVWaWV3KHtcbiAgICAgICAgICAgICAgICBhZGQ6IHRydWUsXG4gICAgICAgICAgICAgICAgc291cmNlOiAnY2FjaGUnLFxuICAgICAgICAgICAgICAgIGRhdGE6IG5ld0RhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJGRhdGEuc3luY1B1c2gobmV3RGF0YSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgZmlyc3QgcGFnZSBvZiBkYXRhIGZyb20gdGhlIHNlcnZlcixcbiAgICAgKiB3aXRob3V0IGFueSBsb2FkaW5nIGluZGljYXRvcjtcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VkIGludGVybmFsbHkuXG4gICAgICogQGZ1bmN0aW9uIGxvYWRJbml0RGF0YVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGxvYWRJbml0RGF0YTogZnVuY3Rpb24oKTogUHJvbWlzZUxpa2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuXG4gICAgICAgIGNvbnN0IGRhdGFQcm92aWRlciA9IHNlbGYuX2RhdGFQcm92aWRlcjtcbiAgICAgICAgLy8gV2UgbXVzdCByZXNldCBkYXRhIGJlZm9yZWhhbmRcbiAgICAgICAgZGF0YVByb3ZpZGVyLnJlc2V0KCk7XG4gICAgICAgIC8vIFRoZXJlIGFyZSBzaWRlIGVmZmVjdHMgaWYgYSBwYXJhbWV0ZXIgaXMgcGFzc2VkIGluIGdldCpwYWdlXG4gICAgICAgIC8vIFRoZXJlZm9yZSwgd2UgbmVlZCB0byBjbG9uZSBhIG5ldyBjb3B5IG9mIHRoaXMgcGFyYW1ldGVyXG4gICAgICAgIHNlbGYuX2lzTG9hZGluZ0RhdGEgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGRhdGFQYXJhbXMgPSBzZWxmLl9kYXRhUGFyYW1zO1xuICAgICAgICBsZXQgcHJvbWlzZSA9IGRhdGFQcm92aWRlci5nZXRGaXJzdFBhZ2UoeyBkYXRhOiBfLmV4dGVuZCh7fSwgZGF0YVBhcmFtcykgfSk7XG4gICAgICAgIHByb21pc2UgPSB0b2pRdWVyeURlZmVycmVkKHByb21pc2UpO1xuICAgICAgICBwcm9taXNlLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX2lzSW5pdCA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5faXNMb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgICAgICAkZGF0YS5jbGVhbigpO1xuICAgICAgICAgICAgJGRhdGEuaGFzTW9yZURhdGEoZGF0YVByb3ZpZGVyLmhhc05leHRQYWdlKCkpO1xuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUl0ZW1zKHRydWUgLypheW5jKi8pO1xuICAgICAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgaXNMb2FkaW5nRGF0YSBoYXBwZW5kcyB2ZXJ5IGxhdGUuXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgZGF0YSB3aXRob3V0IGFueSBsb2FkaW5nIG9wZXJhdGlvbnMuIEJ5IGRlZmF1bHQsIHRoaXMgaXMgaW52b2tlZFxuICAgICAqIGluIHRoZSBjb250ZXh0IG9mIG5vbi1hc3luYyBtb2RlLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXN5bmNcbiAgICAgKiBAZnVuY3Rpb24gcmVuZGVyRGF0YVxuICAgICAqL1xuICAgIHJlbmRlckRhdGE6IGZ1bmN0aW9uKGFzeW5jPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgICRkYXRhLmNsZWFuKCk7XG4gICAgICAgICRkYXRhLmhhc01vcmVEYXRhKHNlbGYuX2RhdGFQcm92aWRlci5oYXNOZXh0UGFnZSgpKTtcbiAgICAgICAgc2VsZi5nZW5lcmF0ZUl0ZW1zKGFzeW5jID09PSB0cnVlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVsb2FkcyBkYXRhIGFzIHRoZSByZXN1bHQgb2YgcHVsbGluZyBkb3duIG9wZXJhdGlvbi5cbiAgICAgKiBJdCBhc3N1bWVzIHRoYXQgdGhlIHVzZXIgaGFzIHB1bGxlZCBkb3duIHRoZSBwYWdlLCB0aHVzIHJlc2V0dGluZyB0aGUgcmVmcmVzaGluZ1xuICAgICAqIGluZGljYXRvciBhdCB0aGUgZW5kLlxuICAgICAqIEBwYXJhbSBpc1Byb2dyYW1hdGljIHtCb29sZWFufSBJbmRpY2F0ZXMgaWYgdGhpcyBpbnZvY2F0aW9uXG4gICAgICogaXMgZHVlIHRvIGFuIGludGVybmFsIGNhbGwsIHdpdGhvdXQgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgKiBAZnVuY3Rpb24gcmVmcmVzaFxuICAgICAqL1xuICAgIHJlZnJlc2g6IGZ1bmN0aW9uKGlzUHJvZ3JhbWF0aWM/OiBib29sZWFuKTogUHJvbWlzZUxpa2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgY29uc3QgJHJlZnJlc2hlciA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kcmVmcmVzaGVyO1xuICAgICAgICAkZGF0YS5oYXNNb3JlRGF0YSh0cnVlKTtcbiAgICAgICAgLy8gUmVmcmVzaCBsb2FkZXJcbiAgICAgICAgJHJlZnJlc2hlci5zaG93KGlzUHJvZ3JhbWF0aWMpO1xuICAgICAgICBjb25zdCBwcm1zID0gc2VsZi5sb2FkSW5pdERhdGEoKTtcbiAgICAgICAgY29uc3QgYW5vdGhlclAgPSB0b2pRdWVyeURlZmVycmVkKHBybXMpO1xuICAgICAgICByZXR1cm4gYW5vdGhlclAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHJlZnJlc2hlci5oaWRlKGlzUHJvZ3JhbWF0aWMpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgbW9yZSBkYXRhIGFzIHRoZSByZXN1bHQgb2Ygc2Nyb2xsaW5nIGRvd24uXG4gICAgICogSXQgYXNzdW1lcyB0aGF0IHRoZSB1c2VyIGhhcyBzY3JvbGwgZG93biBlbm91Z2gsIHRodXMgcmVzZXR0aW5nIHRoZSBsb2FkaW5nIG1vcmVcbiAgICAgKiBpbmRpY2F0b3IgYXQgdGhlIGVuZC5cbiAgICAgKiBAZnVuY3Rpb24gbG9hZE1vcmVcbiAgICAgKi9cbiAgICBsb2FkTW9yZTogZnVuY3Rpb24oKTogUHJvbWlzZUxpa2U8YW55PiB7XG5cbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGRhdGFQcm92aWRlciA9IHNlbGYuX2RhdGFQcm92aWRlcjtcbiAgICAgICAgY29uc3QgZGF0YVBhcmFtcyA9IHNlbGYuX2RhdGFQYXJhbXM7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICBjb25zdCAkbW9yZUxvYWRlciA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kbW9yZUxvYWRlcjtcblxuICAgICAgICAvLyBsb2FkTW9yZSBtYXkgYmUgaXNzdWVkIGJlZm9yZSBpbml0XG4gICAgICAgIGlmIChzZWxmLl9pc0luaXQpIHtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0SW50b1Byb21pc2UodHJ1ZSwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5faXNMb2FkaW5nRGF0YSkge1xuICAgICAgICAgICAgLy8gV2UgZG8gbm90IGRpc2FibGUgaW5maW5pdGUgc2Nyb2xsIGNvbXBsZXRlIC4uLlxuICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSB3YW50IHRvIHByZXZlbnQgZnJvbSB0d28gdGltZSBsb2FkTW9yZVxuICAgICAgICAgICAgLy8gYW5kIG9uZSBkaXNhYmxlIGZpbmFsbHkgaXMgc3VmZmljaWVudCB0byByZW1vdmUgaW5pZmluaXRlIHNjcm9sbCBpbmRpY2F0b3IuXG4gICAgICAgICAgICByZXR1cm4gbGlmdEludG9Qcm9taXNlKHRydWUsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhUHJvdmlkZXIuaGFzTmV4dFBhZ2UoKSkge1xuICAgICAgICAgICAgJGRhdGEuaGFzTW9yZURhdGEoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuIGxpZnRJbnRvUHJvbWlzZSh0cnVlLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRtb3JlTG9hZGVyLnNob3coKTtcblxuICAgICAgICAvLyBXZSBtdXN0IGNsb25lIGEgY29weSBkYXRhUGFyYW1zLCBhcyB0aGVyZSBhcmUgc2lkZVxuICAgICAgICAvLyBlZmZlY3RzIGluIHRoaXMgcGFyYW1ldGVyXG4gICAgICAgIHNlbGYuX2lzTG9hZGluZ0RhdGEgPSB0cnVlO1xuICAgICAgICBjb25zdCBwcm1zID0gZGF0YVByb3ZpZGVyLmdldE5leHRQYWdlKHsgZGF0YTogXy5leHRlbmQoe30sIGRhdGFQYXJhbXMpIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkZGF0YS5oYXNNb3JlRGF0YShkYXRhUHJvdmlkZXIuaGFzTmV4dFBhZ2UoKSk7XG4gICAgICAgICAgICBzZWxmLmdlbmVyYXRlSXRlbXModHJ1ZSAvKiBhc3luYyAqLyk7XG4gICAgICAgICAgICAvLyBUbyBlbnN1cmUgdGhhdCBpc0xvYWRpbmcgaGFwcGVuZHMgdmVyeSBsYXRlciwgd2UgaGF2ZSB0byBwdXQgaXNMb2FkaW5nIGluIHR3byBmdW5jdGlvbnMuXG4gICAgICAgICAgICBzZWxmLl9pc0xvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5faXNMb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYW5vdGhlclAgPSB0b2pRdWVyeURlZmVycmVkKHBybXMpO1xuXG4gICAgICAgIHJldHVybiBhbm90aGVyUC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbW9yZUxvYWRlci5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgY29udGV4dCBmb3IgdGhlIGRhdGEgcHJvdmlkZXIgaGFzIGNoYW5nZWQsIGZvclxuICAgICAqIHRoZSBwdXJwb3NlIG9mIGRlY2lkaW5nIGlmIHdlIG5lZWQgdG8gcmVsb2FkIGRhdGEuXG4gICAgICogQGZ1bmN0aW9uIHN0YXRlQ2hhbmdlZFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIHN0YXRlQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlQ29udGV4dCA9IHRoaXMuX3N0YXRlQ29udGV4dDtcbiAgICAgICAgaWYgKHN0YXRlQ29udGV4dC5lbmFibGVTZWFyY2ggPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZUNvbnRleHQuc2VhcmNoTW9kZWwuaXNDb25maXJtZWQoKSAmJiBzdGF0ZUNvbnRleHQuc2VhcmNoTW9kZWwuaGFzaENvZGUoKSAhPT0gc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhLmhhc2hDb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHN0YXRlIGFuZCByZWxvYWQgZGF0YSwgd2l0aCBsb2FkaW5nIGluZGljYXRvciBpZiBzZXRcbiAgICAgKiBAZnVuY3Rpb24gdXBkYXRlU3RhdGVBbmRSZWxvYWRcbiAgICAgKi9cbiAgICB1cGRhdGVTdGF0ZUFuZFJlbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zdCBzdGF0ZUNvbnRleHQgPSBzZWxmLl9zdGF0ZUNvbnRleHQ7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICBjb25zdCAkbG9hZGVyID0gc2VsZi5fdmlld0luc3RhbmNlLiRsb2FkZXI7XG4gICAgICAgIGlmIChzdGF0ZUNvbnRleHQuZW5hYmxlU2VhcmNoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEgPSBzdGF0ZUNvbnRleHQuc2VhcmNoTW9kZWwuZ2VuZXJhdGVGaWx0ZXIoKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YVBhcmFtcyhzdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEuZmlsdGVyKTtcbiAgICAgICAgICAgICRkYXRhLnVwZGF0ZVNlYXJjaENyaXRlcmlhKHN0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYSk7XG4gICAgICAgIH1cbiAgICAgICAgJGxvYWRlci5zaG93KCk7XG4gICAgICAgIGNvbnN0IHBybXMgPSBzZWxmLmxvYWRJbml0RGF0YSgpO1xuICAgICAgICBjb25zdCBhbm90aGVyUCA9IHRvalF1ZXJ5RGVmZXJyZWQocHJtcyk7XG5cbiAgICAgICAgYW5vdGhlclAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGxvYWRlci5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIGNvbnRleHQgYW5kIGhvb2tzIHVwIGRhdGEgd2l0aCB2aWV3LlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIG9ubHkgaW52b2tlZCBvbmNlIGFuZCBzaG91bGQgYmUgb25lIG9mIHRoZSBzdGVwcyBmb2xsb3dpbmcgY29uc3RydWN0b3IuXG4gICAgICogSW4gb3RoZXIgd29yZHMsIGl0IGlzIHBhcnQgb2YgYSBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqL1xuICAgIHNldFVwOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmVuYWJsZVNlYXJjaCkge1xuICAgICAgICAgICAgc2VsZi5fc3RhdGVDb250ZXh0LmVuYWJsZVNlYXJjaCA9IHRydWU7XG4gICAgICAgICAgICAvLyBXZSBleHBlY3QgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAvLyBjaGFpLmV4cGVjdChvcHRpb25zKS50by5oYXZlLnByb3BlcnR5KCdzZWFyY2hTZXR0aW5ncycpO1xuICAgICAgICAgICAgLy8gY2hhaS5leHBlY3Qob3B0aW9ucy5zZWFyY2hTZXR0aW5ncykudG8uaGF2ZS5wcm9wZXJ0eSgnc2VhcmNoTW9kZWwnKTtcbiAgICAgICAgICAgIC8vIGNoYWkuZXhwZWN0KG9wdGlvbnMuc2VhcmNoU2V0dGluZ3MpLnRvLmhhdmUucHJvcGVydHkoJ3NlYXJjaE1vZGVsR3VpZCcpO1xuICAgICAgICAgICAgLy8gY2hhaS5leHBlY3Qob3B0aW9ucy5zZWFyY2hTZXR0aW5ncykudG8uaGF2ZS5wcm9wZXJ0eSgnc2VhcmNoVVJMJyk7XG4gICAgICAgICAgICAvLyBDcmVhdGUgb3VyIHN0YXRlIGNvbnRleHRcbiAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlYXJjaCBzZXR0aW5ncyBpbnRvIHRoZSBzdGF0ZSBjb250ZXh0LFxuICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGVzZSBzZXR0aW5ncyBhcmUgdXNlZCBsYXRlciBmb3IgZGVjaWRpbmcgaWYgd2VcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gcmVjb21wdXRlIGRhdGEgcGFyYW1ldGVycyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaFNldHRpbmdzID0gb3B0aW9ucy5zZWFyY2hTZXR0aW5ncztcbiAgICAgICAgICAgIHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hVUkwgPSBzZWFyY2hTZXR0aW5ncy5zZWFyY2hVUkw7XG4gICAgICAgICAgICBzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoTW9kZWxHdWlkID0gc2VhcmNoU2V0dGluZ3Muc2VhcmNoTW9kZWxHdWlkO1xuICAgICAgICAgICAgc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaE1vZGVsID0gc2VhcmNoU2V0dGluZ3Muc2VhcmNoTW9kZWw7XG4gICAgICAgICAgICBzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEgPSBzZWFyY2hTZXR0aW5ncy5zZWFyY2hNb2RlbC5nZW5lcmF0ZUZpbHRlcigpO1xuICAgICAgICAgICAgc2VsZi5kYXRhUGFyYW1zKHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYS5maWx0ZXIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEEgZGVzdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICB0ZWFyRG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VsZi5fZGF0YVByb3ZpZGVyICYmIHNlbGYuX2RhdGFQcm92aWRlci5vZmYpIHtcbiAgICAgICAgICAgIC8vIERpc2NhcmQgYWxsIGxpc3RlbmluZ1xuICAgICAgICAgICAgc2VsZi5fZGF0YVByb3ZpZGVyLm9mZignYWxsJyk7XG4gICAgICAgICAgICAvLyBEaXNjYXJkIGFsbCBkYXRhXG4gICAgICAgICAgICBzZWxmLl9kYXRhUHJvdmlkZXIucmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCB0byBiaW5kIGEgdmlldyB0byB0aGlzIG1lZGlhdG9yLlxuICAgICAqL1xuICAgIGF0dGFjaFZpZXc6IGZ1bmN0aW9uKHZpZXdJbnN0YW5jZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fdmlld0luc3RhbmNlID0gdmlld0luc3RhbmNlO1xuXG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICBpZiAoc2VsZi5fZW5hYmxlUmVmcmVzaCkge1xuICAgICAgICAgICAgJGRhdGEuc2V0UmVmcmVzaENhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlbGYuX2VuYWJsZUluZmluaXRlKSB7XG4gICAgICAgICAgICAkZGF0YS5zZXRJbmZpbml0ZUNhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZE1vcmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLl9zdGF0ZUNvbnRleHQuZW5hYmxlU2VhcmNoKSB7XG4gICAgICAgICAgICAkZGF0YS5zZXR1cFNlYXJjaChzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3ZpZXdJbnN0YW5jZS4kcm91dGVyLmdvKHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hVUkwsIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YUlkOiBzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoTW9kZWxHdWlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRkYXRhLmluaXQoKTtcbiAgICB9LFxuXG4gICAgZGV0YWNoVmlldzogZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl92aWV3SW5zdGFuY2UgPSBub29wVmlld0luc3RhbmNlO1xuICAgIH0sXG5cbiAgICBfZGVmYXVsdFN0YXJ0U2VydmljZTogZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCAkbG9hZGVyID0gc2VsZi5fdmlld0luc3RhbmNlLiRsb2FkZXI7XG4gICAgICAgICRsb2FkZXIuc2hvdygpO1xuICAgICAgICBjb25zdCBwcm9taXNlID0gc2VsZi5sb2FkSW5pdERhdGEoKTtcbiAgICAgICAgY29uc3QgYW5vdGhlclAgPSB0b2pRdWVyeURlZmVycmVkKHByb21pc2UpO1xuICAgICAgICBhbm90aGVyUC5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbG9hZGVyLmhpZGUoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRlZC5cbiAgICAgKi9cbiAgICBzdGFydFNlcnZpY2VJbXBsOiBmdW5jdGlvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX2RlZmF1bHRTdGFydFNlcnZpY2UoKTtcbiAgICB9LFxuXG4gICAgc3RhcnRTZXJ2aWNlOiBmdW5jdGlvbih2aWV3SW5zYW5jZTogSVZpZXdJbnN0YW5jZSwgZnJvbUNhY2hlPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5hdHRhY2hWaWV3KHZpZXdJbnNhbmNlKTtcbiAgICAgICAgaWYgKGZyb21DYWNoZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2VsZi5yZW5kZXJEYXRhKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLnN0YXJ0U2VydmljZUltcGwoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wU2VydmljZTogZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmRldGFjaFZpZXcoKTtcbiAgICB9XG5cbn0pO1xuXG5cblxuXG5cblxuXG4iXX0=