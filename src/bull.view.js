(function (Bull, Backbone, _) {

    /**
     * @typedef {Object} Bull.ViewOptions
     *
     * @property {string} [el] - A DOM element selector.
     * @property {string[]} [optionsToPass] - Options to be automatically passed to child views of the created view.
     * @property {(Function|Object)} [data] - Data that will be passed to a template.
     * @property {string} [template] - A template name.
     * @property {string} [templateContent] - Template content.
     * @property {boolean} [notToRender] - Not to render on ready.
     * @property {Object} [views] - Child view definitions.
     * @property {string} [name] - A view name.
     * @property {Backbone.Model} [model] - A model.
     * @property {Backbone.Collection} [collection] - A collection.
     * @property {Bull.View.DomEvents} [events] - DOM events.
     */

    /**
     * After a view is rendered.
     *
     * @event Bull.View#after:render
     */

    /**
     * Once a view is ready for rendering (loaded).
     *
     * @event Bull.View#ready
     */

    /**
     * Once a view is removed.
     *
     * @event Bull.View#remove
     */

    /**
     * @callback Bull.View.getHtmlCallback
     *
     * @param {string} html An HTML.
     */

    /**
     * @callback Backbone.View.domEventCallback
     * @param {jQuery.Event} e An event.
     */

    /**
     * @callback Backbone.Events.callback
     * @param {...*} arguments
     */

    /**
     * @mixin Backbone.Events
     */

    /**
     * Trigger an event.
     *
     * @function trigger
     * @memberof Backbone.Events
     * @param {string} event An event.
     * @param {...*} arguments
     */

    /**
     * Subscribe to an event.
     *
     * @function on
     * @memberof Backbone.Events
     * @param {string} event An event.
     * @param {Backbone.Events.callback} callback A callback.
     */

    /**
     * Subscribe to an event. Fired once.
     *
     * @function once
     * @memberof Backbone.Events
     * @param {string} event An event.
     * @param {Backbone.Events.callback} callback A callback.
     */

    /**
     * Unsubscribe from an event or all events.
     *
     * @function off
     * @memberof Backbone.Events
     * @param {string} [event] From a specific event.
     * @param {Backbone.Events.callback} [callback] From a specific callback.
     */

    /**
     * Subscribe to an event of other object. Will be automatically unsubscribed on view removal.
     *
     * @function listenTo
     * @memberof Backbone.Events
     * @param {Object} other What to listen.
     * @param {string} event An event.
     * @param {Backbone.Events.callback} callback A callback.
     */

    /**
     * Subscribe to an event of other object. Fired once. Will be automatically unsubscribed on view removal.
     *
     * @function listenToOnce
     * @memberof Backbone.Events
     * @param {Object} other What to listen.
     * @param {string} event An event.
     * @param {Backbone.Events.callback} callback A callback.
     */

    /**
     * Stop listening to other object. No arguments will remove all listeners.
     *
     * @function stopListening
     * @memberof Backbone.Events
     * @param {Object} [other] To remove listeners to a specific object.
     * @param {string} [event] To remove listeners to a specific event.
     * @param {Backbone.Events.callback} [callback] To remove listeners to a specific callback.
     */

    /**
     * Set a DOM element selector.
     *
     * @function setElement
     * @memberof Bull.View
     * @param {string} selector A selector.
     */

    /**
     * Removes all of the view's delegated events. Useful if you want to disable
     * or remove a view from the DOM temporarily.
     *
     * @function undelegateEvents
     * @memberof Bull.View
     */

    /**
     * DOM event listeners.
     *
     * @typedef {Object.<string, Bull.View.domEventCallback>} Backbone.View.DomEvents
     */

    /**
     * A view.
     *
     * @class Bull.View
     * @extends Backbone.View
     *
     * @mixes Backbone.Events
     */
    Bull.View = Backbone.View.extend(/** @lends Bull.View.prototype */{

        /**
         * A model.
         *
         * @name model
         * @type {?Backbone.Model}
         * @public
         * @memberof Bull.View.prototype
         */

        /**
         * A collection.
         *
         * @name collection
         * @type {?Backbone.Collection}
         * @public
         * @memberof Bull.View.prototype
         */

        /**
         * An ID, unique among all views.
         *
         * @name cid
         * @type {string}
         * @public
         * @memberof Bull.View.prototype
         */

        /**
         * Passed options.
         *
         * @name options
         * @type {Object}
         * @public
         * @memberof Bull.View.prototype
         */

        /**
         * A template name/path.
         *
         * @property {?string}
         * @protected
         */
        template: null,

        /**
         * Template content. Alternative to specifying a template name/path.
         *
         * @type {?string}
         * @protected
         */
        templateContent: null,

        /**
         * A layout name/path. Used if template is not specified to build template.
         *
         * @type {?string}
         * @private
         */
        layout: null,

        /**
         * A name of the view. If template name is not defined it will be used to cache
         * built template and layout. Otherwise, they won't be cached. A name is unique.
         *
         * @type {?string}
         */
        name: null,

        /**
         * DOM event listeners.
         *
         * @type {Bull.View.DomEvents}
         * @protected
         */
        events: null,

        /**
         * Data that will be passed to a template.
         *
         * @type {(Function|Object|null)} data
         * @protected
         */
        data: null,

        /**
         * Not to use cache for layouts. Use it if layouts are dynamic.
         *
         * @type {boolean}
         * @protected
         */
        noCache: false,

        /**
         * Not to rended view automatical when a view tree is built (ready).
         * Afterwards it can be rendered manually.
         *
         * @type {boolean}
         * @protected
         */
        notToRender: false,

        /**
         * @type {?string}
         * @private
         */
        _template: null,

        /**
         * Layout itself.
         *
         * @type {?Object}
         * @protected
         * @internal
         */
        _layout: null,

        /**
         * Layout data.
         *
         * @type {?Object}
         * @protected
         */
        layoutData: null,

        /**
         * Whether the view is ready for rendering (all necessary data is loaded).
         *
         * @type {boolean}
         * @public
         */
        isReady: false,

        /**
         * Definitions for nested views that should be automaticaly created.
         * Example: ```
         * {
         *   body: {
         *     view: 'view/path/body',
         *     selector: '> .body',
         *   }
         * }
         * ```
         *
         * @type {?Object}
         * @protected
         */
        views: null,

        /**
         * A list of options to be automatically passed to child views.
         *
         * @type {?string[]}
         * @protected
         */
        optionsToPass: null,

        /**
         * Nested views.
         *
         * @type {Object.<string, Bull.View>}
         * @protected
         * @internal
         */
        nestedViews: null,

        /**
         * @type {Object}
         * @private
         */
        _nestedViewDefs: null,

        /**
         * @private
         */
        _factory: null,

        /**
         * @private
         * @deprecated
         * @todo Remove.
         */
        factory: null,

        /**
         * @private
         */
        _templator: null,

        /**
         * @private
         */
        _renderer: null,

        /**
         * @private
         */
        _layouter: null,

        /**
         * @private
         */
        _helper: null,

        /**
         * @private
         */
        _templateCompiled: null,

        /**
         * @private
         */
        _parentView: null,

        /**
         * @private
         */
        _path: '',

        /**
         * @private
         */
        _wait: false,

        /**
         * @private
         */
        _waitViewList: null,

        /**
         * @private
         */
        _nestedViewsFromLayoutLoaded: false,

        /**
         * @private
         */
        _readyConditionList: null,

        /**
         * @private
         */
        _isRendered: false,

        /**
         * @private
         */
        _isFullyRendered: false,

        /**
         * @private
         */
        _isBeingRendered: false,

        /**
         * @private
         */
        _isRemoved: false,

        /**
         * @private
         */
        _isRenderCanceled: false,

        /**
         * Invoked by the constructor. Should not be overriden.
         *
         * @param {Object} options
         * @private
         * @internal
         */
        initialize: function (options) {
            this.options = options || {};
        },

        /**
         * To be run by the view-factory after instantiating. Should not be overriden.
         * Not called from the constructor to be able to use ES6 classes with property initializers,
         * as overridden properties not available in a constructor.
         *
         * @internal
         */
        _initialize: function () {
            /** @private */
            this._factory = this.factory = this.options._factory || null;
            /** @private */
            this._renderer = this.options._renderer || null;
            /** @private */
            this._templator = this.options._templator || null;
            /** @private */
            this._layouter = this.options._layouter || null;
            /** @private */
            this._helper = this.options._helper || null;

            if ('noCache' in this.options) {
                this.noCache = this.options.noCache;
            }

            this.events = _.clone(this.events || {});
            this.name = this.options.name || this.name;
            this.notToRender = ('notToRender' in this.options) ? this.options.notToRender : this.notToRender;
            this.data = this.options.data || this.data;

            this.nestedViews = {};
            /** @private */
            this._nestedViewDefs = {};

            if (this._waitViewList == null) {
                /** @private */
                this._waitViewList = [];
            }

            /** @private */
            this._waitPromiseCount = 0;

            if (this._readyConditionList == null) {
                /** @private */
                this._readyConditionList = [];
            }

            this.optionsToPass = this.options.optionsToPass || this.optionsToPass || [];

            var merge = function (target, source) {
                for (var prop in source) {
                    if (typeof target === 'object') {
                        if (prop in target) {
                            merge(target[prop], source[prop]);
                        } else {
                            target[prop] = source[prop];
                        }
                    }
                }

                return target;
            };

            if (this.views || this.options.views) {
                this.views = merge(this.options.views || {}, this.views || {});
            }

            this.init();
            this.setup();
            this.setupFinal();

            this.template = this.options.template || this.template;
            this.layout = this.options.layout || this.layout;

            /** @private */
            this._layout = this.options._layout || this._layout;
            this.layoutData = this.options.layoutData || this.layoutData;
            /** @private */
            this._template = this.templateContent || this.options.templateContent || this._template;

            if (this._template != null && this._templator.compilable) {
                /** @private */
                this._templateCompiled = this._templator.compileTemplate(this._template);
            }

            if (this.options.el) {
                this.setElementInAdvance(this.options.el);
            }

            var _layout = this._getLayout();

            var loadNestedViews = () => {
                this._loadNestedViews(() => {
                    this._nestedViewsFromLayoutLoaded = true;

                    this._tryReady();
                });
            };

            if (this.layout != null || _layout !== null) {
                if (_layout === null) {
                    this._layouter.getLayout(this.layout, (_layout) => {
                        /** @private */
                        this._layout = _layout;

                        loadNestedViews();
                    });

                    return;
                }

                loadNestedViews();

                return;
            }
            else {
                if (this.views != null) {
                    loadNestedViews();

                    return;
                }
            }

            this._nestedViewsFromLayoutLoaded = true;

            this._tryReady();
        },

        /**
         * Initialize the view. Is run before #setup.
         *
         * @protected
         */
        init: function () {},

        /**
         * Setup the view. Is run after #init.
         *
         * @protected
         */
        setup: function () {},

        /**
         * Additional setup. Empty method by default. Is run after #setup.
         * Useful to let developers override the setup method, w/o needing to call
         * the parent method in right order.
         *
         * @protected
         */
        setupFinal: function () {},

        /**
         * Set a view container element if doesn't exist yet. It will call setElement after render.
         *
         * @param {string} el A selector.
         * @protected
         */
        setElementInAdvance: function (el) {
            if (this._setElementInAdvancedInProcess) {
                return;
            }

            this._setElementInAdvancedInProcess = true;

            this.on('after:render-internal', () => {
                this.setElement(el);

                this._setElementInAdvancedInProcess = false;
            });
        },

        /**
         * Get an element selector.
         *
         * @public
         * @return {?string}
         */
        getSelector: function () {
            return this.options.el || null;
        },

        /**
         * Set an element selector.
         *
         * @public
         * @param {string} selector A selector.
         */
        setSelector: function (selector) {
            this.options.el = selector;
        },

        /**
         * Checks whether the view has been already rendered
         *
         * @public.
         * @return {boolean}
         */
        isRendered: function () {
            return this._isRendered;
        },

        /**
         * Checks whether the view has been fully rendered (afterRender has been executed).
         *
         * @public
         * @return {boolean}
         */
        isFullyRendered: function () {
            return this._isFullyRendered;
        },

        /**
         * Whether the view is being rendered in the moment.
         *
         * @public
         * @return {boolean}
         */
        isBeingRendered: function () {
            return this._isBeingRendered;
        },

        /**
         * Whether the view is removed.
         *
         * @public
         * @return {boolean}
         */
        isRemoved: function () {
            return this._isRemoved;
        },

        /**
         * Get HTML of view but don't render it.
         *
         * @public
         * @param {Bull.View.getHtmlCallback} callback A callback with an HTML.
         */
        getHtml: function (callback) {
            this._getHtml(callback);
        },

        /**
         * Cancel rendering.
         */
        cancelRender: function () {
            if (!this.isBeingRendered()) {
                return;
            }

            this._isRenderCanceled = true;
        },

        /**
         * Un-cancel rendering.
         */
        uncancelRender: function () {
            this._isRenderCanceled = false;
        },

        /**
         * Render the view.
         *
         * @return {Promise<this>}
         */
        render: function (callback) {
            this._isRendered = false;
            this._isFullyRendered = false;

            return new Promise((resolve) => {
                this._getHtml(html => {
                    if (this._isRenderCanceled) {
                        this._isRenderCanceled = false;
                        this._isBeingRendered = false;

                        return;
                    }

                    if (this.$el.length) {
                        this.$el.html(html);
                    }
                    else {
                        if (this.options.el) {
                           this.setElement(this.options.el);
                        }

                        this.$el.html(html);
                    }

                    this._afterRender();

                    if (typeof callback === 'function') {
                        callback();
                    }

                    resolve(this);
                });
            });
        },

        /**
         * Re-render the view.
         *
         * @return {Promise<this>}
         */
        reRender: function (force) {
            if (this.isRendered()) {
                return this.render();
            }

            if (this.isBeingRendered()) {
                return new Promise((resolve, reject) => {
                    this.once('after:render', () => {
                        this.render()
                            .then(() => resolve(this))
                            .catch(reject);
                    });
                });
            }

            if (force) {
                return this.render();
            }

            // Don't reject, preventing an exception on a non-caught promise.
            return new Promise(() => {});
        },

        /**
         * @private
         */
        _afterRender: function () {
            this._isBeingRendered = false;
            this._isRendered = true;

            this.trigger('after:render-internal', this);

            for (var key in this.nestedViews) {
                var nestedView = this.nestedViews[key];

                if (!nestedView.notToRender) {
                    nestedView._afterRender();
                }
            }

            this.afterRender();

            this.trigger('after:render', this);

            this._isFullyRendered = true;
        },

        /**
         * Executed after render.
         *
         * @protected
         */
        afterRender: function () {},

        /**
         * @private
         */
        _tryReady: function () {
            if (this.isReady) {
                return;
            }

            if (this._wait) {
                return;
            }

            if (!this._nestedViewsFromLayoutLoaded) {
                return;
            }

            for (var i = 0; i < this._waitViewList.length; i++) {
                if (!this.hasView(this._waitViewList[i])) {
                    return;
                }
            }

            if (this._waitPromiseCount) {
                return;
            }

            for (var i = 0; i < this._readyConditionList.length; i++) {
                if (typeof this._readyConditionList[i] === 'function') {
                    if (!this._readyConditionList[i]()) {
                        return;
                    }
                }
                else {
                    if (!this._readyConditionList) {
                        return;
                    }
                }
            }

            this._makeReady();
        },

        /**
         * Run checking whether the view is ready.
         *
         * @protected
         */
        tryReady: function () {
            this._tryReady();
        },

        /**
         * @private
         */
        _makeReady: function () {
            this.isReady = true;
            this.trigger('ready');

            if (typeof this.options._onReady === 'function') {
                this.options._onReady(this);
            }
        },

        /**
         * @private
         */
        _addDefinedNestedViewDefs: function (list) {
            for (var name in this.views) {
                var o = _.clone(this.views[name]);

                o.name = name;

                list.push(o);

                this._nestedViewDefs[name] = o;
            }

            return list;
        },

        /**
         * @private
         */
        _getNestedViewsFromLayout: function () {
            var nestedViewDefs = this._layouter
                .findNestedViews(this._getLayoutName(), this._getLayout() || null, this.noCache);

            if (Object.prototype.toString.call(nestedViewDefs) !== '[object Array]') {
                throw new Error("Bad layout. It should be an Array.");
            }

            var nestedViewDefsFiltered = [];

            for (var i in nestedViewDefs) {
                var key = nestedViewDefs[i].name;

                this._nestedViewDefs[key] = nestedViewDefs[i];

                if ('view' in nestedViewDefs[i] && nestedViewDefs[i].view === true) {
                    if (!('layout' in nestedViewDefs[i] || 'template' in nestedViewDefs[i])) {
                        continue;
                    }
                }

                nestedViewDefsFiltered.push(nestedViewDefs[i]);
            }

            return nestedViewDefsFiltered;
        },

        /**
         * @private
         */
        _loadNestedViews: function (callback) {
            var nestedViewDefs = [];

            if (this._layout != null) {
                nestedViewDefs = this._getNestedViewsFromLayout();
            }

            this._addDefinedNestedViewDefs(nestedViewDefs);

            var count = nestedViewDefs.length;
            var loaded = 0;

            var tryReady = function () {
                if (loaded === count) {
                    callback();

                    return true;
                }
            };

            tryReady();

            nestedViewDefs.forEach((def, i) => {
                var key = nestedViewDefs[i].name;
                var viewName = this._factory.defaultViewName;

                if ('view' in nestedViewDefs[i]) {
                    viewName = nestedViewDefs[i].view;
                }

                if (viewName === false) {
                    loaded++;

                    tryReady();

                    return;
                }

                var options = {};

                if ('layout' in nestedViewDefs[i]) {
                    options.layout = nestedViewDefs[i].layout;
                }

                if ('template' in nestedViewDefs[i]) {
                    options.template = nestedViewDefs[i].template;
                }

                if ('el' in nestedViewDefs[i]) {
                    options.el = nestedViewDefs[i].el;
                }

                if ('options' in nestedViewDefs[i]) {
                    options = _.extend(options, nestedViewDefs[i].options);
                }

                if (this.model) {
                    options.model = this.model;
                }

                if (this.collection) {
                    options.collection = this.collection;
                }

                for (var k in this.optionsToPass) {
                    var name = this.optionsToPass[k];

                    options[name] = this.options[name];
                }

                this._factory.create(viewName, options, (view) => {
                    if ('notToRender' in nestedViewDefs[i]) {
                        view.notToRender = nestedViewDefs[i].notToRender;
                    }

                    this.setView(key, view);

                    loaded++;

                    tryReady();
                });
            });
        },

        /**
         * @private
         */
        _getData: function () {
            if (typeof this.data === 'function') {
                return this.data();
            }

            return this.data;
        },

        /**
         * @private
         */
        _getNestedViewsAsArray: function (nestedViews) {
            var nestedViewsArray = [];

            var i = 0;

            for (var key in this.nestedViews) {
                nestedViewsArray.push({
                    key: key,
                    view: this.nestedViews[key]
                });

                i++;
            }

            return nestedViewsArray;

        },

        /**
         * @private
         */
        _getNestedViewsHtmlList: function (callback) {
            var data = {};
            var nestedViewsArray = this._getNestedViewsAsArray();

            var loaded = 0;
            var count = nestedViewsArray.length;

            var tryReady = () => {
                if (loaded === count) {
                    callback(data);

                    return true;
                }
            };

            tryReady();

            nestedViewsArray.forEach((d, i) => {
                var key = nestedViewsArray[i].key;
                var view = nestedViewsArray[i].view;

                if (!view.notToRender) {
                    view.getHtml((html) => {
                        data[key] = html;

                        loaded++;
                        tryReady();
                    });

                    return;
                }

                loaded++;
                tryReady();
            });
        },

        /**
         * Provides the ability to modify template data right before render.
         *
         * @param {Object} Data
         */
        handleDataBeforeRender: function (data) {},

        /**
         * @private
         */
        _getHtml: function (callback) {
            this._isBeingRendered = true;
            this.trigger('render', this);

            this._getNestedViewsHtmlList(nestedViewsHtmlList => {
                var data = _.extend(this._getData() || {}, nestedViewsHtmlList);

                if (this.collection || null) {
                    data.collection = this.collection;
                }

                if (this.model || null) {
                    data.model = this.model;
                }

                data.viewObject = this;

                this.handleDataBeforeRender(data);

                this._getTemplate(template => {
                    var html = this._renderer.render(template, data);

                    callback(html);
                });
            });
        },

        /**
         * @private
         */
        _getTemplateName: function () {
            return this.template || null;
        },

        /**
         * @private
         */
        _getLayoutName: function () {
            return this.layout || this.name || null;
        },

        /**
         * @private
         */
        _getLayoutData: function () {
            return this.layoutData;
        },

        /**
         * @private
         */
        _getLayout: function () {
            if (typeof this._layout === 'function') {
                return this._layout();
            }

            return this._layout;
        },

        /**
         * @private
         */
        _getTemplate: function (callback) {
            if (this._templator.compilable && this._templateCompiled !== null) {
                callback(this._templateCompiled);

                return;
            }

            var _template = this._template || null;

            if (_template !== null) {
                callback(_template);

                return;
            }

            var templateName = this._getTemplateName();

            var noCache = false;
            var layoutOptions = {};

            if (!templateName) {
                noCache = this.noCache;

                var layoutName = this._getLayoutName();

                if (!layoutName) {
                    noCache = true;
                }
                else {
                    if (layoutName) {
                        templateName = 'built-' + layoutName;
                    }
                    else {
                        templateName = null;
                    }
                }

                layoutOptions = {
                    name: layoutName,
                    data: this._getLayoutData(),
                    layout: this._getLayout(),
                };
            }

            this._templator.getTemplate(templateName, layoutOptions, noCache, callback);
        },

        /**
         * @private
         */
        _updatePath: function (parentPath, viewKey) {
            this._path = parentPath + '/' + viewKey;

            for (var key in this.nestedViews) {
                this.nestedViews[key]._updatePath(this._path, key);
            }
        },

        /**
         * @private
         */
        _getSelectorForNestedView: function (key) {
            var el = false;

            if (key in this._nestedViewDefs) {
                if ('id' in this._nestedViewDefs[key]) {
                    el = '#' + this._nestedViewDefs[key].id;
                }
                else {
                    if ('el' in this._nestedViewDefs[key]) {
                        el = this._nestedViewDefs[key].el;
                    }
                    else if ('selector' in this._nestedViewDefs[key]) {
                        var currentEl = this.getSelector();

                        if (currentEl) {
                            el = currentEl + ' ' + this._nestedViewDefs[key].selector;
                        }
                    }
                    else {
                        var currentEl = this.getSelector();

                        if (currentEl) {
                            el = currentEl + ' [data-view="'+key+'"]';
                        }
                    }
                }
            }

            return el;
        },

        /**
         * Whether has a nested view.
         *
         * @param {string} key A key.
         * @return {boolean}
         */
        hasView: function (key) {
            if (key in this.nestedViews) {
                return true;
            }

            return false;
        },

        /**
         * Get a nested view.
         *
         * @param {string} key A key.
         * @return {Bull.View}
         */
        getView: function (key) {
            if (key in this.nestedViews) {
                return this.nestedViews[key];
            }
        },

        /**
         * Create a nested view. The important method.
         *
         * @param {string} key A view key.
         * @param {string} viewName A view name/path.
         * @param {Bull.ViewOptions} options View options. Custom options can be passed as well.
         * @param {Function} [?callback] Deprecated. Use a promise. Invoked once a nested view is ready (loaded).
         * @param {boolean} [wait=true] Set false if no need parent view wait for nested view loaded.
         */
        createView: function (key, viewName, options, callback, wait) {
            this.clearView(key);

            this._viewPromiseHash = this._viewPromiseHash || {};

            let promise = null;

            promise = this._viewPromiseHash[key] = new Promise((resolve, reject) => {
                wait = (typeof wait === 'undefined') ? true : wait;

                if (wait) {
                    this.waitForView(key);
                }

                options = options || {};

                if (!options.el) {
                    options.el = this.getSelector() + ' [data-view="'+key+'"]';
                }

                this._factory.create(viewName, options, (view) => {
                    let previusView = this.getView(key);

                    if (previusView) {
                        previusView.cancelRender();
                    }

                    delete this._viewPromiseHash[key];

                    if (promise && promise._isToCancel) {
                        return;
                    }

                    let isSet = false;

                    if (this._isRendered || options.setViewBeforeCallback) {
                        this.setView(key, view);

                        isSet = true;
                    }

                    if (typeof callback === 'function') {
                        callback.call(this, view);
                    }

                    resolve(view);

                    if (!this._isRendered && !options.setViewBeforeCallback && !isSet) {
                        this.setView(key, view);
                    }
                });
            });

            return promise;
        },

        /**
         * Set a nested view.
         *
         * @param {string} key A view key.
         * @param {Bull.View} view A view name/path.
         * @param {string} [el] A selector for a view container.
         */
        setView: function (key, view, el) {
            var el = el || this._getSelectorForNestedView(key) || view.options.el || false;

            if (el) {
                if (this.isRendered()) {
                    view.setElement(el);
                } else {
                    view.setElementInAdvance(el);
                }
            }

            if (key in this.nestedViews) {
                this.clearView(key);
            }

            this.nestedViews[key] = view;

            view._parentView = this;
            view._updatePath(this._path, key);

            this._tryReady();
        },

        /**
         * Clear a nested view. Initiates removal of the nested view.
         *
         * @param {string} key A view key.
         */
        clearView: function (key) {
            if (key in this.nestedViews) {
                this.nestedViews[key].remove();

                delete this.nestedViews[key];
            }

            this._viewPromiseHash = this._viewPromiseHash || {};

            var previousPromise = this._viewPromiseHash[key];

            if (previousPromise) {
                previousPromise._isToCancel = true;
            }
        },

        /**
         * Removes a nested view for cases when it's supposed that this view can be re-used in future.
         *
         * @param {string} key A view key.
         */
        unchainView: function (key) {
            if (key in this.nestedViews) {
                this.nestedViews[key]._parentView = null;
                this.nestedViews[key].undelegateEvents();

                delete this.nestedViews[key];
            }
        },

        /**
         * Get a parent view.
         *
         * @return {Bull.View}
         */
        getParentView: function () {
            return this._parentView;
        },

        /**
         * Has a parent view.
         *
         * @return {boolean}
         */
        hasParentView: function () {
            return !!this._parentView;
        },

        /**
         * Add a condition for the view getting ready.
         *
         * @param {(Function|boolean)} condition
         */
        addReadyCondition: function (condition) {
            this._readyConditionList.push(condition);
        },

        /**
         * Wait for a nested view.
         *
         * @protected
         * @param {string} key
         */
        waitForView: function (key) {
            this._waitViewList.push(key);
        },

        /**
         * Makes the view to wait for a promise (if a Promise is passed as a parameter).
         * Adds a wait condition if true is passed. Removes the wait condition if false.
         *
         * @protected
         * @param {(Promise|boolean)} wait A wait-promise or true/false.
         */
        wait: function (wait) {
            if (typeof wait === 'object' && (wait instanceof Promise || typeof wait.then === 'function')) {
                this._waitPromiseCount++;

                wait.then(() => {
                    this._waitPromiseCount--;
                    this._tryReady();
                });

                return;
            }

            if (typeof wait === 'function') {
                this._waitPromiseCount++;

                var promise = new Promise(resolve => {
                    resolve(wait.call(this));
                });

                promise.then(() => {
                    this._waitPromiseCount--;
                    this._tryReady();
                });

                return promise;
            }

            if (wait) {
                this._wait = true;

                return;
            }

            this._wait = false;
            this._tryReady();
        },

        /**
         * Remove the view and all nested tree. Removes an element from DOM. Triggers the 'remove' event.
         *
         * @public
         * @param {boolean} [dontEmpty] Skips emptying an element container.
         */
        remove: function (dontEmpty) {
            this.cancelRender();

            for (var key in this.nestedViews) {
                this.clearView(key);
            }

            this.trigger('remove');
            this.onRemove();
            this.off();

            if (!dontEmpty) {
                this.$el.empty();
            }

            this.stopListening();
            this.undelegateEvents();

            if (this.model) {
                this.model.off(null, null, this);
            }

            if (this.collection) {
                this.collection.off(null, null, this);
            }

            this._isRendered = false;
            this._isFullyRendered = false;
            this._isBeingRendered = false;
            this._isRemoved = true;

            return this;
        },

        /**
         * Called on view removal.
         *
         * @protected
         */
        onRemove: function () {},

        /**
         * @private
         */
        _ensureElement: function () {
            this.$el = $();
        },

        /**
         * @private
         */
        _setElement: function (el) {
            if (typeof el === 'string') {
                var parentView = this.getParentView();

                if (parentView && parentView.isRendered()) {
                    if (parentView.$el && parentView.$el.length && parentView.getSelector()) {
                        if (el.indexOf(parentView.getSelector()) === 0) {
                            var subEl = el.substr(parentView.getSelector().length, el.length - 1);

                            this.$el = $(subEl, parentView.$el).eq(0);
                            this.el = this.$el[0];

                            return;
                        }
                    }
                }
            }

            this.$el = $(el).eq(0);
            this.el = this.$el[0];
        },

        /**
         * Propagate an event to nested views.
         *
         * @public
         * @param {...*} arguments
         */
        propagateEvent: function () {
            this.trigger.apply(this, arguments);

            for (var key in this.nestedViews) {
                var view = this.nestedViews[key];

                view.propagateEvent.apply(view, arguments);
            }
        },
    });
}).call(this, Bull, Backbone, _);
