/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as ClassBuilder from 'polpware-tinymce-tailor/src/util/Class';
/** @type {?} */
export var ListControllerCtor = ClassBuilder.extend({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL2ZlLW12Yy8iLCJzb3VyY2VzIjpbImxpYi9jb250cm9sbGVycy9saXN0LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sS0FBSyxZQUFZLE1BQU0sd0NBQXdDLENBQUM7O0FBR3ZFLE1BQU0sS0FBTyxrQkFBa0IsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO0lBRWxELFFBQVEsRUFBRTtRQUNOLFlBQVksRUFBRSxJQUFJO0tBQ3JCO0lBRUQsVUFBVSxFQUFFLG1CQUFtQjs7OztJQU0vQixJQUFJLEVBQUUsVUFBUyxRQUFROztZQUNmLElBQUksR0FBRyxJQUFJO1FBQ2YscUNBQXFDO1FBRXJDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztRQUMzQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDL0MsQ0FBQztJQUVELFlBQVksRUFBRTs7WUFDTixJQUFJOztZQUNKLFFBQVE7O1lBQ1IsUUFBUTs7WUFDUixZQUFZO1FBQ2hCLElBQUksR0FBRyxJQUFJLENBQUM7UUFDWixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztRQUMxQyxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEMsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELGFBQWEsRUFBRSxVQUFTLFFBQVE7UUFDNUIsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLEVBQUU7O1lBQ0MsSUFBSTs7WUFDSixRQUFROztZQUNSLFFBQVE7UUFFWixJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFMUIsaUJBQWlCO1FBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ3JCLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ25CLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMzQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO2dCQUNsQyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUM1RDtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBDbGFzc0J1aWxkZXIgZnJvbSAncG9scHdhcmUtdGlueW1jZS10YWlsb3Ivc3JjL3V0aWwvQ2xhc3MnO1xuXG5cbmV4cG9ydCBjb25zdCBMaXN0Q29udHJvbGxlckN0b3IgPSBDbGFzc0J1aWxkZXIuZXh0ZW5kKHtcblxuICAgIERlZmF1bHRzOiB7XG4gICAgICAgIE1lZGlhdG9yQ3RvcjogbnVsbFxuICAgIH0sXG5cbiAgICBQcm9wZXJ0aWVzOiAnbWVkaWF0b3Isc2V0dGluZ3MnLFxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3NcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihzZXR0aW5ncykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIFdlIGV4cGVjdCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXNcblxuICAgICAgICBzZWxmLl9zZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgICAgICBzZWxmLl9pc0ZpcnN0VGltZVJlbmRlcmVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5fbWVkaWF0b3IgPSBzZXR0aW5ncy5tZWRpYXRvciB8fCBudWxsO1xuICAgICAgICBzZWxmLl9tZWRpYXRvckZyb21DYWNoZSA9ICEhc2VsZi5fbWVkaWF0b3I7XG4gICAgfSxcblxuICAgIGluaXRNZWRpYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmLFxuICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgICBtZWRpYXRvcixcbiAgICAgICAgICAgIE1lZGlhdG9yQ3RvcjtcbiAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLl9tZWRpYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgIH1cbiAgICAgICAgc2V0dGluZ3MgPSBzZWxmLl9zZXR0aW5ncztcbiAgICAgICAgTWVkaWF0b3JDdG9yID0gc2VsZi5EZWZhdWx0cy5NZWRpYXRvckN0b3I7XG4gICAgICAgIG1lZGlhdG9yID0gbmV3IE1lZGlhdG9yQ3RvcihzZXR0aW5ncyk7XG4gICAgICAgIC8vIFNldHVwIG1lZGlhdG9yXG4gICAgICAgIHNlbGYuc2V0dXBNZWRpYXRvcihtZWRpYXRvcik7XG5cbiAgICAgICAgc2VsZi5fbWVkaWF0b3IgPSBtZWRpYXRvcjtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIHNldHVwTWVkaWF0b3I6IGZ1bmN0aW9uKG1lZGlhdG9yKSB7XG4gICAgICAgIG1lZGlhdG9yLnNldFVwKCk7XG4gICAgfSxcblxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYsXG4gICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgIG1lZGlhdG9yO1xuXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXR0aW5ncyA9IHNlbGYuX3NldHRpbmdzO1xuICAgICAgICBtZWRpYXRvciA9IHNlbGYuX21lZGlhdG9yO1xuXG4gICAgICAgIC8vIFNldCB1cCBkZXN0cm95XG4gICAgICAgIHNldHRpbmdzLiRyZW5kZXIuZGVzdHJveShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG1lZGlhdG9yLnN0b3BTZXJ2aWNlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldHRpbmdzLiRyZW5kZXIucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5faXNGaXJzdFRpbWVSZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2lzRmlyc3RUaW1lUmVuZGVyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBtZWRpYXRvci5zdGFydFNlcnZpY2Uoc2V0dGluZ3MsIHNlbGYuX21lZGlhdG9yRnJvbUNhY2hlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbiJdfQ==