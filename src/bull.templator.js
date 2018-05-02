(function (Bull, _, Handlebars) {

    Bull.Templator = function (data) {
        var data = data || {};
        this._templates = {};
        this._layoutTemplates = {};
        this._loader = data.loader || null;
        this._layouter = data.layouter || null;
        if ('compilable' in data) {
            this.compilable = data.compilable;
        }
    };

    _.extend(Bull.Templator.prototype, {

        compilable: true,

        _templates: null,

        _layoutTemplates: null,

        _loader: null,

        _layouter: null,

        addTemplate: function (name, template) {
            this._templates[name] = template;
        },

        getTemplate: function (name, layoutOptions, noCache, callback) {
            var layoutOptions = layoutOptions || {};
            var template = null;

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

            var layout = layoutOptions.layout || null;

            var then = function (template) {
                if (this.compilable) {
                    template = this.compileTemplate(template);
                }
                this._templates[name] = template;
                callback(template);
            }.bind(this);

            var proceedWithLayout = function (layout) {
                if (layout == null) {
                    throw new Error("Could not get layout '" + layoutOptions.name + "'.");
                }
                this._buildTemplate(layout, layoutOptions.data, then);
            }.bind(this);

            if (!template) {
                if (!layoutOptions.name && !layoutOptions.layout) {
                    this._loader.load('template', name, then);
                } else {
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
            var layoutType = layoutDefs.type || 'default';

            var proceed = function (layoutTemplate) {
                var injection = _.extend(layoutDefs, data || {});
                var template = _.template(layoutTemplate, injection);
                if (typeof template === 'function') {
                    template = template(injection);
                }
                callback(template);
            }.bind(this);

            var layoutTemplate = this._getCachedLayoutTemplate(layoutType);
            if (!layoutTemplate) {
                this._loader.load('layoutTemplate', layoutType, function (layoutTemplate) {
                    this._cacheLayoutTemplate(layoutType, layoutTemplate);
                    proceed(layoutTemplate);
                }.bind(this));
                return;
            }
            proceed(layoutTemplate);
        },
    });

}).call(this, Bull, _, Handlebars);
