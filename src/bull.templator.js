
import _ from 'underscore';
import Handlebars from 'handlebars';

/**
 * @alias Bull.Templator
 */
class Templator {

    /**
     * @param {{
     *   loader?: Loader,
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

    /**
     * @param {string} [name]
     * @param {{
     *     layout?: Object,
     *     data?: Object.<string, *>
     * }} [layoutOptions]
     * @param callback
     */
    getTemplate(name, layoutOptions,  callback) {
        layoutOptions = layoutOptions || {};

        if (!layoutOptions.layout && !name) {
            throw new Error(`Can not get template. Not enough data passed.`);
        }

        if (name) {
            let template = this._getCachedTemplate(name);

            if (template) {
                callback(template);

                return;
            }
        }

        let then = (template) => {
            if (this.compilable) {
                template = this.compileTemplate(template);
            }

            this._templates[name] = template;

            callback(template);
        };

        if (layoutOptions.layout) {
            this._buildTemplate(layoutOptions.layout, layoutOptions.data, then);

            return;
        }

        this._loader.load('template', name, then);
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

        if (layoutTemplate) {
            proceed(layoutTemplate);

            return;
        }

        this._loader.load('layoutTemplate', layoutType, layoutTemplate => {
            this._cacheLayoutTemplate(layoutType, layoutTemplate);

            proceed(layoutTemplate);
        });
    }
}

export default Templator;
