(function (Bull, Backbone, _) {

    Bull.View = Backbone.View.extend({

        /**
         * @property {String} Template name.
         */
        template: null,

        /**
         * @property {String} Layout name. Used if template is not specified to build template.
         */
        layout: null,

        /**
         * @property {String} Name of View. If template name is not defined it will be used to cache built template and layout. Otherwise they won't be cached. Name it unique.
         */
        name: null,

        /**
         * @property {Object} or {function} Data that will be passed into template.
         */
        data: null,

        /**
         * @property {bool} Not to use cache for layouts. Use it if layouts are dynamic.
         */
        noCache: false,

        /**
         * @property {bool} Not to rended view automatical when build view tree. Afterwards it can be rendered manually.
         */
        notToRender: false,

        /**
         * @property {String} Template itself.
         */
        _template: null,

        /**
         * @property {Object} Layout itself.
         */
        _layout: null,

        layoutData: null,

        isReady: false,

        /**
         * @property {Object} Definitions for nested views that should be automaticaly created. Example: {body: {view: 'Body', selector: '> .body'}}.
         */
        views: null,

        nestedViews: null,

        _nestedViewDefs: null,

        _factory: null,

        factory: null,

        _templator: null,

        _renderer: null,

        _layouter: null,

        _helper: null,

        _templateCompiled: null,

        _parentView: null,

        _path: '',

        _wait: false,

        expectedViews: null,

        optionsToPass: null,

        _nestedViewsFromLayoutLoaded: false,

        _readyConditions: null,

        _isRendered: false,

        _isFullyRendered: false,

        _isBeingRendered: false,

        _isRemoved: false,

        _isRenderCanceled: false,

        initialize: function (options) {
            this.options = options || {};

            this._factory = this.factory = this.options.factory || null;
            this._renderer = this.options.renderer || null;
            this._templator = this.options.templator || null;
            this._layouter = this.options.layouter || null;

            this._helper = this.options.helper || null;

            if ('noCache' in this.options) {
                this.noCache = this.options.noCache;
            }

            this.name = this.options.name || this.name;

            this.notToRender = ('notToRender' in this.options) ? this.options.notToRender : this.notToRender;

            this.data = this.options.data || this.data;

            this.nestedViews = {};
            this._nestedViewDefs = {};

            if (this.expectedViews == null) {
                this.expectedViews = [];
            }

            if (this._readyConditions == null) {
                this._readyConditions = [];
            }

            this.optionsToPass = this.options.optionsToPass || this.optionsToPass || [];

            var merge = function (target, source) {
                for (var prop in source) {
                    if (typeof target == 'object') {
                        if (prop in target) {
                            merge(target[prop], source[prop]);
                        } else {
                            target[prop] = source[prop];
                        }
                    }
                }
                return target;
            }

            if (this.views || this.options.views) {
                this.views = merge(this.options.views || {}, this.views || {});
            }

            this.init();
            this.setup();
            this.setupFinal();

            this.template = this.options.template || this.template;
            this.layout = this.options.layout || this.layout;
            this._layout = this.options._layout || this._layout;
            this.layoutData = this.options.layoutData || this.layoutData;

            if (this._template != null && this._templator.compilable) {
                this._templateCompiled = this._templator.compileTemplate(this._template);
            }

            if (this.options.el) {
                this.setElementInAdvance(this.options.el);
            }

            var _layout = this._getLayout();

            var loadNestedViews = function () {
                this._loadNestedViews(function () {
                    this._nestedViewsFromLayoutLoaded = true;
                    this._tryReady();
                }.bind(this));
            }.bind(this);

            if (this.layout != null || _layout !== null) {
                if (_layout === null) {
                    this._layouter.getLayout(this.layout, function (_layout) {
                        this._layout = _layout;
                        loadNestedViews();
                    }.bind(this));
                    return;
                }
                loadNestedViews();
                return;
            } else {
                if (this.views != null) {
                    loadNestedViews();
                    return;
                }
            }
            this._nestedViewsFromLayoutLoaded = true;

            this._tryReady();
        },

        /**
         * Init view. Empty method by default. Is run before #setup.
         */
        init: function () {},

        /**
         * Setup view. Empty method by default. Is run after #init.
         */
        setup: function () {},

        setupFinal: function () {},

        /**
         * Set view container element if doesn't exist yet. It will call setElement after render.
         */
        setElementInAdvance: function (el) {
            if (this._setElementInAdvancedInProcess) return;
            this._setElementInAdvancedInProcess = true;

            this.on("after:render-internal", function () {
                this.setElement(el);
                this._setElementInAdvancedInProcess = false;
            }.bind(this));
        },

        getSelector: function () {
            return this.options.el || null;
        },

        setSelector: function (selector) {
            this.options.el = selector;
        },

        /**
         * Checks whether view has been already rendered.
         * @return {Bool}
         */
        isRendered: function () {
            return this._isRendered;
        },

        /**
         * Checks whether view has been fully rendered (afterRender has been executed).
         * @return {Bool}
         */
        isFullyRendered: function () {
            return this._isFullyRendered
        },

        isBeingRendered: function () {
            return this._isBeingRendered;
        },

        isRemoved: function () {
            return this._isRemoved;
        },

        /**
         * Get HTML of view but don't render it.
         */
        getHtml: function (callback) {
            this._getHtml(callback);
        },

        cancelRender: function () {
            if (this.isBeingRendered()) {
                this._isRenderCanceled = true;
            }
        },

        uncancelRender: function () {
            this._isRenderCanceled = false;
        },

        /**
         * Render view.
         */
        render: function (callback) {
            this._getHtml(function (html) {
                if (this._isRenderCanceled) {
                    this._isRenderCanceled = false;
                    this._isBeingRendered = false;
                    return;
                }
                if (this.$el.size()) {
                    this.$el.html(html);
                } else {
                    if (this.options.el) {
                       this.setElement(this.options.el);
                    }
                    this.$el.html(html);
                }
                this._afterRender();
                if (typeof callback === 'function') {
                    callback();
                }
            }.bind(this));

        },

        _afterRender: function () {
            this._isBeingRendered = false;
            this._isRendered = true;
            this.trigger("after:render-internal", this);
            for (var key in this.nestedViews) {
                var nestedView = this.nestedViews[key];
                if (!nestedView.notToRender) {
                    nestedView._afterRender();
                }
            }
            this.afterRender();
            this.trigger("after:render", this);
            this._isFullyRendered = true;
        },

        /**
         * Executed after render. Empty method by default.
         */
        afterRender: function () {},

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
            for (var i in this.expectedViews) {
                if (!this.hasView(this.expectedViews[i])) {
                    return;
                }
            }
            for (var i in this._readyConditions) {
                if (typeof this._readyConditions[i] === 'function') {
                    if (!this._readyConditions[i]()) {
                        return;
                    }
                } else {
                    if (!this._readyConditions) {
                        return;
                    }
                }
            }

            this._makeReady();
        },

        /**
         * Run checking for view is ready.
         */
        tryReady: function () {
            this._tryReady();
        },

        _makeReady: function () {
            this.isReady = true;
            this.trigger('ready');
            if (typeof this.options.onReady === 'function') {
                this.options.onReady(this);
            }
        },

        _addDefinedNestedViewDefs: function (list) {
            for (var name in this.views) {
                var o = _.clone(this.views[name]);
                o.name = name;
                list.push(o);
                this._nestedViewDefs[name] = o;
            }
            return list
        },

        _getNestedViewsFromLayout: function () {
            var nestedViewDefs = this._layouter.findNestedViews(this._getLayoutName(), this._getLayout() || null, this.noCache);

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


        _loadNestedViews: function (callback) {
            var nestedViewDefs = [];
            if (this._layout != null) {
                nestedViewDefs = this._getNestedViewsFromLayout();
            }

            this._addDefinedNestedViewDefs(nestedViewDefs);

            var count = nestedViewDefs.length;
            var loaded = 0;

            var tryReady = function () {
                if (loaded == count) {
                    callback();
                    return true
                }
            };

            tryReady();
            nestedViewDefs.forEach(function (def, i) {
                var key = nestedViewDefs[i].name;
                var viewName = this._factory.defaultViewName;
                if ('view' in nestedViewDefs[i]) {
                    viewName = nestedViewDefs[i].view;
                }

                if (viewName === false) {
                    loaded++;
                    tryReady();
                } else {
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
                    this._factory.create(viewName, options, function (view) {
                        if ('notToRender' in nestedViewDefs[i]) {
                            view.notToRender = nestedViewDefs[i].notToRender;
                        }
                        this.setView(key, view);
                        loaded++;
                        tryReady();
                    }.bind(this));
                }
            }, this);
        },

        _getData: function () {
            if (typeof this.data === 'function') {
                return this.data();
            }
            return this.data;
        },

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

        _getNestedViewsHtmlList: function (callback) {
            var data = {};
            var nestedViewsArray = this._getNestedViewsAsArray();


            var loaded = 0;
            var count = nestedViewsArray.length;

            var tryReady = function () {
                if (loaded == count) {
                    callback(data);
                    return true
                }
            };

            tryReady();
            nestedViewsArray.forEach(function (d, i) {
                var key = nestedViewsArray[i].key;
                var view = nestedViewsArray[i].view;

                if (!view.notToRender) {
                    view.getHtml(function (html) {
                        data[key] = html;
                        loaded++;
                        tryReady();
                    });
                } else {
                    loaded++;
                    tryReady();
                }
            }, this);
        },

        handleDataBeforeRender: function (data) {},

        _getHtml: function (callback) {
            this._isBeingRendered = true;
            this.trigger("render", this);
            this._getNestedViewsHtmlList(function (nestedViewsHtmlList) {
                var data = _.extend(this._getData() || {}, nestedViewsHtmlList);
                if (this.collection || null) {
                    data.collection = this.collection;
                }
                if (this.model || null) {
                    data.model = this.model;
                }
                this.handleDataBeforeRender(data);
                this._getTemplate(function (template) {
                    var html = this._renderer.render(template, data);
                    callback(html);
                }.bind(this));
            }.bind(this));
        },

        _getTemplateName: function () {
            return this.template || null;
        },

        _getLayoutName: function () {
            return this.layout || this.name || null;
        },

        _getLayoutData: function () {
            return this.layoutData;
        },

        _getLayout: function () {
            if (typeof this._layout === 'function') {
                return this._layout();
            }
            return this._layout;
        },

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
                } else {
                    if (layoutName) {
                        templateName = 'built-' + layoutName;
                    } else {
                        templateName = null;
                    }
                }
                layoutOptions = {
                    name: layoutName,
                    data: this._getLayoutData(),
                    layout: this._getLayout(),
                }
            }

            this._templator.getTemplate(templateName, layoutOptions, noCache, callback);
        },

        _updatePath: function (parentPath, viewKey) {
            this._path = parentPath + '/' + viewKey;
            for (var key in this.nestedViews) {
                this.nestedViews[key]._updatePath(this._path, key);
            }
        },

        _getSelectorForNestedView: function (key) {
            var el = false;

            if (key in this._nestedViewDefs) {
                if ('id' in this._nestedViewDefs[key]) {
                    el = '#' + this._nestedViewDefs[key].id;
                } else {
                    if ('el' in this._nestedViewDefs[key]) {
                        el = this._nestedViewDefs[key].el;
                    } else if ('selector' in this._nestedViewDefs[key]) {
                        var currentEl = this.getSelector();
                        if (currentEl) {
                            el = currentEl + ' ' + this._nestedViewDefs[key].selector;
                        }
                    } else {
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
         * Whether this view has nested view.
         * @param {String} key
         * @return {Bool}
         */
        hasView: function (key) {
            if (key in this.nestedViews) {
                return true;
            }
            return false;
        },

        /**
         * Get nested view.
         * @param {String} key
         * @return {Bull.View}
         */
        getView: function (key) {
            if (key in this.nestedViews) {
                return this.nestedViews[key];
            }
        },

        /**
         * Create nested view. The important method.
         * @param {String} key Key.
         * @param {String} viewName View name.
         * @param {Object} options View options.
         * @param {Function} callback Callback function. Will be invoiked once nested view is ready (loaded).
         * @param {Bool} wait True be default. Set false if no need parent view wait for nested view loaded.
         */
        createView: function (key, viewName, options, callback, wait) {
            wait = (typeof wait === 'undefined') ? true : wait;
            var context = this;
            if (wait) {
                this.waitForView(key);
            }
            options = options || {};
            if (!options.el) {
                options.el = this.getSelector() + ' [data-view="'+key+'"]';
            }
            this._factory.create(viewName, options, function (view) {
                if (this._isRendered || options.setViewBeforeCallback) {
                    this.setView(key, view);
                }
                if (typeof callback === 'function') {
                    callback.call(context, view);
                }
                if (!this._isRendered && !options.setViewBeforeCallback) {
                    this.setView(key, view);
                }
            }.bind(this));
        },

        /**
         * Set nested view.
         * @param {String} key
         * @param {Bull.View} view
         * @param {String} el Selector for view container.
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
         * Clear nested view.
         * @param {String} key
         */
        clearView: function (key) {
            if (key in this.nestedViews) {
                this.nestedViews[key].remove();
                delete this.nestedViews[key];
            }
        },

        /**
         * Removes nested view but supposed that this view can be re-used in future.
         * @param {String} key
         */
        unchainView: function (key) {
            if (key in this.nestedViews) {
                this.nestedViews[key]._parentView = null;
                this.nestedViews[key].undelegateEvents();
                delete this.nestedViews[key];
            }
        },

        /**
         * Get parent view.
         * @return {Bull.View}
         */
        getParentView: function () {
            return this._parentView;
        },

        /**
         * Has parent view.
         * @return {bool}
         */
        hasParentView: function () {
            return !!this._parentView;
        },

        /**
         * Add condition for view getting ready.
         * @param {Function} or {Bool}
         */
        addReadyCondition: function (condition) {
            this._readyConditions.push(condition);
        },

        /**
         * Wait for nested view.
         * @param {String} key
         */
        waitForView: function (key) {
            this.expectedViews.push(key);
        },

        /**
         * Add wait condition is true is passed. Remove wait condition if false.
         * @param {Bool}
         */
        wait: function (wait) {
            if (wait) {
                this._wait = true;
            } else {
                this._wait = false;
                this._tryReady();
            }
        },

        /**
         * Remove view and all nested tree. Removes contents of el. Triggers 'remove' event.
         */
        remove: function (dontEmpty) {
            for (var key in this.nestedViews) {
                this.clearView(key);
            }
            this.trigger('remove');
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

        _setElement: function (el) {
            if (typeof el === 'string') {
                var parentView = this.getParentView();
                if (parentView && parentView.isRendered()) {
                    if (parentView.$el && parentView.$el.size() && parentView.getSelector()) {
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
        }

    });

}).call(this, Bull, Backbone, _);
