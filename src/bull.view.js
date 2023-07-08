// noinspection JSUnusedGlobalSymbols

import Events from './bull.events.js';
import $ from 'jquery';
import _ from 'underscore';

/**
 * View options passed to a view on creation.
 *
 * @typedef {Object.<string, *>} Bull.View~Options
 *
 * @property {string} [selector] A DOM element selector relative to a parent view.
 * @property {string} [fullSelector] A full DOM element selector.
 * @property {string[]} [optionsToPass] Options to be automatically passed to child views
 *   of the created view.
 * @property {(function: Object)|Object} [data] Data that will be passed to a template or a function
 *   that returns data.
 * @property {string} [template] A template name.
 * @property {string} [templateContent] Template content.
 * @property {Object} [layoutDefs] Internal layout defs.
 * @property {Object} [layoutData] Internal layout data.
 * @property {boolean} [notToRender] Not to render on ready.
 * @property {boolean} [noCache] Disable layout cache.
 * @property {Object.<string, Bull.View~NestedViewItem>} [views] Child view definitions.
 * @property {string} [name] A view name.
 * @property {Bull.Model} [model] A model.
 * @property {Bull.Collection} [collection] A collection.
 * @property {Bull.View.DomEvents} [events] DOM events.
 * @property {boolean} [setViewBeforeCallback] A child view will be set to a parent before a promise is resolved.
 */

/**
 * @typedef {Object} Bull
 */

/**
 * A model.
 *
 * @typedef {Object} Bull~Model
 * @type Object
 * @mixes Bull.Events
 */

/**
 * A collection.
 *
 * @typedef {Object} Bull~Collection
 * @type Object
 * @mixes Bull.Events
 */

/**
 * Nested view definitions.
 *
 * @typedef {Object} Bull.View~NestedViewItem
 *
 * @property {string} view A view name/path.
 * @property {string} [selector] A DOM element selector relative to a parent view.
 * @property {string} [fullSelector] A full DOM element selector.
 * @property {string} [el] Deprecated. Use `fullSelector`. A full DOM element selector.
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
 * A get-HTML callback.
 *
 * @callback Bull.View~getHtmlCallback
 *
 * @param {string} html An HTML.
 */

/**
 * A DOM event callback.
 *
 * @callback Bull.View~domEventCallback
 *
 * @param {jQuery.Event} e An event.
 */

/**
 * A DOM event handler callback.
 *
 * @callback Bull.View~domEventHandlerCallback
 * @param {Event} event An event.
 */

/**
 * @typedef {'click'|'mousedown'|'keydown'|string} Bull.View~domEventType
 */

/**
 * @callback Bull.Events~callback
 *
 * @param {...*} arguments
 */

/**
 * @mixin Bull.Events
 */

/**
 * Trigger an event.
 *
 * @function trigger
 * @memberof Bull.Events
 * @param {string} event An event.
 * @param {...*} arguments Arguments.
 */

/**
 * Subscribe to an event.
 *
 * @function on
 * @memberof Bull.Events
 * @param {string} event An event.
 * @param {Bull.Events~callback} callback A callback.
 */

/**
 * Subscribe to an event. Fired once.
 *
 * @function once
 * @memberof Bull.Events
 * @param {string} event An event.
 * @param {Bull.Events~callback} callback A callback.
 */

/**
 * Unsubscribe from an event or all events.
 *
 * @function off
 * @memberof Bull.Events
 * @param {string} [event] From a specific event.
 * @param {Bull.Events~callback} [callback] From a specific callback.
 */

/**
 * Subscribe to an event of other object. Will be automatically unsubscribed on view removal.
 *
 * @function listenTo
 * @memberof Bull.Events
 * @param {Object} other What to listen.
 * @param {string} event An event.
 * @param {Bull.Events~callback} callback A callback.
 */

/**
 * Subscribe to an event of other object. Fired once. Will be automatically unsubscribed on view removal.
 *
 * @function listenToOnce
 * @memberof Bull.Events
 * @param {Object} other What to listen.
 * @param {string} event An event.
 * @param {Bull.Events~callback} callback A callback.
 */

/**
 * Stop listening to other object. No arguments will remove all listeners.
 *
 * @function stopListening
 * @memberof Bull.Events
 * @param {Object} [other] To remove listeners to a specific object.
 * @param {string} [event] To remove listeners to a specific event.
 * @param {Bull.Events~callback} [callback] To remove listeners to a specific callback.
 */

/**
 * DOM event listeners.
 *
 * @typedef {Object.<string, Bull.View~domEventCallback>} Bull.View.DomEvents
 */

