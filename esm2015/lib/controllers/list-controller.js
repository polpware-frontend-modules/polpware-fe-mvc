/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as dependencies from '@polpware/fe-dependencies';
/** @type {?} */
const ClassBuilder = dependencies.Class;
/** @type {?} */
export const ListControllerCtor = ClassBuilder.extend({
    Defaults: {
        MediatorCtor: null
    },
    Properties: 'mediator,settings',
    /**
     * Constructor
     */
    init: function (settings) {
        /** @type {?} */
        var self = this;
        // We expect the following properties
        self._settings = settings;
        self._isFirstTimeRendered = true;
        self._mediator = settings.mediator || null;
        self._mediatorFromCache = !!self._mediator;
    },
    initMediator: function () {
        /** @type {?} */
        var self;
        /** @type {?} */
        var settings;
        /** @type {?} */
        var mediator;
        /** @type {?} */
        var MediatorCtor;
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
        /** @type {?} */
        var self;
        /** @type {?} */
        var settings;
        /** @type {?} */
        var mediator;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL2ZlLW12Yy8iLCJzb3VyY2VzIjpbImxpYi9jb250cm9sbGVycy9saXN0LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sS0FBSyxZQUFZLE1BQU0sMkJBQTJCLENBQUM7O01BRXBELFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSzs7QUFHdkMsTUFBTSxPQUFPLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFFbEQsUUFBUSxFQUFFO1FBQ04sWUFBWSxFQUFFLElBQUk7S0FDckI7SUFFRCxVQUFVLEVBQUUsbUJBQW1COzs7O0lBTS9CLElBQUksRUFBRSxVQUFTLFFBQVE7O1lBQ2YsSUFBSSxHQUFHLElBQUk7UUFDZixxQ0FBcUM7UUFFckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDO1FBQzNDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsWUFBWSxFQUFFOztZQUNOLElBQUk7O1lBQ0osUUFBUTs7WUFDUixRQUFROztZQUNSLFlBQVk7UUFDaEIsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNaLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDO1FBQzFDLFFBQVEsR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU3QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsYUFBYSxFQUFFLFVBQVMsUUFBUTtRQUM1QixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELEtBQUssRUFBRTs7WUFDQyxJQUFJOztZQUNKLFFBQVE7O1lBQ1IsUUFBUTtRQUVaLElBQUksR0FBRyxJQUFJLENBQUM7UUFDWixRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUUxQixpQkFBaUI7UUFDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDckIsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDbkIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7Z0JBQ2xDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQzVEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRlcGVuZGVuY2llcyBmcm9tICdAcG9scHdhcmUvZmUtZGVwZW5kZW5jaWVzJztcblxuY29uc3QgQ2xhc3NCdWlsZGVyID0gZGVwZW5kZW5jaWVzLkNsYXNzO1xuXG5cbmV4cG9ydCBjb25zdCBMaXN0Q29udHJvbGxlckN0b3IgPSBDbGFzc0J1aWxkZXIuZXh0ZW5kKHtcblxuICAgIERlZmF1bHRzOiB7XG4gICAgICAgIE1lZGlhdG9yQ3RvcjogbnVsbFxuICAgIH0sXG5cbiAgICBQcm9wZXJ0aWVzOiAnbWVkaWF0b3Isc2V0dGluZ3MnLFxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3NcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihzZXR0aW5ncykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIFdlIGV4cGVjdCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXNcblxuICAgICAgICBzZWxmLl9zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgICAgICBzZWxmLl9pc0ZpcnN0VGltZVJlbmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5fbWVkaWF0b3IgPSBzZXR0aW5ncy5tZWRpYXRvciB8fCBudWxsO1xuICAgICAgICBzZWxmLl9tZWRpYXRvckZyb21DYWNoZSA9ICEhc2VsZi5fbWVkaWF0b3I7XG4gICAgfSxcblxuICAgIGluaXRNZWRpYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmLFxuICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgICBtZWRpYXRvcixcbiAgICAgICAgICAgIE1lZGlhdG9yQ3RvcjtcbiAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLl9tZWRpYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgIH1cbiAgICAgICAgc2V0dGluZ3MgPSBzZWxmLl9zZXR0aW5ncztcbiAgICAgICAgTWVkaWF0b3JDdG9yID0gc2VsZi5EZWZhdWx0cy5NZWRpYXRvckN0b3I7XG4gICAgICAgIG1lZGlhdG9yID0gbmV3IE1lZGlhdG9yQ3RvcihzZXR0aW5ncyk7XG4gICAgICAgIC8vIFNldHVwIG1lZGlhdG9yXG4gICAgICAgIHNlbGYuc2V0dXBNZWRpYXRvcihtZWRpYXRvcik7XG5cbiAgICAgICAgc2VsZi5fbWVkaWF0b3IgPSBtZWRpYXRvcjtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIHNldHVwTWVkaWF0b3I6IGZ1bmN0aW9uKG1lZGlhdG9yKSB7XG4gICAgICAgIG1lZGlhdG9yLnNldFVwKCk7XG4gICAgfSxcblxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYsXG4gICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgIG1lZGlhdG9yO1xuXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXR0aW5ncyA9IHNlbGYuX3NldHRpbmdzO1xuICAgICAgICBtZWRpYXRvciA9IHNlbGYuX21lZGlhdG9yO1xuXG4gICAgICAgIC8vIFNldCB1cCBkZXN0cm95XG4gICAgICAgIHNldHRpbmdzLiRyZW5kZXIuZGVzdHJveShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG1lZGlhdG9yLnN0b3BTZXJ2aWNlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldHRpbmdzLiRyZW5kZXIucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5faXNGaXJzdFRpbWVSZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2lzRmlyc3RUaW1lUmVuZGVyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtZWRpYXRvci5zdGFydFNlcnZpY2Uoc2V0dGluZ3MsIHNlbGYuX21lZGlhdG9yRnJvbUNhY2hlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbiJdfQ==