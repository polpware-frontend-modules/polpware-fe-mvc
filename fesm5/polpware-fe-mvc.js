import { underscore, Class, backbone as backbone$1 } from '@polpware/fe-dependencies';
import { tojQueryDeferred, lift, pushArray } from '@polpware/fe-utilities';
import { fromEvent } from 'rxjs';
import { debounceTime, buffer, map } from 'rxjs/operators';

var _ = underscore;
var noop = _.noop;
var noopViewInstance = {
    $data: {
        init: noop,
        setRefreshCallback: noop,
        setInfiniteCallback: noop,
        clean: noop,
        asyncPush: noop,
        syncPush: noop,
        asyncPop: noop,
        syncPop: noop,
        asyncPrepend: noop,
        syncPrepend: noop,
        asyncRefresh: noop,
        syncRefresh: noop,
        hasMoreData: noop,
        getItems: noop,
        setupSearch: noop,
        updateSearchCriteria: noop,
        getAncestor: noop
    },
    $loader: {
        show: noop,
        hide: noop
    },
    $refresher: {
        show: noop,
        hide: noop
    },
    $moreLoader: {
        show: noop,
        hide: noop
    },
    $router: {
        go: noop
    },
    $render: {
        ready: noop,
        destroy: noop,
        asyncDigest: noop
    },
    $navBar: {
        /**
         * Get current state
         * @returns {}
         */
        getState: noop,
        /**
         * Set state
         * @param {Boolean} s
         */
        setState: noop
    },
    $modal: {
        setData: noop,
        getData: noop,
        build: noop
    },
    $popover: {
        setData: noop,
        getData: noop,
        build: noop,
        onHidden: noop
    },
    $popup: {
        setData: noop,
        getData: noop,
        build: noop,
        confirm: noop,
        prompt: noop,
        alert: noop
    },
    $progressBar: {
        create: noop,
        reset: noop,
        createInfinite: noop,
        onProgress: noop,
        destroy: noop,
        destroyInfinite: noop,
        showAbort: noop
    },
    $alertify: noop,
    $history: {
        goBack: noop
    }
};

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
var ClassBuilder = Class;
var _$1 = underscore;
var ListMediator = ClassBuilder.extend({
    Properties: 'dataProvider,dataParams,deepCopy,useModel,enableRefresh,enableInfinite,onUpdateView,viewInstance',
    init: function (settings) {
        var self = this;
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
        var self = this;
        var newData = [];
        if (self._useModel) {
            collection.forEach(function (item) {
                newData.push(item);
            });
        }
        else if (self._deepCopy) {
            collection.forEach(function (item) {
                newData.push(_$1.extend({}, item.attributes));
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
        var self = this;
        var models;
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
        var self = this;
        var $data = self._viewInstance.$data;
        var models = self.safelyReadDataProvider();
        var newData = self.generateItemsInternal(models);
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
        var self = this;
        var dataProvider = self._dataProvider;
        // We must reset data beforehand
        dataProvider.reset();
        // There are side effects if a parameter is passed in get*page
        // Therefore, we need to clone a new copy of this parameter
        self._isLoadingData = true;
        var dataParams = self._dataParams;
        var promise = dataProvider.getFirstPage({ data: _$1.extend({}, dataParams) });
        promise = tojQueryDeferred(promise);
        promise.always(function () {
            self._isInit = false;
            self._isLoadingData = false;
        });
        return promise.then(function () {
            var $data = self._viewInstance.$data;
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
        var self = this;
        var $data = self._viewInstance.$data;
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
        var self = this;
        var $data = self._viewInstance.$data;
        var $refresher = self._viewInstance.$refresher;
        $data.hasMoreData(true);
        // Refresh loader
        $refresher.show(isProgramatic);
        var prms = self.loadInitData();
        var anotherP = tojQueryDeferred(prms);
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
        var self = this;
        var dataProvider = self._dataProvider;
        var dataParams = self._dataParams;
        var $data = self._viewInstance.$data;
        var $moreLoader = self._viewInstance.$moreLoader;
        // loadMore may be issued before init
        if (self._isInit) {
            $moreLoader.hide();
            return lift(true, null);
        }
        if (self._isLoadingData) {
            // We do not disable infinite scroll complete ...
            // because we want to prevent from two time loadMore
            // and one disable finally is sufficient to remove inifinite scroll indicator.
            return lift(true, null);
        }
        if (!dataProvider.hasNextPage()) {
            $data.hasMoreData(false);
            $moreLoader.hide();
            return lift(true, null);
        }
        $moreLoader.show();
        // We must clone a copy dataParams, as there are side
        // effects in this parameter
        self._isLoadingData = true;
        var prms = dataProvider.getNextPage({ data: _$1.extend({}, dataParams) }).then(function () {
            $data.hasMoreData(dataProvider.hasNextPage());
            self.generateItems(true /* async */);
            // To ensure that isLoading happends very later, we have to put isLoading in two functions.
            self._isLoadingData = false;
        }, function () {
            self._isLoadingData = false;
        });
        var anotherP = tojQueryDeferred(prms);
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
        var stateContext = this._stateContext;
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
        var self = this;
        var stateContext = self._stateContext;
        var $data = self._viewInstance.$data;
        var $loader = self._viewInstance.$loader;
        if (stateContext.enableSearch === true) {
            stateContext.searchCriteria = stateContext.searchModel.generateFilter();
            self.dataParams(stateContext.searchCriteria.filter);
            $data.updateSearchCriteria(stateContext.searchCriteria);
        }
        $loader.show();
        var prms = self.loadInitData();
        var anotherP = tojQueryDeferred(prms);
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
        var self = this;
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
            var searchSettings = options.searchSettings;
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
        var self = this;
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
        var self = this;
        self._viewInstance = viewInstance;
        var $data = self._viewInstance.$data;
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
        var self = this;
        self._viewInstance = noopViewInstance;
    },
    _defaultStartService: function () {
        var self = this;
        var $loader = self._viewInstance.$loader;
        $loader.show();
        var promise = self.loadInitData();
        var anotherP = tojQueryDeferred(promise);
        anotherP.always(function () {
            $loader.hide();
        });
    },
    /**
     * This method needs to be overrided.
     */
    startServiceImpl: function () {
        var self = this;
        self._defaultStartService();
    },
    startService: function (viewInsance, fromCache) {
        var self = this;
        self.attachView(viewInsance);
        if (fromCache === true) {
            self.renderData();
        }
        else {
            self.startServiceImpl();
        }
    },
    stopService: function () {
        var self = this;
        self.detachView();
    }
});

var NgStoreListMediator = ListMediator.extend({
    init: function (settings) {
        var self = this;
        self._super(settings);
        self._ngStore = null;
    },
    setNgStore: function (store) {
        var self = this;
        self._ngStore = store;
    },
    getNgStore: function () {
        var self = this;
        return self._ngStore;
    },
    safelyReadDataProvider: function () {
        var self = this;
        var models = self._super();
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
        var self = this;
        var $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
        var subscription = self._ngStore.getState().subscribe(function (savedData) {
            var newData = self.generateItemsInternal(savedData.items);
            if (async === true) {
                $data.asyncPush(newData);
            }
            else {
                $data.syncPush(newData);
            }
            setTimeout(function () {
                subscription.unsubscribe();
            }, 1);
        });
    }
});

/**
 * @fileOverview
 * This module implements a list mediator that may quickly
 * get updated on any operation in this list.
 * E.g., add, remove, update
 */
var _$2 = underscore;
var backbone = backbone$1;
var WritableListMediator = ListMediator.extend({
    Properties: 'viewLevelData,globalProvider',
    init: function (settings) {
        var self = this;
        self._super(settings);
        var CollectionCtor = backbone.Collection.extend();
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
        var self = this;
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
        var self = this;
        var args = arguments;
        // If we are loading data, the data we are receiving is
        // the result of the current loading behavior.
        // We do not need to do anything. Instead, the loading behavior
        // is responsible for rending data.
        if (self._isLoadingData) {
            return;
        }
        // Shortcircuit
        var changeSet = self.globalProviderFilter.apply(self, args);
        if (!changeSet) {
            return;
        }
        // The interface of changeSet is determined by the above filter
        // method. However, the below view provider listener must be careful.
        // Changes
        if (changeSet.add) {
            var candidate = _$2.filter(changeSet.changes.added, function (thisItem) {
                return !_$2.some(self._viewLevelData.models, function (thatItem) {
                    return thisItem.id === thatItem.id;
                });
            });
            if (candidate.length > 0) {
                _$2.each(candidate, function (v, k) {
                    var atIndex = self.findAtIndex(v);
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
        var self = this;
        var $data = self._viewInstance.$data;
        var newData;
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
        var self = this;
        self._viewLevelData.reset();
        return self._super();
    },
    /**
     * Starts to listen to the change on the global provider.
     * It is usually used internally on setting up this mediator.
     * @param {Object} globalProvider
     */
    startListeningGlobalProvider: function (globalProvider) {
        var self = this;
        var onUpdate = function () {
            var args = arguments;
            // We have to schedule such update so that some other operations can
            // been completed first. E.g., getForeignModel should be set up.
            _$2.defer(function () {
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
        var self = this;
        var listeners = self._globalProviderListeners;
        var globalProvider = self._globalProvider;
        for (var key in listeners) {
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
        var self = this;
        var onUpdate = function (evtCtx, changeSet, rest) {
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
        var self = this;
        var listeners = self._viewProviderListeners;
        for (var key in listeners) {
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
        var self = this;
        var models = self._super();
        models = _$2.filter(models, function (elem) {
            return !_$2.some(self._viewLevelData.models, function (item) {
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
        var self = this;
        var $data = self._viewInstance.$data;
        $data.clean();
        $data.hasMoreData(self._dataProvider.hasNextPage());
        var newData = self.generateItemsInternal(self._viewLevelData.models);
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
        var self = this;
        self._super(options);
        if (self._globalProvider) {
            self.startListeningGlobalProvider(self._globalProvider);
        }
    },
    /**
     * Override
     */
    tearDown: function () {
        var self = this;
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
        var self = this;
        self._super(viewInstance);
        // Start to listen to changes on the view data provider.
        self.startListeningViewProvider();
    },
    /**
     * Override
     */
    detachView: function () {
        var self = this;
        self._super();
        self.stopListeningViewProvider();
    }
});

var _$3 = underscore;
function mergeArgs(data) {
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
var RxjsPoweredWritableListMediator = WritableListMediator.extend({
    Properties: 'globalSubr, emitEventDelay',
    init: function (settings) {
        var self = this;
        self._super(settings);
        self._globalSubr = null;
        self._emitEventDelay = 1000;
    },
    /**
         * Starts to listen to the change on the global provider.
         * It is usually used internally on setting up this mediator.
         * @param {Object} globalProvider
         */
    startListeningGlobalProvider: function (globalProvider) {
        var self = this;
        self._globalProvider = globalProvider;
        var eventObserver = fromEvent(globalProvider, 'update');
        var ctrlObserver = eventObserver.pipe(debounceTime(self._emitEventDelay));
        self._globalSubr = eventObserver.pipe(buffer(ctrlObserver), map(function (col) {
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
        var self = this;
        var globalProvider = self._globalProvider;
        if (self._globalSubr) {
            self._globalSubr.unsubscribe();
            self._globalSubr = null;
        }
    }
});

var ClassBuilder$1 = Class;
var ListControllerCtor = ClassBuilder$1.extend({
    Defaults: {
        MediatorCtor: null
    },
    Properties: 'mediator,settings',
    /**
     * Constructor
     * @param {Object} settings
     */
    init: function (settings) {
        var self = this;
        // We expect the following properties
        self._settings = settings;
        self._isFirstTimeRendered = true;
        self._mediator = settings.mediator || null;
        self._mediatorFromCache = !!self._mediator;
    },
    initMediator: function () {
        var self, settings, mediator, MediatorCtor;
        self = this;
        if (self._mediator) {
            return self;
        }
        settings = self._settings;
        MediatorCtor = self.Defaults.MediatorCtor;
        mediator = new MediatorCtor(settings);
        // Setup mediator
        self.setupMediator(mediator);
        self._mediator = mediator;
        return self;
    },
    setupMediator: function (mediator) {
        mediator.setUp();
    },
    start: function () {
        var self, settings, mediator;
        self = this;
        settings = self._settings;
        mediator = self._mediator;
        // Set up destroy
        settings.$render.destroy(function () {
            mediator.stopService();
        });
        settings.$render.ready(function () {
            if (self._isFirstTimeRendered) {
                self._isFirstTimeRendered = false;
                mediator.startService(settings, self._mediatorFromCache);
            }
        });
    }
});

/**
 * Generated bundle index. Do not edit.
 */

export { ListControllerCtor, ListMediator, NgStoreListMediator, RxjsPoweredWritableListMediator, WritableListMediator, noopViewInstance };
//# sourceMappingURL=polpware-fe-mvc.js.map
