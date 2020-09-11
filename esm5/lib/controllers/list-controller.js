import * as dependencies from '@polpware/fe-dependencies';
var ClassBuilder = dependencies.Class;
export var ListControllerCtor = ClassBuilder.extend({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL2ZlLW12Yy8iLCJzb3VyY2VzIjpbImxpYi9jb250cm9sbGVycy9saXN0LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLFlBQVksTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxJQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0FBR3hDLE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFFbEQsUUFBUSxFQUFFO1FBQ04sWUFBWSxFQUFFLElBQUk7S0FDckI7SUFFRCxVQUFVLEVBQUUsbUJBQW1CO0lBRS9COzs7T0FHRztJQUNILElBQUksRUFBRSxVQUFTLFFBQVE7UUFDbkIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLHFDQUFxQztRQUVyQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQy9DLENBQUM7SUFFRCxZQUFZLEVBQUU7UUFDVixJQUFJLElBQUksRUFDSixRQUFRLEVBQ1IsUUFBUSxFQUNSLFlBQVksQ0FBQztRQUNqQixJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDMUMsUUFBUSxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTdCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxhQUFhLEVBQUUsVUFBUyxRQUFRO1FBQzVCLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQsS0FBSyxFQUFFO1FBQ0gsSUFBSSxJQUFJLEVBQ0osUUFBUSxFQUNSLFFBQVEsQ0FBQztRQUViLElBQUksR0FBRyxJQUFJLENBQUM7UUFDWixRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUUxQixpQkFBaUI7UUFDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDckIsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDbkIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7Z0JBQ2xDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQzVEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZGVwZW5kZW5jaWVzIGZyb20gJ0Bwb2xwd2FyZS9mZS1kZXBlbmRlbmNpZXMnO1xuXG5jb25zdCBDbGFzc0J1aWxkZXIgPSBkZXBlbmRlbmNpZXMuQ2xhc3M7XG5cblxuZXhwb3J0IGNvbnN0IExpc3RDb250cm9sbGVyQ3RvciA9IENsYXNzQnVpbGRlci5leHRlbmQoe1xuXG4gICAgRGVmYXVsdHM6IHtcbiAgICAgICAgTWVkaWF0b3JDdG9yOiBudWxsXG4gICAgfSxcblxuICAgIFByb3BlcnRpZXM6ICdtZWRpYXRvcixzZXR0aW5ncycsXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzZXR0aW5nc1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gV2UgZXhwZWN0IHRoZSBmb2xsb3dpbmcgcHJvcGVydGllc1xuXG4gICAgICAgIHNlbGYuX3NldHRpbmdzID0gc2V0dGluZ3M7XG4gICAgICAgIHNlbGYuX2lzRmlyc3RUaW1lUmVuZGVyZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLl9tZWRpYXRvciA9IHNldHRpbmdzLm1lZGlhdG9yIHx8IG51bGw7XG4gICAgICAgIHNlbGYuX21lZGlhdG9yRnJvbUNhY2hlID0gISFzZWxmLl9tZWRpYXRvcjtcbiAgICB9LFxuXG4gICAgaW5pdE1lZGlhdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYsXG4gICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgIG1lZGlhdG9yLFxuICAgICAgICAgICAgTWVkaWF0b3JDdG9yO1xuICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYuX21lZGlhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuICAgICAgICBzZXR0aW5ncyA9IHNlbGYuX3NldHRpbmdzO1xuICAgICAgICBNZWRpYXRvckN0b3IgPSBzZWxmLkRlZmF1bHRzLk1lZGlhdG9yQ3RvcjtcbiAgICAgICAgbWVkaWF0b3IgPSBuZXcgTWVkaWF0b3JDdG9yKHNldHRpbmdzKTtcbiAgICAgICAgLy8gU2V0dXAgbWVkaWF0b3JcbiAgICAgICAgc2VsZi5zZXR1cE1lZGlhdG9yKG1lZGlhdG9yKTtcblxuICAgICAgICBzZWxmLl9tZWRpYXRvciA9IG1lZGlhdG9yO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgc2V0dXBNZWRpYXRvcjogZnVuY3Rpb24obWVkaWF0b3IpIHtcbiAgICAgICAgbWVkaWF0b3Iuc2V0VXAoKTtcbiAgICB9LFxuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZixcbiAgICAgICAgICAgIHNldHRpbmdzLFxuICAgICAgICAgICAgbWVkaWF0b3I7XG5cbiAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNldHRpbmdzID0gc2VsZi5fc2V0dGluZ3M7XG4gICAgICAgIG1lZGlhdG9yID0gc2VsZi5fbWVkaWF0b3I7XG5cbiAgICAgICAgLy8gU2V0IHVwIGRlc3Ryb3lcbiAgICAgICAgc2V0dGluZ3MuJHJlbmRlci5kZXN0cm95KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbWVkaWF0b3Iuc3RvcFNlcnZpY2UoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0dGluZ3MuJHJlbmRlci5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pc0ZpcnN0VGltZVJlbmRlcmVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5faXNGaXJzdFRpbWVSZW5kZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG1lZGlhdG9yLnN0YXJ0U2VydmljZShzZXR0aW5ncywgc2VsZi5fbWVkaWF0b3JGcm9tQ2FjaGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuIl19