/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as dependencies from '@polpware/fe-dependencies';
/** @type {?} */
var _ = dependencies.underscore;
/** @type {?} */
var noop = _.noop;
/** @type {?} */
export var noopViewInstance = {
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
         */
        getState: noop,
        /**
         * Set state
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC12aWV3LWluc3RhbmNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL2ZlLW12Yy8iLCJzb3VyY2VzIjpbImxpYi9tZWRpYXRvcnMvbm9vcC12aWV3LWluc3RhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEtBQUssWUFBWSxNQUFNLDJCQUEyQixDQUFDOztJQUlwRCxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVU7O0lBQzNCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSTs7QUFFbkIsTUFBTSxLQUFPLGdCQUFnQixHQUFrQjtJQUMzQyxLQUFLLEVBQUU7UUFDSCxJQUFJLEVBQUUsSUFBSTtRQUNWLGtCQUFrQixFQUFFLElBQUk7UUFDeEIsbUJBQW1CLEVBQUUsSUFBSTtRQUN6QixLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxJQUFJO1FBQ2YsUUFBUSxFQUFFLElBQUk7UUFDZCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxJQUFJO1FBQ2IsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLElBQUk7UUFDakIsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLElBQUk7UUFDakIsV0FBVyxFQUFFLElBQUk7UUFDakIsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsSUFBSTtRQUNqQixvQkFBb0IsRUFBRSxJQUFJO1FBQzFCLFdBQVcsRUFBRSxJQUFJO0tBQ3BCO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNiO0lBQ0QsVUFBVSxFQUFFO1FBQ1IsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNiO0lBQ0QsV0FBVyxFQUFFO1FBQ1QsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNiO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsRUFBRSxFQUFFLElBQUk7S0FDWDtJQUNELE9BQU8sRUFBRTtRQUNMLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNwQjtJQUNELE9BQU8sRUFBRTs7OztRQUtMLFFBQVEsRUFBRSxJQUFJOzs7O1FBS2QsUUFBUSxFQUFFLElBQUk7S0FDakI7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLElBQUk7S0FDZDtJQUNELFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBRSxJQUFJO1FBQ2IsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsSUFBSTtRQUNYLFFBQVEsRUFBRSxJQUFJO0tBQ2pCO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixNQUFNLEVBQUUsSUFBSTtRQUNaLEtBQUssRUFBRSxJQUFJO0tBQ2Q7SUFDRCxZQUFZLEVBQUU7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLEtBQUssRUFBRSxJQUFJO1FBQ1gsY0FBYyxFQUFFLElBQUk7UUFDcEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLElBQUk7UUFDYixlQUFlLEVBQUUsSUFBSTtRQUNyQixTQUFTLEVBQUUsSUFBSTtLQUNsQjtJQUNELFNBQVMsRUFBRSxJQUFJO0lBQ2YsUUFBUSxFQUFFO1FBQ04sTUFBTSxFQUFFLElBQUk7S0FDZjtDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZGVwZW5kZW5jaWVzIGZyb20gJ0Bwb2xwd2FyZS9mZS1kZXBlbmRlbmNpZXMnO1xyXG5cclxuaW1wb3J0IHsgSVZpZXdJbnN0YW5jZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XHJcblxyXG5jb25zdCBfID0gZGVwZW5kZW5jaWVzLnVuZGVyc2NvcmU7XHJcbmNvbnN0IG5vb3AgPSBfLm5vb3A7XHJcblxyXG5leHBvcnQgY29uc3Qgbm9vcFZpZXdJbnN0YW5jZTogSVZpZXdJbnN0YW5jZSA9IHtcclxuICAgICRkYXRhOiB7XHJcbiAgICAgICAgaW5pdDogbm9vcCxcclxuICAgICAgICBzZXRSZWZyZXNoQ2FsbGJhY2s6IG5vb3AsXHJcbiAgICAgICAgc2V0SW5maW5pdGVDYWxsYmFjazogbm9vcCxcclxuICAgICAgICBjbGVhbjogbm9vcCxcclxuICAgICAgICBhc3luY1B1c2g6IG5vb3AsXHJcbiAgICAgICAgc3luY1B1c2g6IG5vb3AsXHJcbiAgICAgICAgYXN5bmNQb3A6IG5vb3AsXHJcbiAgICAgICAgc3luY1BvcDogbm9vcCxcclxuICAgICAgICBhc3luY1ByZXBlbmQ6IG5vb3AsXHJcbiAgICAgICAgc3luY1ByZXBlbmQ6IG5vb3AsXHJcbiAgICAgICAgYXN5bmNSZWZyZXNoOiBub29wLFxyXG4gICAgICAgIHN5bmNSZWZyZXNoOiBub29wLFxyXG4gICAgICAgIGhhc01vcmVEYXRhOiBub29wLFxyXG4gICAgICAgIGdldEl0ZW1zOiBub29wLFxyXG4gICAgICAgIHNldHVwU2VhcmNoOiBub29wLFxyXG4gICAgICAgIHVwZGF0ZVNlYXJjaENyaXRlcmlhOiBub29wLFxyXG4gICAgICAgIGdldEFuY2VzdG9yOiBub29wXHJcbiAgICB9LFxyXG4gICAgJGxvYWRlcjoge1xyXG4gICAgICAgIHNob3c6IG5vb3AsXHJcbiAgICAgICAgaGlkZTogbm9vcFxyXG4gICAgfSxcclxuICAgICRyZWZyZXNoZXI6IHtcclxuICAgICAgICBzaG93OiBub29wLFxyXG4gICAgICAgIGhpZGU6IG5vb3BcclxuICAgIH0sXHJcbiAgICAkbW9yZUxvYWRlcjoge1xyXG4gICAgICAgIHNob3c6IG5vb3AsXHJcbiAgICAgICAgaGlkZTogbm9vcFxyXG4gICAgfSxcclxuICAgICRyb3V0ZXI6IHtcclxuICAgICAgICBnbzogbm9vcFxyXG4gICAgfSxcclxuICAgICRyZW5kZXI6IHtcclxuICAgICAgICByZWFkeTogbm9vcCxcclxuICAgICAgICBkZXN0cm95OiBub29wLFxyXG4gICAgICAgIGFzeW5jRGlnZXN0OiBub29wXHJcbiAgICB9LFxyXG4gICAgJG5hdkJhcjoge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdldCBjdXJyZW50IHN0YXRlXHJcbiAgICAgICAgICogQHJldHVybnMge31cclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXRTdGF0ZTogbm9vcCxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgc3RhdGVcclxuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBzZXRTdGF0ZTogbm9vcFxyXG4gICAgfSxcclxuICAgICRtb2RhbDoge1xyXG4gICAgICAgIHNldERhdGE6IG5vb3AsXHJcbiAgICAgICAgZ2V0RGF0YTogbm9vcCxcclxuICAgICAgICBidWlsZDogbm9vcFxyXG4gICAgfSxcclxuICAgICRwb3BvdmVyOiB7XHJcbiAgICAgICAgc2V0RGF0YTogbm9vcCxcclxuICAgICAgICBnZXREYXRhOiBub29wLFxyXG4gICAgICAgIGJ1aWxkOiBub29wLFxyXG4gICAgICAgIG9uSGlkZGVuOiBub29wXHJcbiAgICB9LFxyXG4gICAgJHBvcHVwOiB7XHJcbiAgICAgICAgc2V0RGF0YTogbm9vcCxcclxuICAgICAgICBnZXREYXRhOiBub29wLFxyXG4gICAgICAgIGJ1aWxkOiBub29wLFxyXG4gICAgICAgIGNvbmZpcm06IG5vb3AsXHJcbiAgICAgICAgcHJvbXB0OiBub29wLFxyXG4gICAgICAgIGFsZXJ0OiBub29wXHJcbiAgICB9LFxyXG4gICAgJHByb2dyZXNzQmFyOiB7XHJcbiAgICAgICAgY3JlYXRlOiBub29wLFxyXG4gICAgICAgIHJlc2V0OiBub29wLFxyXG4gICAgICAgIGNyZWF0ZUluZmluaXRlOiBub29wLFxyXG4gICAgICAgIG9uUHJvZ3Jlc3M6IG5vb3AsXHJcbiAgICAgICAgZGVzdHJveTogbm9vcCxcclxuICAgICAgICBkZXN0cm95SW5maW5pdGU6IG5vb3AsXHJcbiAgICAgICAgc2hvd0Fib3J0OiBub29wXHJcbiAgICB9LFxyXG4gICAgJGFsZXJ0aWZ5OiBub29wLFxyXG4gICAgJGhpc3Rvcnk6IHtcclxuICAgICAgICBnb0JhY2s6IG5vb3BcclxuICAgIH1cclxufTtcclxuIl19