/**
 * @typedef {Object} Bull.View~nestedViewItemDefs
 * @property {string} name A name.
 * @property {string|true} [view] A view.
 * @property {string} [layout] A layout.
 * @property {string} [template] A template.
 * @property {boolean} [notToRender] Not to render.
 * @property {string} [selector] A relative selector.
 * @property {string} [fullSelector] A full selector.
 * @property {Object.<string, *>} [options] Options.
 */

/**
 * A view.
 *
 * @alias Bull.View
 * @mixes Bull.Events
 */
class View {

    /**
     * @param {Object.<string, *>} [options]
     * @mixes Bull.Events
     */
    constructor(options = {}) {
        this.cid = _.uniqueId('view');

        if ('model' in options) {
            this.model = options.model;
        }

        if ('collection' in options) {
            this.collection = options.collection;
        }

        this.$el = $();
        this.options = options;

        let fullSelector = options.fullSelector || options.el;

        if (fullSelector) {
            this.setSelector(fullSelector);
        }
    }

    /**
     * An ID, unique among all views.
     * @type {string}
     * @public
     */
    cid

    /**
     * @type {string}
     * @private
     */
    _elementSelector

    /**
     * Is component. Components does not require a DOM container defined by a parent view.
     * Should have one root DOM element.
     *
     * An experimental feature.
     *
     * @readonly
     * @type {boolean}
     */
    isComponent = false

    /**
     * A DOM element.
     *
     * @type {Element}
     */
    element

    /**
     * A template name/path.
     *
     * @type {string|null}
     * @protected
     */
    template = null

    /**
     * Template content. Alternative to specifying a template name/path.
     *
     * @type {string|null}
     * @protected
     */
    templateContent = null

    /**
     * A name of the view. If template name is not defined it will be used to cache
     * built template and layout. Otherwise, they won't be cached. A name is unique.
     *
     * @type {string|null}
     */
    name = null

    /**
     * DOM event listeners. Recommended to use `addHandler` method instead.
     *
     * @type {Bull.View.DomEvents}
     * @protected
     */
    events = null

    /**
     * Not to use cache for layouts. Use it if layouts are dynamic.
     *
     * @type {boolean}
     * @protected
     */
    noCache = false

    /**
     * Not to render a view automatically when a view tree is built (ready).
     * Afterward, it can be rendered manually.
     *
     * @type {boolean}
     * @protected
     */
    notToRender = false

    /**
     * Layout itself.
     *
     * @type {Object|null}
     * @protected
     * @internal
     */
    _layout = null

    /**
     * Layout data.
     *
     * @type {Object|null}
     * @protected
     */
    layoutData = null

    /**
     * Whether the view is ready for rendering (all necessary data is loaded).
     *
     * @type {boolean}
     * @public
     */
    isReady = false

    /**
     * Definitions for nested views that should be automatically created.
     * Format: viewKey => view defs.
     *
     * Example: ```
     * {
     *   body: {
     *     view: 'view/path/body',
     *     selector: '> .body',
     *   }
     * }
     * ```
     *
     * @type {Object.<string, Bull.View~NestedViewItem>|null}
     * @protected
     */
    views = null

    /**
     * A list of options to be automatically passed to child views.
     *
     * @type {string[]|null}
     * @protected
     */
    optionsToPass = null

    /**
     * @type {string|null}
     * @private
     */
    layout = null
    /**
     * Nested views.
     *
     * @type {Object.<string, View>}
     * @protected
     * @internal
     */
    nestedViews = null

    /**
     * @private
     * @type {Bull.Factory}
     */
    _factory = null

    /**
     * A helper.
     *
     * @protected
     */
    _helper = null

    /**
     * @type {string|null}
     * @private
     */
    _template = null
    /**
     * @type {Object.<string, Bull.View~nestedViewItemDefs>|null}
     * @private
     */
    _nestedViewDefs = null
    /** @private */
    _templator = null
    /** @private */
    _renderer = null
    /** @private */
    _layouter = null
    /** @private */
    _templateCompiled = null
    /** @private */
    _parentView = null
    /** @private */
    _path = ''
    /** @private */
    _wait = false
    /** @private */
    _waitViewList = null
    /** @private */
    _nestedViewsFromLayoutLoaded = false
    /** @private */
    _readyConditionList = null
    /** @private */
    _isRendered = false
    /** @private */
    _isFullyRendered = false
    /** @private */
    _isBeingRendered = false
    /** @private */
    _isRemoved = false
    /** @private */
    _isRenderCanceled = false
    /** @private */
    _preCompiledTemplates = null

    /**
     * Set a DOM element selector.
     *
     * @param {string} selector A full DOM selector.
     */
    setElement(selector) {
        this.undelegateEvents();
        this._setElement(selector);
        this._delegateEvents();
    }

    /**
     * Removes all view's delegated events. Useful if you want to disable
     * or remove a view from the DOM temporarily.
     */
    undelegateEvents() {
        if (!this.$el) {
            return;
        }

        this.$el.off('.delegateEvents' + this.cid);
    }

    /** @private */
    _delegateEvents() {
        let events = _.result(this, 'events');

        if (!events) {
            return;
        }

        this.undelegateEvents();

        for (let key in events) {
            let method = events[key];

            if (typeof method !== 'function') {
                method = this[method];
            }

            if (!method) {
                continue;
            }

            let match = key.match(delegateEventSplitter);

            this._delegate(match[1], match[2], method.bind(this));
        }
    }

    /** @private */
    _delegate(eventName, selector, listener) {
        this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
    }

    /**
     * Add a DOM event handler. To be called in `setup` method.
     *
     * @param {Bull.View~domEventType} type An event type.
     * @param {string} selector A CSS selector.
     * @param {Bull.View~domEventHandlerCallback|string} handler A handler.
     */
    addHandler(type, selector, handler) {
        let key = type + ' ' + selector;

        if (typeof handler === 'function') {
            this.events[key] = (e) => handler(e.originalEvent);

            return;
        }

        if (typeof this[handler] !== 'function') {
            console.warn(`Could not add event handler. No '${handler}' method.`)

            return;
        }

        this.events[key] = (e) => this[handler](e.originalEvent);
    }

