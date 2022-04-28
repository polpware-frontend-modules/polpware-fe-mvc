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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3QtbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvbHB3YXJlL2ZlLW12Yy9zcmMvbGliL21lZGlhdG9ycy9hYnN0cmFjdC1saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztHQVdHO0FBRUgsT0FBTyxLQUFLLFlBQVksTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0FBRXhDLE9BQU8sRUFBRSxJQUFJLElBQUksZUFBZSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFHbkYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFeEQsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztBQTREbEMsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFFNUMsVUFBVSxFQUFFLGtHQUFrRztJQUU5RyxJQUFJLEVBQUUsVUFBUyxRQUFrQztRQUM3QyxNQUFNLElBQUksR0FBcUIsSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQztRQUNuRCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUM7UUFDNUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztRQUM1QyxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLElBQUksS0FB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QUMzQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ1osT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCLEVBQUU7UUFDZCxNQUFNLElBQUksR0FBcUIsSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxZQUFZLEVBQUUsVUFBUyxXQUEwQixFQUFFLFNBQW1CO1FBQ2xFLE1BQU0sSUFBSSxHQUFxQixJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ3JCO2FBQU07WUFDSCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUMzQjtJQUNMLENBQUM7SUFFRCxXQUFXLEVBQUU7UUFDVCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7Q0FFSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlT3ZlcnZpZXdcbiAqIEFuIG1lZGlhdG9yIChuYW1lZCBhZnRlciB0aGUgbWVkaWF0b3IgcGF0dGVybilcbiAqIHdoaWNoIGNvb3JkaW5hdGVzIHZpZXdzIGFuZCBjb250cm9sbGVycy5cbiAqIFdlIHN1cHBvcnQgdGhlIGZvbGxvd2luZyB1c2UgY2FzZXM6XG4gKiAxLiBBIHBhZ2UgaXMgZmlyc3QgdGltZSBsb2FkZWQgYW5kIHRoZW4gcmVuZGVyZWRcbiAqIDIuIEEgcGFnZSBpcyByZWZyZXNoZWQgYnkgcHVsbGluZyBkb3duXG4gKiAzLiBBIHBhZ2UgaXMgcmVuZGVyZWQgd2l0aCBtb3JlIGRhdGFcbiAqIDQuIEEgcGFnZSBpcyB1cGRhdGVkIGFmdGVyIHNvbWUgc3RhdGUgaGFzIGNoYW5nZWRcbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBpcyBhbiBzYnRyYWN0IGNsYXNzOyB5b3UgY2Fubm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBpdC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBkZXBlbmRlbmNpZXMgZnJvbSAnQHBvbHB3YXJlL2ZlLWRlcGVuZGVuY2llcyc7XG5cbmNvbnN0IENsYXNzQnVpbGRlciA9IGRlcGVuZGVuY2llcy5DbGFzcztcblxuaW1wb3J0IHsgbGlmdCBhcyBsaWZ0SW50b1Byb21pc2UsIHRvalF1ZXJ5RGVmZXJyZWQgfSBmcm9tICdAcG9scHdhcmUvZmUtdXRpbGl0aWVzJztcblxuaW1wb3J0IHsgSVZpZXdJbnN0YW5jZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBub29wVmlld0luc3RhbmNlIH0gZnJvbSAnLi9ub29wLXZpZXctaW5zdGFuY2UnO1xuXG5jb25zdCBfID0gZGVwZW5kZW5jaWVzLnVuZGVyc2NvcmU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxpc3RNZWRpYXRvckN0b3JPcHRpb25zIHtcbiAgICBkYXRhUHJvdmlkZXI/OiBhbnk7XG4gICAgZGF0YVBhcmFtcz86IGFueTtcbiAgICBkZWVwQ29weT86IGJvb2xlYW47XG4gICAgdXNlTW9kZWw/OiBib29sZWFuO1xuICAgIGVuYWJsZVJlZnJlc2g6IGJvb2xlYW47XG4gICAgZW5hYmxlSW5maW5pdGU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUxpc3RNZWRpYXRvclB1YmxpYyB7XG5cbiAgICBkYXRhUHJvdmlkZXIodmFsdWU/OiBhbnkpOiBhbnk7XG4gICAgZGF0YVBhcmFtcyh2YWx1ZT86IGFueSk6IGFueTtcblxuICAgIHZpZXdJbnNhbmNlKHZhbHVlPzogSVZpZXdJbnN0YW5jZSk6IElWaWV3SW5zdGFuY2U7XG5cbiAgICBzdGFydFNlcnZpY2Uodmlld0luc2FuY2U6IElWaWV3SW5zdGFuY2UsIGZyb21DYWNoZT86IGJvb2xlYW4pOiB2b2lkO1xuICAgIHN0b3BTZXJ2aWNlKCk6IHZvaWQ7XG5cbiAgICBsb2FkSW5pdERhdGEoKTogUHJvbWlzZUxpa2U8YW55PjtcbiAgICByZWZyZXNoKGlzUHJvZ3JhbWF0aWM/OiBib29sZWFuKTogUHJvbWlzZUxpa2U8YW55PjtcbiAgICBsb2FkTW9yZSgpOiBQcm9taXNlTGlrZTxhbnk+O1xuXG4gICAgcmVuZGVyRGF0YShhc3luYz86IGJvb2xlYW4pOiB2b2lkO1xuXG4gICAgc2V0VXAob3B0aW9ucz86IGFueSk6IHZvaWQ7XG4gICAgdGVhckRvd24oKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTGlzdE1lZGlhdG9yRGV2IGV4dGVuZHMgSUxpc3RNZWRpYXRvclB1YmxpYyB7XG4gICAgX3NldHRpbmdzOiBJTGlzdE1lZGlhdG9yQ3Rvck9wdGlvbnM7XG4gICAgX3ZpZXdJbnN0YW5jZTogSVZpZXdJbnN0YW5jZTtcbiAgICBfZGF0YVByb3ZpZGVyOiBhbnk7XG4gICAgX2RhdGFQYXJhbXM6IGFueTtcbiAgICBfZGVlcENvcHk6IGJvb2xlYW47XG4gICAgX3VzZU1vZGVsOiBib29sZWFuO1xuICAgIF9lbmFibGVSZWZyZXNoOiBib29sZWFuO1xuICAgIF9lbmFibGVJbmZpbml0ZTogYm9vbGVhbjtcblxuICAgIF9zdGF0ZUNvbnRleHQ6IGFueTtcblxuICAgIF9pc0luaXQ6IGJvb2xlYW47XG4gICAgX2lzTG9hZGluZ0RhdGE6IGJvb2xlYW47XG5cbiAgICBzYWZlbHlSZWFkRGF0YVByb3ZpZGVyKCk6IGFueVtdO1xuICAgIGdlbmVyYXRlSXRlbXNJbnRlcm5hbChjb2xsZWN0aW9uOiBhbnkpOiBhbnlbXTtcblxuICAgIG9uVXBkYXRlVmlldyhldnQ6IGFueSk6IGFueTtcbiAgICBnZW5lcmF0ZUl0ZW1zKGFzeW5jPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgICBfZGVmYXVsdFN0YXJ0U2VydmljZSgpOiB2b2lkO1xuXG4gICAgYXR0YWNoVmlldyh2aWV3SW5zdGFuY2UpOiB2b2lkO1xuICAgIGRldGFjaFZpZXcoKTogdm9pZDtcblxuICAgIHN0YXJ0U2VydmljZUltcGwoKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IExpc3RNZWRpYXRvciA9IENsYXNzQnVpbGRlci5leHRlbmQoe1xuXG4gICAgUHJvcGVydGllczogJ2RhdGFQcm92aWRlcixkYXRhUGFyYW1zLGRlZXBDb3B5LHVzZU1vZGVsLGVuYWJsZVJlZnJlc2gsZW5hYmxlSW5maW5pdGUsb25VcGRhdGVWaWV3LHZpZXdJbnN0YW5jZScsXG5cbiAgICBpbml0OiBmdW5jdGlvbihzZXR0aW5nczogSUxpc3RNZWRpYXRvckN0b3JPcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgICAgICBzZWxmLl92aWV3SW5zdGFuY2UgPSBub29wVmlld0luc3RhbmNlO1xuICAgICAgICBzZWxmLl9kYXRhUHJvdmlkZXIgPSBzZXR0aW5ncy5kYXRhUHJvdmlkZXIgfHwgbnVsbDtcbiAgICAgICAgc2VsZi5fZGF0YVBhcmFtcyA9IHNldHRpbmdzLmRhdGFQYXJhbXMgfHwge307XG4gICAgICAgIHNlbGYuX2RlZXBDb3B5ID0gc2V0dGluZ3MuZGVlcENvcHkgfHwgZmFsc2U7XG4gICAgICAgIHNlbGYuX3VzZU1vZGVsID0gc2V0dGluZ3MudXNlTW9kZWwgfHwgZmFsc2U7XG4gICAgICAgIHNlbGYuX2VuYWJsZVJlZnJlc2ggPSBzZXR0aW5ncy5lbmFibGVSZWZyZXNoIHx8IGZhbHNlO1xuICAgICAgICBzZWxmLl9lbmFibGVJbmZpbml0ZSA9IHNldHRpbmdzLmVuYWJsZUluZmluaXRlIHx8IGZhbHNlO1xuXG4gICAgICAgIHNlbGYuX3N0YXRlQ29udGV4dCA9IHt9O1xuICAgICAgICBzZWxmLl9pc0luaXQgPSB0cnVlO1xuICAgICAgICBzZWxmLl9pc0xvYWRpbmdEYXRhID0gZmFsc2U7XG4gICAgfSxcblxuICAgIGdlbmVyYXRlSXRlbXNJbnRlcm5hbDogZnVuY3Rpb24oY29sbGVjdGlvbik6IGFueVtdIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSBbXTtcbiAgICAgICAgaWYgKHNlbGYuX3VzZU1vZGVsKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGEucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGYuX2RlZXBDb3B5KSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIG5ld0RhdGEucHVzaChfLmV4dGVuZCh7fSwgaXRlbS5hdHRyaWJ1dGVzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgbmV3RGF0YS5wdXNoKGl0ZW0uYXR0cmlidXRlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3RGF0YTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlcyB0aGUgc2V0IG9mIG1vZGVscyBpbiB0aGUgY3VycmVudCBkYXRhIHByb3ZpZGVyLlxuICAgICAqIE5vdGUgdGhhdCB3ZSBzdXBwb3J0IGFsbCBraW5kcyBvZiBkYXRhIHByb3ZpZGVycywgYmFja2JvbmVcbiAgICAgKiBvciBzb21ldGhpbmcgc2ltaWxhciBiYWNrYm9uZS5cbiAgICAgKiBNb3Jlb3ZlciwgdGhpcyBtZXRob2QgbWF5IGJlIG92ZXJyaWRlbi5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgc2FmZWx5UmVhZERhdGFQcm92aWRlcjogZnVuY3Rpb24oKTogYW55W10ge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgbGV0IG1vZGVsczogYW55O1xuICAgICAgICBpZiAoc2VsZi5fZGF0YVByb3ZpZGVyLm1vZGVscykge1xuICAgICAgICAgICAgbW9kZWxzID0gc2VsZi5fZGF0YVByb3ZpZGVyLm1vZGVscztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZGVscyA9IFtdO1xuICAgICAgICAgICAgc2VsZi5fZGF0YVByb3ZpZGVyLmZvckVhY2goZnVuY3Rpb24ob25lSXRlbSkge1xuICAgICAgICAgICAgICAgIG1vZGVscy5wdXNoKG9uZUl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZGVscztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIHRoZSBpdGVtcyBmb3IgdGhlIHZpZXdcbiAgICAgKiBOb3RlIHRoYXQgd2Ugb25seSBwZXJmb3JtIHRoZSBjaGVja2luZyBpbiB0aGlzIG1ldGhvZDtcbiAgICAgKiBpdCBpcyBOb3QgbmVjZXNzYXJ5IHRvIHBlZm9ybSB0aGlzIGtpbmQgb2YgY2hlY2tpbmcgaW4gb3RoZXIgb3ZlcnJpZGVuIGdlbmVyYXRlSXRlbXMuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBhc3luY1xuICAgICAqIEByZXR1cm5zIHt9XG4gICAgICovXG4gICAgZ2VuZXJhdGVJdGVtczogZnVuY3Rpb24oYXN5bmMpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICBjb25zdCBtb2RlbHMgPSBzZWxmLnNhZmVseVJlYWREYXRhUHJvdmlkZXIoKTtcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IHNlbGYuZ2VuZXJhdGVJdGVtc0ludGVybmFsKG1vZGVscyk7XG4gICAgICAgIC8vIG5ld0RhdGEgaXMgcmVhZHlcbiAgICAgICAgaWYgKGFzeW5jID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzZWxmLm9uVXBkYXRlVmlldyh7XG4gICAgICAgICAgICAgICAgYWRkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJ3JlbW90ZScsXG4gICAgICAgICAgICAgICAgZGF0YTogbmV3RGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZGF0YS5hc3luY1B1c2gobmV3RGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLm9uVXBkYXRlVmlldyh7XG4gICAgICAgICAgICAgICAgYWRkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogJ2NhY2hlJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBuZXdEYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRkYXRhLnN5bmNQdXNoKG5ld0RhdGEpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIGZpcnN0IHBhZ2Ugb2YgZGF0YSBmcm9tIHRoZSBzZXJ2ZXIsXG4gICAgICogd2l0aG91dCBhbnkgbG9hZGluZyBpbmRpY2F0b3I7XG4gICAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBpbnRlcm5hbGx5LlxuICAgICAqIEBmdW5jdGlvbiBsb2FkSW5pdERhdGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBsb2FkSW5pdERhdGE6IGZ1bmN0aW9uKCk6IFByb21pc2VMaWtlPGFueT4ge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcblxuICAgICAgICBjb25zdCBkYXRhUHJvdmlkZXIgPSBzZWxmLl9kYXRhUHJvdmlkZXI7XG4gICAgICAgIC8vIFdlIG11c3QgcmVzZXQgZGF0YSBiZWZvcmVoYW5kXG4gICAgICAgIGRhdGFQcm92aWRlci5yZXNldCgpO1xuICAgICAgICAvLyBUaGVyZSBhcmUgc2lkZSBlZmZlY3RzIGlmIGEgcGFyYW1ldGVyIGlzIHBhc3NlZCBpbiBnZXQqcGFnZVxuICAgICAgICAvLyBUaGVyZWZvcmUsIHdlIG5lZWQgdG8gY2xvbmUgYSBuZXcgY29weSBvZiB0aGlzIHBhcmFtZXRlclxuICAgICAgICBzZWxmLl9pc0xvYWRpbmdEYXRhID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBkYXRhUGFyYW1zID0gc2VsZi5fZGF0YVBhcmFtcztcbiAgICAgICAgbGV0IHByb21pc2UgPSBkYXRhUHJvdmlkZXIuZ2V0Rmlyc3RQYWdlKHsgZGF0YTogXy5leHRlbmQoe30sIGRhdGFQYXJhbXMpIH0pO1xuICAgICAgICBwcm9taXNlID0gdG9qUXVlcnlEZWZlcnJlZChwcm9taXNlKTtcbiAgICAgICAgcHJvbWlzZS5hbHdheXMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9pc0luaXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHNlbGYuX2lzTG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICAgICAgJGRhdGEuY2xlYW4oKTtcbiAgICAgICAgICAgICRkYXRhLmhhc01vcmVEYXRhKGRhdGFQcm92aWRlci5oYXNOZXh0UGFnZSgpKTtcbiAgICAgICAgICAgIHNlbGYuZ2VuZXJhdGVJdGVtcyh0cnVlIC8qYXluYyovKTtcbiAgICAgICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IGlzTG9hZGluZ0RhdGEgaGFwcGVuZHMgdmVyeSBsYXRlLlxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIGRhdGEgd2l0aG91dCBhbnkgbG9hZGluZyBvcGVyYXRpb25zLiBCeSBkZWZhdWx0LCB0aGlzIGlzIGludm9rZWRcbiAgICAgKiBpbiB0aGUgY29udGV4dCBvZiBub24tYXN5bmMgbW9kZS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGFzeW5jXG4gICAgICogQGZ1bmN0aW9uIHJlbmRlckRhdGFcbiAgICAgKi9cbiAgICByZW5kZXJEYXRhOiBmdW5jdGlvbihhc3luYz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIGNvbnN0ICRkYXRhID0gc2VsZi5fdmlld0luc3RhbmNlLiRkYXRhO1xuICAgICAgICAkZGF0YS5jbGVhbigpO1xuICAgICAgICAkZGF0YS5oYXNNb3JlRGF0YShzZWxmLl9kYXRhUHJvdmlkZXIuaGFzTmV4dFBhZ2UoKSk7XG4gICAgICAgIHNlbGYuZ2VuZXJhdGVJdGVtcyhhc3luYyA9PT0gdHJ1ZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbG9hZHMgZGF0YSBhcyB0aGUgcmVzdWx0IG9mIHB1bGxpbmcgZG93biBvcGVyYXRpb24uXG4gICAgICogSXQgYXNzdW1lcyB0aGF0IHRoZSB1c2VyIGhhcyBwdWxsZWQgZG93biB0aGUgcGFnZSwgdGh1cyByZXNldHRpbmcgdGhlIHJlZnJlc2hpbmdcbiAgICAgKiBpbmRpY2F0b3IgYXQgdGhlIGVuZC5cbiAgICAgKiBAcGFyYW0gaXNQcm9ncmFtYXRpYyB7Qm9vbGVhbn0gSW5kaWNhdGVzIGlmIHRoaXMgaW52b2NhdGlvblxuICAgICAqIGlzIGR1ZSB0byBhbiBpbnRlcm5hbCBjYWxsLCB3aXRob3V0IHVzZXIgaW50ZXJhY3Rpb24uXG4gICAgICogQGZ1bmN0aW9uIHJlZnJlc2hcbiAgICAgKi9cbiAgICByZWZyZXNoOiBmdW5jdGlvbihpc1Byb2dyYW1hdGljPzogYm9vbGVhbik6IFByb21pc2VMaWtlPGFueT4ge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgJGRhdGEgPSBzZWxmLl92aWV3SW5zdGFuY2UuJGRhdGE7XG4gICAgICAgIGNvbnN0ICRyZWZyZXNoZXIgPSBzZWxmLl92aWV3SW5zdGFuY2UuJHJlZnJlc2hlcjtcbiAgICAgICAgJGRhdGEuaGFzTW9yZURhdGEodHJ1ZSk7XG4gICAgICAgIC8vIFJlZnJlc2ggbG9hZGVyXG4gICAgICAgICRyZWZyZXNoZXIuc2hvdyhpc1Byb2dyYW1hdGljKTtcbiAgICAgICAgY29uc3QgcHJtcyA9IHNlbGYubG9hZEluaXREYXRhKCk7XG4gICAgICAgIGNvbnN0IGFub3RoZXJQID0gdG9qUXVlcnlEZWZlcnJlZChwcm1zKTtcbiAgICAgICAgcmV0dXJuIGFub3RoZXJQLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRyZWZyZXNoZXIuaGlkZShpc1Byb2dyYW1hdGljKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWRzIG1vcmUgZGF0YSBhcyB0aGUgcmVzdWx0IG9mIHNjcm9sbGluZyBkb3duLlxuICAgICAqIEl0IGFzc3VtZXMgdGhhdCB0aGUgdXNlciBoYXMgc2Nyb2xsIGRvd24gZW5vdWdoLCB0aHVzIHJlc2V0dGluZyB0aGUgbG9hZGluZyBtb3JlXG4gICAgICogaW5kaWNhdG9yIGF0IHRoZSBlbmQuXG4gICAgICogQGZ1bmN0aW9uIGxvYWRNb3JlXG4gICAgICovXG4gICAgbG9hZE1vcmU6IGZ1bmN0aW9uKCk6IFByb21pc2VMaWtlPGFueT4ge1xuXG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBjb25zdCBkYXRhUHJvdmlkZXIgPSBzZWxmLl9kYXRhUHJvdmlkZXI7XG4gICAgICAgIGNvbnN0IGRhdGFQYXJhbXMgPSBzZWxmLl9kYXRhUGFyYW1zO1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgY29uc3QgJG1vcmVMb2FkZXIgPSBzZWxmLl92aWV3SW5zdGFuY2UuJG1vcmVMb2FkZXI7XG5cbiAgICAgICAgLy8gbG9hZE1vcmUgbWF5IGJlIGlzc3VlZCBiZWZvcmUgaW5pdFxuICAgICAgICBpZiAoc2VsZi5faXNJbml0KSB7XG4gICAgICAgICAgICByZXR1cm4gbGlmdEludG9Qcm9taXNlKHRydWUsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuX2lzTG9hZGluZ0RhdGEpIHtcbiAgICAgICAgICAgIC8vIFdlIGRvIG5vdCBkaXNhYmxlIGluZmluaXRlIHNjcm9sbCBjb21wbGV0ZSAuLi5cbiAgICAgICAgICAgIC8vIGJlY2F1c2Ugd2Ugd2FudCB0byBwcmV2ZW50IGZyb20gdHdvIHRpbWUgbG9hZE1vcmVcbiAgICAgICAgICAgIC8vIGFuZCBvbmUgZGlzYWJsZSBmaW5hbGx5IGlzIHN1ZmZpY2llbnQgdG8gcmVtb3ZlIGluaWZpbml0ZSBzY3JvbGwgaW5kaWNhdG9yLlxuICAgICAgICAgICAgcmV0dXJuIGxpZnRJbnRvUHJvbWlzZSh0cnVlLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YVByb3ZpZGVyLmhhc05leHRQYWdlKCkpIHtcbiAgICAgICAgICAgICRkYXRhLmhhc01vcmVEYXRhKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiBsaWZ0SW50b1Byb21pc2UodHJ1ZSwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICAkbW9yZUxvYWRlci5zaG93KCk7XG5cbiAgICAgICAgLy8gV2UgbXVzdCBjbG9uZSBhIGNvcHkgZGF0YVBhcmFtcywgYXMgdGhlcmUgYXJlIHNpZGVcbiAgICAgICAgLy8gZWZmZWN0cyBpbiB0aGlzIHBhcmFtZXRlclxuICAgICAgICBzZWxmLl9pc0xvYWRpbmdEYXRhID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgcHJtcyA9IGRhdGFQcm92aWRlci5nZXROZXh0UGFnZSh7IGRhdGE6IF8uZXh0ZW5kKHt9LCBkYXRhUGFyYW1zKSB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGRhdGEuaGFzTW9yZURhdGEoZGF0YVByb3ZpZGVyLmhhc05leHRQYWdlKCkpO1xuICAgICAgICAgICAgc2VsZi5nZW5lcmF0ZUl0ZW1zKHRydWUgLyogYXN5bmMgKi8pO1xuICAgICAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgaXNMb2FkaW5nIGhhcHBlbmRzIHZlcnkgbGF0ZXIsIHdlIGhhdmUgdG8gcHV0IGlzTG9hZGluZyBpbiB0d28gZnVuY3Rpb25zLlxuICAgICAgICAgICAgc2VsZi5faXNMb2FkaW5nRGF0YSA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX2lzTG9hZGluZ0RhdGEgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFub3RoZXJQID0gdG9qUXVlcnlEZWZlcnJlZChwcm1zKTtcblxuICAgICAgICByZXR1cm4gYW5vdGhlclAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJG1vcmVMb2FkZXIuaGlkZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIGNvbnRleHQgZm9yIHRoZSBkYXRhIHByb3ZpZGVyIGhhcyBjaGFuZ2VkLCBmb3JcbiAgICAgKiB0aGUgcHVycG9zZSBvZiBkZWNpZGluZyBpZiB3ZSBuZWVkIHRvIHJlbG9hZCBkYXRhLlxuICAgICAqIEBmdW5jdGlvbiBzdGF0ZUNoYW5nZWRcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBzdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzdGF0ZUNvbnRleHQgPSB0aGlzLl9zdGF0ZUNvbnRleHQ7XG4gICAgICAgIGlmIChzdGF0ZUNvbnRleHQuZW5hYmxlU2VhcmNoID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGVDb250ZXh0LnNlYXJjaE1vZGVsLmlzQ29uZmlybWVkKCkgJiYgc3RhdGVDb250ZXh0LnNlYXJjaE1vZGVsLmhhc2hDb2RlKCkgIT09IHN0YXRlQ29udGV4dC5zZWFyY2hDcml0ZXJpYS5oYXNoQ29kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyBzdGF0ZSBhbmQgcmVsb2FkIGRhdGEsIHdpdGggbG9hZGluZyBpbmRpY2F0b3IgaWYgc2V0XG4gICAgICogQGZ1bmN0aW9uIHVwZGF0ZVN0YXRlQW5kUmVsb2FkXG4gICAgICovXG4gICAgdXBkYXRlU3RhdGVBbmRSZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgY29uc3Qgc3RhdGVDb250ZXh0ID0gc2VsZi5fc3RhdGVDb250ZXh0O1xuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgY29uc3QgJGxvYWRlciA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kbG9hZGVyO1xuICAgICAgICBpZiAoc3RhdGVDb250ZXh0LmVuYWJsZVNlYXJjaCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhID0gc3RhdGVDb250ZXh0LnNlYXJjaE1vZGVsLmdlbmVyYXRlRmlsdGVyKCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFQYXJhbXMoc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhLmZpbHRlcik7XG4gICAgICAgICAgICAkZGF0YS51cGRhdGVTZWFyY2hDcml0ZXJpYShzdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEpO1xuICAgICAgICB9XG4gICAgICAgICRsb2FkZXIuc2hvdygpO1xuICAgICAgICBjb25zdCBwcm1zID0gc2VsZi5sb2FkSW5pdERhdGEoKTtcbiAgICAgICAgY29uc3QgYW5vdGhlclAgPSB0b2pRdWVyeURlZmVycmVkKHBybXMpO1xuXG4gICAgICAgIGFub3RoZXJQLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2FkZXIuaGlkZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBjb250ZXh0IGFuZCBob29rcyB1cCBkYXRhIHdpdGggdmlldy5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBvbmx5IGludm9rZWQgb25jZSBhbmQgc2hvdWxkIGJlIG9uZSBvZiB0aGUgc3RlcHMgZm9sbG93aW5nIGNvbnN0cnVjdG9yLlxuICAgICAqIEluIG90aGVyIHdvcmRzLCBpdCBpcyBwYXJ0IG9mIGEgY29uc3RydWN0b3IuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKi9cbiAgICBzZXRVcDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICBpZiAob3B0aW9ucy5lbmFibGVTZWFyY2gpIHtcbiAgICAgICAgICAgIHNlbGYuX3N0YXRlQ29udGV4dC5lbmFibGVTZWFyY2ggPSB0cnVlO1xuICAgICAgICAgICAgLy8gV2UgZXhwZWN0IHRoZSBmb2xsb3dpbmcgcHJvcGVydGllc1xuICAgICAgICAgICAgLy8gY2hhaS5leHBlY3Qob3B0aW9ucykudG8uaGF2ZS5wcm9wZXJ0eSgnc2VhcmNoU2V0dGluZ3MnKTtcbiAgICAgICAgICAgIC8vIGNoYWkuZXhwZWN0KG9wdGlvbnMuc2VhcmNoU2V0dGluZ3MpLnRvLmhhdmUucHJvcGVydHkoJ3NlYXJjaE1vZGVsJyk7XG4gICAgICAgICAgICAvLyBjaGFpLmV4cGVjdChvcHRpb25zLnNlYXJjaFNldHRpbmdzKS50by5oYXZlLnByb3BlcnR5KCdzZWFyY2hNb2RlbEd1aWQnKTtcbiAgICAgICAgICAgIC8vIGNoYWkuZXhwZWN0KG9wdGlvbnMuc2VhcmNoU2V0dGluZ3MpLnRvLmhhdmUucHJvcGVydHkoJ3NlYXJjaFVSTCcpO1xuICAgICAgICAgICAgLy8gQ3JlYXRlIG91ciBzdGF0ZSBjb250ZXh0XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBzZWFyY2ggc2V0dGluZ3MgaW50byB0aGUgc3RhdGUgY29udGV4dCxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhlc2Ugc2V0dGluZ3MgYXJlIHVzZWQgbGF0ZXIgZm9yIGRlY2lkaW5nIGlmIHdlXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHJlY29tcHV0ZSBkYXRhIHBhcmFtZXRlcnMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hTZXR0aW5ncyA9IG9wdGlvbnMuc2VhcmNoU2V0dGluZ3M7XG4gICAgICAgICAgICBzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoVVJMID0gc2VhcmNoU2V0dGluZ3Muc2VhcmNoVVJMO1xuICAgICAgICAgICAgc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaE1vZGVsR3VpZCA9IHNlYXJjaFNldHRpbmdzLnNlYXJjaE1vZGVsR3VpZDtcbiAgICAgICAgICAgIHNlbGYuX3N0YXRlQ29udGV4dC5zZWFyY2hNb2RlbCA9IHNlYXJjaFNldHRpbmdzLnNlYXJjaE1vZGVsO1xuICAgICAgICAgICAgc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhID0gc2VhcmNoU2V0dGluZ3Muc2VhcmNoTW9kZWwuZ2VuZXJhdGVGaWx0ZXIoKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YVBhcmFtcyhzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoQ3JpdGVyaWEuZmlsdGVyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBIGRlc3RydWN0b3IuXG4gICAgICovXG4gICAgdGVhckRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYuX2RhdGFQcm92aWRlciAmJiBzZWxmLl9kYXRhUHJvdmlkZXIub2ZmKSB7XG4gICAgICAgICAgICAvLyBEaXNjYXJkIGFsbCBsaXN0ZW5pbmdcbiAgICAgICAgICAgIHNlbGYuX2RhdGFQcm92aWRlci5vZmYoJ2FsbCcpO1xuICAgICAgICAgICAgLy8gRGlzY2FyZCBhbGwgZGF0YVxuICAgICAgICAgICAgc2VsZi5fZGF0YVByb3ZpZGVyLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnQgdG8gYmluZCBhIHZpZXcgdG8gdGhpcyBtZWRpYXRvci5cbiAgICAgKi9cbiAgICBhdHRhY2hWaWV3OiBmdW5jdGlvbih2aWV3SW5zdGFuY2UpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuX3ZpZXdJbnN0YW5jZSA9IHZpZXdJbnN0YW5jZTtcblxuICAgICAgICBjb25zdCAkZGF0YSA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kZGF0YTtcbiAgICAgICAgaWYgKHNlbGYuX2VuYWJsZVJlZnJlc2gpIHtcbiAgICAgICAgICAgICRkYXRhLnNldFJlZnJlc2hDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlZnJlc2goKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLl9lbmFibGVJbmZpbml0ZSkge1xuICAgICAgICAgICAgJGRhdGEuc2V0SW5maW5pdGVDYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRNb3JlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5fc3RhdGVDb250ZXh0LmVuYWJsZVNlYXJjaCkge1xuICAgICAgICAgICAgJGRhdGEuc2V0dXBTZWFyY2goc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaENyaXRlcmlhLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl92aWV3SW5zdGFuY2UuJHJvdXRlci5nbyhzZWxmLl9zdGF0ZUNvbnRleHQuc2VhcmNoVVJMLCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFJZDogc2VsZi5fc3RhdGVDb250ZXh0LnNlYXJjaE1vZGVsR3VpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkZGF0YS5pbml0KCk7XG4gICAgfSxcblxuICAgIGRldGFjaFZpZXc6IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgc2VsZi5fdmlld0luc3RhbmNlID0gbm9vcFZpZXdJbnN0YW5jZTtcbiAgICB9LFxuXG4gICAgX2RlZmF1bHRTdGFydFNlcnZpY2U6IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmOiBJTGlzdE1lZGlhdG9yRGV2ID0gdGhpcztcbiAgICAgICAgY29uc3QgJGxvYWRlciA9IHNlbGYuX3ZpZXdJbnN0YW5jZS4kbG9hZGVyO1xuICAgICAgICAkbG9hZGVyLnNob3coKTtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHNlbGYubG9hZEluaXREYXRhKCk7XG4gICAgICAgIGNvbnN0IGFub3RoZXJQID0gdG9qUXVlcnlEZWZlcnJlZChwcm9taXNlKTtcbiAgICAgICAgYW5vdGhlclAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGxvYWRlci5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBuZWVkcyB0byBiZSBvdmVycmlkZWQuXG4gICAgICovXG4gICAgc3RhcnRTZXJ2aWNlSW1wbDogZnVuY3Rpb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbGY6IElMaXN0TWVkaWF0b3JEZXYgPSB0aGlzO1xuICAgICAgICBzZWxmLl9kZWZhdWx0U3RhcnRTZXJ2aWNlKCk7XG4gICAgfSxcblxuICAgIHN0YXJ0U2VydmljZTogZnVuY3Rpb24odmlld0luc2FuY2U6IElWaWV3SW5zdGFuY2UsIGZyb21DYWNoZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2VsZjogSUxpc3RNZWRpYXRvckRldiA9IHRoaXM7XG4gICAgICAgIHNlbGYuYXR0YWNoVmlldyh2aWV3SW5zYW5jZSk7XG4gICAgICAgIGlmIChmcm9tQ2FjaGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHNlbGYucmVuZGVyRGF0YSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5zdGFydFNlcnZpY2VJbXBsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcFNlcnZpY2U6IGZ1bmN0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kZXRhY2hWaWV3KCk7XG4gICAgfVxuXG59KTtcblxuXG5cblxuXG5cblxuIl19