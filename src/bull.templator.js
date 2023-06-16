
/**
 * @alias Bull.Templator
 */
class Templator {

    /**
     * @param {{
     *   loader: Loader,
     *   layouter: Layouter,
     * }|null} data
     */
    constructor(data) {
        data = data || {};

        this._templates = {};
        this._layoutTemplates = {};

        /**
         * @type {Loader|null}
         * @private
         */
        this._loader = data.loader || null;
        /**
         * @type {Layouter|null}
         * @private
         */
        this._layouter = data.layouter || null;

        if ('compilable' in data) {
            this.compilable = data.compilable;
        }
    }

    compilable = true

    _templates = null
    _layoutTemplates = null

    addTemplate(name, template) {
        this._templates[name] = template;
    }

    getTemplate(name, layoutOptions, noCache, callback) {
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
    }

    compileTemplate(template) {
        if (typeof Handlebars !== 'undefined') {
            return Handlebars.compile(template);
        }

        return template;
    }

    _getCachedTemplate(templateName) {
        if (templateName in this._templates) {
            return this._templates[templateName];
        }

        return false;
    }

    _getCachedLayoutTemplate(layoutType) {
        if (layoutType in this._layoutTemplates) {
            return this._layoutTemplates[layoutType];
        }

        return false;
    }

    _cacheLayoutTemplate(layoutType, layoutTemplate) {
        this._layoutTemplates[layoutType] = layoutTemplate;
    }

    _buildTemplate(layoutDefs, data, callback) {
        let layoutType = layoutDefs.type || 'default';

        const proceed = layoutTemplate => {
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
    }
}

export default Templator;