    /**
     * To be run by the view-factory after instantiating. Should not be overridden.
     * Not called from the constructor to be able to use ES6 classes with property initializers,
     * as overridden properties not available in a constructor.
     *
     * @param {{
     *   factory: Bull.Factory,
     *   renderer: Bull.Renderer,
     *   templator: Bull.Templator,
     *   layouter: Bull.Layouter,
     *   helper?: Object,
     *   onReady?: function(): void,
     *   preCompiledTemplates?: Object,
     * }} data
     * @internal
     */
    _initialize(data) {
        /**
         * @type {Bull.Factory}
         * @private
         */
        this._factory = data.factory;

        /**
         * @type {Bull.Renderer}
         * @private
         */
        this._renderer = data.renderer;

        /**
         * @type {Bull.Templator}
         * @private
         */
        this._templator = data.templator;

        /**
         * @type {Bull.Layouter}
         * @private
         */
        this._layouter = data.layouter;

        /**
         * @type {(function(): void)|null}
         * @private
         */
        this._onReady = data.onReady || null;

        /**
         * @type {Object|null}
         * @private
         */
        this._helper = data.helper || null;

        /**
         * @type {Object}
         * @private
         */
        this._preCompiledTemplates = data.preCompiledTemplates || {};

        if ('noCache' in this.options) {
            this.noCache = this.options.noCache;
        }

        this.events = _.clone(this.events || {});
        this.name = this.options.name || this.name;
        this.notToRender = ('notToRender' in this.options) ? this.options.notToRender : this.notToRender;

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

        let merge = function (target, source) {
            for (let prop in source) {
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
        /**
         * @todo Revise.
         * @type {string}
         * @private
         */
        this.layout = this.options.layout;

        /** @private */
        this._layout = this.options.layoutDefs || this.options._layout || this._layout;
        /**
         * @private
         * @type {Object|null}
         */
        this.layoutData = this.options.layoutData || this.layoutData;
        /**
         * @type {string|null}
         * @private
         */
        this._template = this.templateContent || this.options.templateContent || this._template;

        if (this._template != null && this._templator.compilable) {
            /** @private */
            this._templateCompiled = this._templator.compileTemplate(this._template);
        }

        if (this._elementSelector) {
            this.setElementInAdvance(this._elementSelector);
        }

        let _layout = this._getLayout();

        let loadNestedViews = () => {
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

        if (this.views != null) {
            loadNestedViews();

            return;
        }

        this._nestedViewsFromLayoutLoaded = true;

        this._tryReady();
    }

    /**
     * Compose template data. A key => value result will be passed to
     * a template.
     *
     * @protected
     * @returns {Object.<string, *>|{}}
     */
    data() {
        return {};
    }

    /**
     * Initialize the view. Is invoked before #setup.
     *
     * @protected
     */
    init() {}

    /**
     * Set up the view. Is invoked after #init.
     *
     * @protected
     */
    setup() {}

    /**
     * Additional setup. Is invoked after #setup.
     * Useful to let developers override setup logic w/o needing to call
     * a parent method in right order.
     *
     * @protected
     */
    setupFinal() {}

    /**
     * Set a view container element if it doesn't exist yet. It will call setElement after render.
     *
     * @param {string} fullSelector A full DOM selector.
     * @protected
     */
    setElementInAdvance(fullSelector) {
        if (this._setElementInAdvancedInProcess) {
            return;
        }

        this._setElementInAdvancedInProcess = true;

        this.on('after:render-internal', () => {
            this.setElement(fullSelector);

            this._setElementInAdvancedInProcess = false;
        });
    }

    /**
     * Get a full DOM element selector.
     *
     * @public
     * @return {string|null}
     */
    getSelector() {
        return this._elementSelector || null
    }

    /**
     * Set a full DOM element selector.
     *
     * @public
     * @param {string} selector A selector.
     */
    setSelector(selector) {
        this._elementSelector = selector;

        // For backward compatibility.
        this.options.el = selector;
    }

    /**
     * Checks whether the view has been already rendered
     *
     * @public
     * @return {boolean}
     */
    isRendered() {
        return this._isRendered;
    }

    /**
     * Checks whether the view has been fully rendered (afterRender has been executed).
     *
     * @public
     * @return {boolean}
     */
    isFullyRendered() {
        return this._isFullyRendered;
    }

    /**
     * Whether the view is being rendered at the moment.
     *
     * @public
     * @return {boolean}
     */
    isBeingRendered() {
        return this._isBeingRendered;
    }

    /**
     * Whether the view is removed.
     *
     * @public
     * @return {boolean}
     */
    isRemoved() {
        return this._isRemoved;
    }

    /**
     * Get HTML of view but don't render it.
     *
     * @public
     * @param {Bull.View~getHtmlCallback} callback A callback with an HTML.
     */
    getHtml(callback) {
        this._getHtml(callback);
    }

    /**
     * Cancel rendering.
     */
    cancelRender() {
        if (!this.isBeingRendered()) {
            return;
        }

        this._isRenderCanceled = true;
    }

    /**
     * Un-cancel rendering.
     */
    uncancelRender() {
        this._isRenderCanceled = false;
    }

    /**
     * Render the view.
     *
     * @param {function()} [callback] Deprecated. Use promise.
     * @return {Promise<this>}
     */
    render(callback) {
        this._isRendered = false;
        this._isFullyRendered = false;

        return new Promise(resolve => {
            this._getHtml(html => {
                if (this._isRenderCanceled) {
                    this._isRenderCanceled = false;
                    this._isBeingRendered = false;

                    return;
                }

                this.isComponent ?
                    this._renderComponentInDom(html) :
                    this._renderInDom(html);

                if (!this.element) {
                    let msg = this._elementSelector ?
                        `Could not set element '${this._elementSelector}'.` :
                        `Could not set element. No selector.`;

                    console.warn(msg);
                }

                this._afterRender();

                if (typeof callback === 'function') {
                    callback();
                }

                resolve(this);
            });
        });
    }

    /**
     * @param {string} html
     * @private
     */
    _renderComponentInDom(html) {
        if (!this.element) {
            if (!this._elementSelector) {
                console.warn(`Can't render component. No DOM selector.`);

                return;
            }

            this._setElement(this._elementSelector);
        }

        if (!this.element) {
            console.warn(`Can't render component. No DOM element.`);

            return;
        }

        let div = document.createElement('div');
        div.innerHTML = html;
        let element = div.children[0];

        let parent = this.element.parentElement;

        parent.replaceChild(element, this.element);

        this.setElement(this._elementSelector);
    }

    /**
     * @param {string} html
     * @private
     */
    _renderInDom(html) {
        if (!this.$el.length && this._elementSelector) {
            this.setElement(this._elementSelector);
        }

        this.$el.html(html);
    }

    /**
     * Re-render the view.
     *
     * @param {boolean} [force=false] To render if was not rendered.
     * @return {Promise<this>}
     */
    reRender(force) {
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
    }

    /** @private */
    _afterRender() {
        this._isBeingRendered = false;
        this._isRendered = true;

        this.trigger('after:render-internal', this);

        for (let key in this.nestedViews) {
            let nestedView = this.nestedViews[key];

            if (!nestedView.notToRender) {
                nestedView._afterRender();
            }
        }

        this.afterRender();

        this.trigger('after:render', this);

        this._isFullyRendered = true;
    }

    /**
     * Executed after render.
     *
     * @protected
     */
    afterRender() {}

    /**
     * Proceed when rendered.
     *
     * @return {Promise<void>}
     */
    whenRendered() {
        if (this.isRendered()) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.once('after:render', () => resolve())
        });
    }

    /** @private */
    _tryReady() {
        if (this.isReady) {
            return;
        }

        if (this._wait) {
            return;
        }

        if (!this._nestedViewsFromLayoutLoaded) {
            return;
        }

        for (let i = 0; i < this._waitViewList.length; i++) {
            if (!this.hasView(this._waitViewList[i])) {
                return;
            }
        }

        if (this._waitPromiseCount) {
            return;
        }

        for (let i = 0; i < this._readyConditionList.length; i++) {
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
    }

    /** @private */
    _makeReady() {
        this.isReady = true;
        this.trigger('ready');

        if (typeof this._onReady === 'function') {
            this._onReady(this);
        }
    }

    /**
     * @private
     * @param {Bull.View~nestedViewItemDefs[]} [list
     */
    _addDefinedNestedViewDefs(list) {
        for (let name in this.views) {
            let o = _.clone(this.views[name]);

            o.name = name;

            list.push(o);

            this._nestedViewDefs[name] = o;
        }

        return list;
    }

    /**
     * @private
     * @return {Bull.View~nestedViewItemDefs[]}
     */
    _getNestedViewDefsFromLayout() {
        let itemList = this._layouter.findNestedViews(
            this._getLayoutName(),
            this._getLayout() || null,
            this.noCache
        );

        if (Object.prototype.toString.call(itemList) !== '[object Array]') {
            throw new Error("Bad layout. It should be an array.");
        }

        let nestedViewDefsFiltered = [];

        for (let item of itemList) {
            let key = item.name;

            this._nestedViewDefs[key] = item;

            if ('view' in item && item.view === true) {
                if (!('layout' in item || 'template' in item)) {
                    continue;
                }
            }

            nestedViewDefsFiltered.push(item);
        }

        return nestedViewDefsFiltered;
    }

    /**
     * @private
     * @param {function()} callback
     */
    _loadNestedViews(callback) {
        let nestedViewDefs = this._layout != null ?
            this._getNestedViewDefsFromLayout() : [];

        this._addDefinedNestedViewDefs(nestedViewDefs);

        let count = nestedViewDefs.length;
        let loaded = 0;

        let tryReady = function () {
            if (loaded === count) {
                callback();
            }
        };

        tryReady();

        nestedViewDefs.forEach(/** Bull.View~nestedViewItemDefs */def => {
            let key = def.name;
            let viewName = this._factory.defaultViewName;

            if ('view' in def) {
                viewName = def.view;
            }

            if (viewName === false) {
                loaded++;
                tryReady();

                return;
            }

            let options = {};

            if ('layout' in def) {
                options.layout = def.layout;
            }

            if ('template' in def) {
                options.template = def.template;
            }

            // noinspection JSUnresolvedReference
            let fullSelector = def.fullSelector || /** @type {string} */def.el;

            if (fullSelector) {
                options.fullSelector = fullSelector;
            }
            else if ('selector' in def) {
                options.selector = def.selector;
            }

            if ('options' in def) {
                options = {...options, ...def.options};
            }

            if (this.model) {
                options.model = this.model;
            }

            if (this.collection) {
                options.collection = this.collection;
            }

            for (let k in this.optionsToPass) {
                let name = this.optionsToPass[k];

                options[name] = this.options[name];
            }

            this._factory.create(viewName, options, view => {
                if ('notToRender' in def) {
                    view.notToRender = def.notToRender;
                }

                this.setView(key, view);

                loaded++;
                tryReady();
            });
        });
    }

    /**
     * @private
     * @return {Object.<string, *>}
     */
    _getData() {
        if (this.options.data) {
            if (typeof this.options.data === 'function') {
                return this.options.data();
            }

            return this.options.data;
        }

        if (typeof this.data === 'function') {
            return this.data();
        }

        return this.data;
    }

    /**
     * @private
     * @return {{
     *     key: string,
     *     view: View,
     * }[]}
     */
    _getNestedViewsAsArray() {
        let nestedViewsArray = [];

        let i = 0;

        for (let key in this.nestedViews) {
            nestedViewsArray.push({
                key: key,
                view: this.nestedViews[key],
            });

            i++;
        }

        return nestedViewsArray;
    }

    /**
     * @private
     * @param {function(Object.<string, *>)} callback
     */
    _getNestedViewsHtmlMap(callback) {
        let data = {};
        let items = this._getNestedViewsAsArray();

        let loaded = 0;
        let count = items.length;

        let tryReady = () => {
            if (loaded === count) {
                callback(data);
            }
        };

        tryReady();

        items.forEach(item => {
            let key = item.key;
            let view = item.view;

            if (view.notToRender) {
                if (view.isComponent) {
                    data[key] = this._createPlaceholderElement(view.cid).outerHTML;
                }

                loaded++;
                tryReady();

                return;
            }

            view.getHtml(html => {
                data[key] = html;

                loaded++;
                tryReady();
            });
        });
    }

    /**
     * Provides the ability to modify template data right before render.
     *
     * @param {Object.<string, *>} data Data.
     */
    handleDataBeforeRender(data) {}

    /**
     * @private
     * @param {function(string)} callback
     */
    _getHtml(callback) {
        this._isBeingRendered = true;
        this.trigger('render', this);

        this._getNestedViewsHtmlMap(htmlMap => {
            let data = {...this._getData(), ...htmlMap};

            if (this.collection || null) {
                data.collection = this.collection;
            }

            if (this.model || null) {
                data.model = this.model;
            }

            data.viewObject = this;

            this.handleDataBeforeRender(data);

            this._getTemplate(template => {
                let html = this._renderer.render(template, data);

                if (!this.isComponent) {
                    callback(html);

                    return;
                }

                let root = (new DOMParser())
                    .parseFromString(html, 'text/html')
                    .body
                    .children[0];

                if (!root) {
                    throw new Error(`Bad DOM. No root.`);
                }

                root.setAttribute('data-view-cid', this.cid);

                callback(root.outerHTML);
            });
        });
    }

    /**
     * @private
     * @return {string|null}
     */
    _getTemplateName() {
        return this.template || null;
    }

    /**
     * @private
     * @return {string|null}
     */
    _getLayoutName() {
        return this.layout || this.name || null;
    }

    /** @private */
    _getLayoutData() {
        return this.layoutData;
    }

    /** @private */
    _getLayout() {
        if (typeof this._layout === 'function') {
            return this._layout();
        }

        return this._layout;
    }

    /**
     * @private
     * @param {function(*)} callback
     */
    _getTemplate(callback) {
        if (
            this._templator &&
            this._templator.compilable &&
            this._templateCompiled !== null
        ) {
            callback(this._templateCompiled);

            return;
        }

        let _template = this._template || null;

        if (_template !== null) {
            callback(_template);

            return;
        }

        let templateName = this._getTemplateName();

        if (
            templateName &&
            templateName in (this._preCompiledTemplates || {})
        ) {
            callback(this._preCompiledTemplates[templateName]);

            return;
        }

        let noCache = false;
        let layoutOptions = {};

        if (!templateName) {
            noCache = this.noCache;

            let layoutName = this._getLayoutName();

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
    }

    /** @private */
    _updatePath(parentPath, viewKey) {
        this._path = parentPath + '/' + viewKey;

        for (let key in this.nestedViews) {
            this.nestedViews[key]._updatePath(this._path, key);
        }
    }

    /**
     * @private
     * @param {string} key
     * @return {string|null}
     */
    _getSelectorForNestedView(key) {
        if (!(key in this._nestedViewDefs)) {
            return null;
        }

        if ('id' in this._nestedViewDefs[key]) {
            return '#' + this._nestedViewDefs[key].id;
        }

        let fullSelector = this._nestedViewDefs[key].fullSelector ||
            this._nestedViewDefs[key].el;

        if (fullSelector) {
            return fullSelector;
        }

        let currentEl = this.getSelector();

        if (!currentEl) {
            return null;
        }

        if ('selector' in this._nestedViewDefs[key]) {
            return currentEl + ' ' + this._nestedViewDefs[key].selector;
        }

        return currentEl + ' [data-view="' + key + '"]';
    }

    /**
     * Whether the view has a nested view.
     *
     * @param {string} key A view key.
     * @return {boolean}
     */
    hasView(key) {
        return key in this.nestedViews;
    }

    /**
     * Get a nested view.
     *
     * @param {string} key A view key.
     * @return {View|null}
     */
    getView(key) {
        if (key in this.nestedViews) {
            return this.nestedViews[key];
        }

        return null;
    }

    /**
     * Assign a view instance as nested.
     *
     * @param {string} key A view key.
     * @param {Bull.View} view A view.
     * @param {string} [selector] A relative selector.
     * @return {Promise<View>}
     */
    assignView(key, view, selector) {
        this.clearView(key);

        this._viewPromiseHash = this._viewPromiseHash || {};
        let promise = null;

        promise = this._viewPromiseHash[key] = new Promise(resolve => {
            if (!this.isReady) {
                this.waitForView(key);
            }

            if (!selector && view.isComponent) {
                selector = `[data-view-cid="${view.cid}"]`;
            }

            if (selector/* || !view.getSelector()*/) {
                //selector = selector || `[data-view="${key}"]`;

                view.setSelector(this.getSelector() + ' ' + selector);
            }

            view._initialize({
                factory: this._factory,
                layouter: this._layouter,
                templator: this._templator,
                renderer: this._renderer,
                helper: this._helper,
                onReady: () => this._assignViewCallback(key, view, resolve, promise),
            });
        });

        return promise;
    }

    /**
     * Create a nested view. The important method.
     *
     * @param {string} key A view key.
     * @param {string} viewName A view name/path.
     * @param {Bull.View~Options} options View options. Custom options can be passed as well.
     * @param {Function} [callback] Deprecated. Use a promise. Invoked once a nested view is ready (loaded).
     * @param {boolean} [wait=true] Set false if no need a parent view to wait till nested view loaded.
     * @return {Promise<View>}
     */
    createView(key, viewName, options, callback, wait) {
        this.clearView(key);

        this._viewPromiseHash = this._viewPromiseHash || {};

        let promise = null;

        promise = this._viewPromiseHash[key] = new Promise(resolve => {
            wait = (typeof wait === 'undefined') ? true : wait;

            if (wait) {
                this.waitForView(key);
            }

            options = options || {};

            let fullSelector = options.fullSelector || options.el;

            if (!fullSelector && options.selector) {
                options.fullSelector = this.getSelector() + ' ' + options.selector;
            }

            /*if (!fullSelector && !options.fullSelector) {
                options.fullSelector = this.getSelector() + ` [data-view="${key}"]`;
            }*/

            this._factory.create(viewName, options, view => {
                if (view.isComponent && !options.fullSelector) {
                    options.fullSelector = this.getSelector() + ` [data-view-cid="${view.cid}"]`;
                }

                this._assignViewCallback(
                    key,
                    view,
                    resolve,
                    promise,
                    callback,
                    options.setViewBeforeCallback
                );
            });
        });

        return promise;
    }

    /**
     * @param {string} key
     * @param {Bull.View} view
     * @param {function} resolve
     * @param {Promise} promise
     * @param {function} [callback]
     * @param {boolean} [setViewBeforeCallback]
     * @private
     */
    _assignViewCallback(
        key,
        view,
        resolve,
        promise,
        callback,
        setViewBeforeCallback
    ) {
        let previousView = this.getView(key);

        if (previousView) {
            previousView.cancelRender();
        }

        delete this._viewPromiseHash[key];

        // noinspection JSUnresolvedReference
        if (promise && promise._isToCancel) {
            if (!view.isRemoved()) {
                view.remove();
            }

            return;
        }

        let isSet = false;

        if (this._isRendered || setViewBeforeCallback) {
            this.setView(key, view);

            isSet = true;
        }

        if (typeof callback === 'function') {
            callback.call(this, view);
        }

        resolve(view);

        if (!this._isRendered && !setViewBeforeCallback && !isSet) {
            this.setView(key, view);
        }
    }

    /**
     * Set a nested view.
     *
     * @param {string} key A view key.
     * @param {Bull.View} view A view name/path.
     * @param {string} [fullSelector] A full DOM selector for a view container.
     */
    setView(key, view, fullSelector) {
        fullSelector = fullSelector || this._getSelectorForNestedView(key) || view.getSelector();

        if (fullSelector) {
            this.isRendered() ?
                view.setElement(fullSelector) :
                view.setElementInAdvance(fullSelector);
        }

        if (key in this.nestedViews) {
            this.clearView(key);
        }

        this.nestedViews[key] = view;

        view._parentView = this;
        view._updatePath(this._path, key);

        this._tryReady();
    }

    /**
     * Clear a nested view. Initiates removal of the nested view.
     *
     * @param {string} key A view key.
     */
    clearView(key) {
        if (key in this.nestedViews) {
            this.nestedViews[key].remove();

            delete this.nestedViews[key];
        }

        this._viewPromiseHash = this._viewPromiseHash || {};

        let previousPromise = this._viewPromiseHash[key];

        if (previousPromise) {
            previousPromise._isToCancel = true;
        }
    }

    /**
     * Removes a nested view for cases when it's supposed that this view can be re-used in future.
     *
     * @param {string} key A view key.
     */
    unchainView(key) {
        if (key in this.nestedViews) {
            this.nestedViews[key]._parentView = null;
            this.nestedViews[key].undelegateEvents();

            delete this.nestedViews[key];
        }
    }

    /**
     * Get a parent view.
     *
     * @return {Bull.View}
     */
    getParentView() {
        return this._parentView;
    }

    /**
     * Has a parent view.
     *
     * @return {boolean}
     */
    hasParentView() {
        return !!this._parentView;
    }

    /**
     * Add a condition for the view getting ready.
     *
     * @param {(Function|boolean)} condition A condition.
     */
    addReadyCondition(condition) {
        this._readyConditionList.push(condition);
    }

    /**
     * Wait for a nested view.
     *
     * @protected
     * @param {string} key A view key.
     */
    waitForView(key) {
        this._waitViewList.push(key);
    }

    /**
     * Makes the view to wait for a promise (if a Promise is passed as a parameter).
     * Adds a wait condition if true is passed. Removes the wait condition if false.
     *
     * @protected
     * @param {Promise|boolean} wait A wait-promise or true/false.
     */
    wait(wait) {
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

            let promise = new Promise(resolve => {
                // noinspection JSUnresolvedReference
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
    }

    /**
     * @private
     * @param {string} [cid]
     * @return {Element}
     */
    _createPlaceholderElement(cid) {
        let span = document.createElement('span');

        span.setAttribute('data-view-cid', cid || this.cid);

        return span;
    }

    /** @private */
    _replaceWithPlaceholderElement() {
        if (!this.element) {
            return;
        }

        let parent = this.element.parentElement;

        parent.replaceChild(this._createPlaceholderElement(), this.element);
    }

    /**
     * Remove the view and all nested tree. Removes an element from DOM. Triggers the 'remove' event.
     *
     * @public
     * @param {boolean} [dontEmpty] Skips emptying an element container.
     */
    remove(dontEmpty) {
        this.cancelRender();

        for (let key in this.nestedViews) {
            this.clearView(key);
        }

        this.trigger('remove');
        this.onRemove();
        this.off();

        if (!dontEmpty) {
            this.isComponent ?
                this._replaceWithPlaceholderElement() :
                this.$el.empty();
        }

        this.stopListening();
        this.undelegateEvents();

        if (this.model && typeof this.model.off === 'function') {
            this.model.off(null, null, this);
        }

        if (this.collection && typeof this.collection.off === 'function') {
            this.collection.off(null, null, this);
        }

        this._isRendered = false;
        this._isFullyRendered = false;
        this._isBeingRendered = false;
        this._isRemoved = true;

        return this;
    }

    /**
     * Called on view removal.
     *
     * @protected
     */
    onRemove() {}

    /** @private */
    _setElement(fullSelector) {
        const setElement = () => {
            this.element = this.$el[0];

            /**
             * @todo Remove.
             * @deprecated
             */
            this.el = this.element;
        }

        if (typeof fullSelector === 'string') {
            let parentView = this.getParentView();

            if (
                parentView &&
                parentView.isRendered() &&
                parentView.$el &&
                parentView.$el.length &&
                parentView.getSelector() &&
                fullSelector.indexOf(parentView.getSelector()) === 0
            ) {
                let subSelector = fullSelector.slice(parentView.getSelector().length);

                this.$el = $(subSelector, parentView.$el).eq(0);

                setElement();

                return;
            }
        }

        this.$el = $(fullSelector).eq(0);

        setElement();
    }

    /**
     * Propagate an event to nested views.
     *
     * @public
     * @param {...*} arguments
     */
    propagateEvent() {
        this.trigger.apply(this, arguments);

        for (let key in this.nestedViews) {
            let view = this.nestedViews[key];

            view.propagateEvent.apply(view, arguments);
        }
    }
}

Object.assign(View.prototype, Events);

const isEsClass = fn => {
    return typeof fn === 'function' &&
        Object.getOwnPropertyDescriptor(fn, 'prototype')?.writable === false;
};

View.extend = function (protoProps, staticProps) {
    let parent = this;

    let child;

    if (isEsClass(parent)) {
        let TemporaryHelperConstructor = function () {};

        child = function () {
            if (new.target) {
                // noinspection JSCheckFunctionSignatures
                let obj = Reflect.construct(parent, arguments, new.target);

                for (let prop of Object.getOwnPropertyNames(obj)) {
                    if (typeof this[prop] !== 'undefined') {
                        obj[prop] = this[prop];
                    }
                }

                return obj;
            }

            // noinspection JSCheckFunctionSignatures
            return Reflect.construct(parent, arguments, TemporaryHelperConstructor);
        };

        _.extend(child, parent, staticProps);

        // noinspection JSUnresolvedReference
        child.prototype = _.create(parent.prototype, protoProps);
        child.prototype.constructor = child;
        // noinspection JSUnresolvedReference
        child.__super__ = parent.prototype;
        child.prototype.__isEs = true;

        TemporaryHelperConstructor.prototype = child.prototype;

        return child;
    }

    child = function () {
        // noinspection JSUnresolvedReference
        if (parent.prototype.__isEs) {
            // noinspection JSCheckFunctionSignatures
            return Reflect.construct(parent, arguments, new.target);
        }

        // noinspection JSUnresolvedReference
        return parent.apply(this, arguments);
    };

    _.extend(child, parent, staticProps);

    // noinspection JSUnresolvedReference
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;
    // noinspection JSUnresolvedReference
    child.__super__ = parent.prototype;

    return child;
};

let delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
 * Extend the class.
 *
 * @name extend
 * @param {Object.<string, *>} proto Child prototype.
 * @return this
 * @static
 * @memberof Bull.View
 */


/**
 * A DOM element.
 *
 * @name $el
 * @type {jQuery}
 * @public
 * @memberof Bull.View#
 */

/**
 * Passed options.
 *
 * @name options
 * @type {Object.<string, *>}
 * @public
 * @memberof Bull.View#
 */

export default View;
