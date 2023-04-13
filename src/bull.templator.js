(function (Bull, _, Handlebars) {

    /**
     * @class Bull.Templator
     * @param {{
     *   loader: Bull.Loader,
     *   layouter: Bull.Layouter,
     * }|null} data
     */
    Bull.Templator = function (data) {
        data = data || {};

        this._templates = {};
        this._layoutTemplates = {};

        /**
         * @type {Bull.Loader|null}
         * @private
         */
        this._loader = data.loader || null;
        /**
         * @type {Bull.Layouter|null}
         * @private
         */
        this._layouter = data.layouter || null;

        if ('compilable' in data) {
            this.compilable = data.compilable;
        }
    };

    _.extend(Bull.Templator.prototype, /** @lends Bull.Templator.prototype */{

        compilable: true,

        _templates: null,
        _layoutTemplates: null,

        addTemplate: function (name, template) {
            this._templates[name] = template;
        },

        getTemplate: function (name, layoutOptions, noCache, callback) {
            layoutOptions = layoutOptions || {};

            let template = null;

            if (!layoutOptions.name && !layoutOptions.layout && !name) {
                throw new Error("Can not get template. Not enough data passed.");
            }

            if (!noCache && name) {
                template = this._getCachedTemplate(name);

                if (template) {
                    callback(template);

                    return;
                }
            }

            let layout = layoutOptions.layout || null;

            let then = (template) => {
                if (this.compilable) {
                    template = this.compileTemplate(template);
                }

                this._templates[name] = template;

                callback(template);
            };

            let proceedWithLayout = (layout) => {
                if (layout == null) {
                    throw new Error("Could not get layout '" + layoutOptions.name + "'.");
                }

                this._buildTemplate(layout, layoutOptions.data, then);
            };

            if (!template) {
                if (!layoutOptions.name && !layoutOptions.layout) {
                    this._loader.load('template', name, then);
                }
                else {
                    if (!layout) {
                        this._layouter.getLayout(layoutOptions.name, proceedWithLayout);
                    } else {
                        proceedWithLayout(layout);
                    }
                }
            }
        },

        compileTemplate: function (template) {
            if (typeof Handlebars !== 'undefined') {
                return Handlebars.compile(template);
            }

            return template;
        },

        _getCachedTemplate: function (templateName) {
            if (templateName in this._templates) {
                return this._templates[templateName];
            }

            return false;
        },


        _getCachedLayoutTemplate: function (layoutType) {
            if (layoutType in this._layoutTemplates) {
                return this._layoutTemplates[layoutType];
            }

            return false;
        },

        _cacheLayoutTemplate: function (layoutType, layoutTemplate) {
            this._layoutTemplates[layoutType] = layoutTemplate;
        },

        _buildTemplate: function (layoutDefs, data, callback) {
            let layoutType = layoutDefs.type || 'default';

            var proceed = (layoutTemplate) => {
                let injection = _.extend(layoutDefs, data || {});
                let template = _.template(layoutTemplate, injection);

                if (typeof template === 'function') {
                    template = template(injection);
                }

                callback(template);
            };

            let layoutTemplate = this._getCachedLayoutTemplate(layoutType);

            if (!layoutTemplate) {
                this._loader.load('layoutTemplate', layoutType, (layoutTemplate) => {
                    this._cacheLayoutTemplate(layoutType, layoutTemplate);

                    proceed(layoutTemplate);
                });

                return;
            }

            proceed(layoutTemplate);
        },
    });

}).call(this, Bull, _, Handlebars);
