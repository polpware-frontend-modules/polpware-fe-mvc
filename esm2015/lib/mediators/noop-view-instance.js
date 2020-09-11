import * as dependencies from '@polpware/fe-dependencies';
const _ = dependencies.underscore;
const noop = _.noop;
export const noopViewInstance = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC12aWV3LWluc3RhbmNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL2ZlLW12Yy8iLCJzb3VyY2VzIjpbImxpYi9tZWRpYXRvcnMvbm9vcC12aWV3LWluc3RhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxZQUFZLE1BQU0sMkJBQTJCLENBQUM7QUFJMUQsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBRXBCLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFrQjtJQUMzQyxLQUFLLEVBQUU7UUFDSCxJQUFJLEVBQUUsSUFBSTtRQUNWLGtCQUFrQixFQUFFLElBQUk7UUFDeEIsbUJBQW1CLEVBQUUsSUFBSTtRQUN6QixLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxJQUFJO1FBQ2YsUUFBUSxFQUFFLElBQUk7UUFDZCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxJQUFJO1FBQ2IsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLElBQUk7UUFDakIsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLElBQUk7UUFDakIsV0FBVyxFQUFFLElBQUk7UUFDakIsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsSUFBSTtRQUNqQixvQkFBb0IsRUFBRSxJQUFJO1FBQzFCLFdBQVcsRUFBRSxJQUFJO0tBQ3BCO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNiO0lBQ0QsVUFBVSxFQUFFO1FBQ1IsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNiO0lBQ0QsV0FBVyxFQUFFO1FBQ1QsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtLQUNiO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsRUFBRSxFQUFFLElBQUk7S0FDWDtJQUNELE9BQU8sRUFBRTtRQUNMLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsSUFBSTtLQUNwQjtJQUNELE9BQU8sRUFBRTtRQUNMOzs7V0FHRztRQUNILFFBQVEsRUFBRSxJQUFJO1FBQ2Q7OztXQUdHO1FBQ0gsUUFBUSxFQUFFLElBQUk7S0FDakI7SUFDRCxNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLElBQUk7S0FDZDtJQUNELFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBRSxJQUFJO1FBQ2IsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsSUFBSTtRQUNYLFFBQVEsRUFBRSxJQUFJO0tBQ2pCO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixNQUFNLEVBQUUsSUFBSTtRQUNaLEtBQUssRUFBRSxJQUFJO0tBQ2Q7SUFDRCxZQUFZLEVBQUU7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLEtBQUssRUFBRSxJQUFJO1FBQ1gsY0FBYyxFQUFFLElBQUk7UUFDcEIsVUFBVSxFQUFFLElBQUk7UUFDaEIsT0FBTyxFQUFFLElBQUk7UUFDYixlQUFlLEVBQUUsSUFBSTtRQUNyQixTQUFTLEVBQUUsSUFBSTtLQUNsQjtJQUNELFNBQVMsRUFBRSxJQUFJO0lBQ2YsUUFBUSxFQUFFO1FBQ04sTUFBTSxFQUFFLElBQUk7S0FDZjtDQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBkZXBlbmRlbmNpZXMgZnJvbSAnQHBvbHB3YXJlL2ZlLWRlcGVuZGVuY2llcyc7XHJcblxyXG5pbXBvcnQgeyBJVmlld0luc3RhbmNlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcclxuXHJcbmNvbnN0IF8gPSBkZXBlbmRlbmNpZXMudW5kZXJzY29yZTtcclxuY29uc3Qgbm9vcCA9IF8ubm9vcDtcclxuXHJcbmV4cG9ydCBjb25zdCBub29wVmlld0luc3RhbmNlOiBJVmlld0luc3RhbmNlID0ge1xyXG4gICAgJGRhdGE6IHtcclxuICAgICAgICBpbml0OiBub29wLFxyXG4gICAgICAgIHNldFJlZnJlc2hDYWxsYmFjazogbm9vcCxcclxuICAgICAgICBzZXRJbmZpbml0ZUNhbGxiYWNrOiBub29wLFxyXG4gICAgICAgIGNsZWFuOiBub29wLFxyXG4gICAgICAgIGFzeW5jUHVzaDogbm9vcCxcclxuICAgICAgICBzeW5jUHVzaDogbm9vcCxcclxuICAgICAgICBhc3luY1BvcDogbm9vcCxcclxuICAgICAgICBzeW5jUG9wOiBub29wLFxyXG4gICAgICAgIGFzeW5jUHJlcGVuZDogbm9vcCxcclxuICAgICAgICBzeW5jUHJlcGVuZDogbm9vcCxcclxuICAgICAgICBhc3luY1JlZnJlc2g6IG5vb3AsXHJcbiAgICAgICAgc3luY1JlZnJlc2g6IG5vb3AsXHJcbiAgICAgICAgaGFzTW9yZURhdGE6IG5vb3AsXHJcbiAgICAgICAgZ2V0SXRlbXM6IG5vb3AsXHJcbiAgICAgICAgc2V0dXBTZWFyY2g6IG5vb3AsXHJcbiAgICAgICAgdXBkYXRlU2VhcmNoQ3JpdGVyaWE6IG5vb3AsXHJcbiAgICAgICAgZ2V0QW5jZXN0b3I6IG5vb3BcclxuICAgIH0sXHJcbiAgICAkbG9hZGVyOiB7XHJcbiAgICAgICAgc2hvdzogbm9vcCxcclxuICAgICAgICBoaWRlOiBub29wXHJcbiAgICB9LFxyXG4gICAgJHJlZnJlc2hlcjoge1xyXG4gICAgICAgIHNob3c6IG5vb3AsXHJcbiAgICAgICAgaGlkZTogbm9vcFxyXG4gICAgfSxcclxuICAgICRtb3JlTG9hZGVyOiB7XHJcbiAgICAgICAgc2hvdzogbm9vcCxcclxuICAgICAgICBoaWRlOiBub29wXHJcbiAgICB9LFxyXG4gICAgJHJvdXRlcjoge1xyXG4gICAgICAgIGdvOiBub29wXHJcbiAgICB9LFxyXG4gICAgJHJlbmRlcjoge1xyXG4gICAgICAgIHJlYWR5OiBub29wLFxyXG4gICAgICAgIGRlc3Ryb3k6IG5vb3AsXHJcbiAgICAgICAgYXN5bmNEaWdlc3Q6IG5vb3BcclxuICAgIH0sXHJcbiAgICAkbmF2QmFyOiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IGN1cnJlbnQgc3RhdGVcclxuICAgICAgICAgKiBAcmV0dXJucyB7fVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGdldFN0YXRlOiBub29wLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBzdGF0ZVxyXG4gICAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNldFN0YXRlOiBub29wXHJcbiAgICB9LFxyXG4gICAgJG1vZGFsOiB7XHJcbiAgICAgICAgc2V0RGF0YTogbm9vcCxcclxuICAgICAgICBnZXREYXRhOiBub29wLFxyXG4gICAgICAgIGJ1aWxkOiBub29wXHJcbiAgICB9LFxyXG4gICAgJHBvcG92ZXI6IHtcclxuICAgICAgICBzZXREYXRhOiBub29wLFxyXG4gICAgICAgIGdldERhdGE6IG5vb3AsXHJcbiAgICAgICAgYnVpbGQ6IG5vb3AsXHJcbiAgICAgICAgb25IaWRkZW46IG5vb3BcclxuICAgIH0sXHJcbiAgICAkcG9wdXA6IHtcclxuICAgICAgICBzZXREYXRhOiBub29wLFxyXG4gICAgICAgIGdldERhdGE6IG5vb3AsXHJcbiAgICAgICAgYnVpbGQ6IG5vb3AsXHJcbiAgICAgICAgY29uZmlybTogbm9vcCxcclxuICAgICAgICBwcm9tcHQ6IG5vb3AsXHJcbiAgICAgICAgYWxlcnQ6IG5vb3BcclxuICAgIH0sXHJcbiAgICAkcHJvZ3Jlc3NCYXI6IHtcclxuICAgICAgICBjcmVhdGU6IG5vb3AsXHJcbiAgICAgICAgcmVzZXQ6IG5vb3AsXHJcbiAgICAgICAgY3JlYXRlSW5maW5pdGU6IG5vb3AsXHJcbiAgICAgICAgb25Qcm9ncmVzczogbm9vcCxcclxuICAgICAgICBkZXN0cm95OiBub29wLFxyXG4gICAgICAgIGRlc3Ryb3lJbmZpbml0ZTogbm9vcCxcclxuICAgICAgICBzaG93QWJvcnQ6IG5vb3BcclxuICAgIH0sXHJcbiAgICAkYWxlcnRpZnk6IG5vb3AsXHJcbiAgICAkaGlzdG9yeToge1xyXG4gICAgICAgIGdvQmFjazogbm9vcFxyXG4gICAgfVxyXG59O1xyXG4iXX0=