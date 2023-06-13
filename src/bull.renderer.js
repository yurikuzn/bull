
/**
 * @class Renderer
 * @alias Bull.Renderer
 */
const Renderer = function (options) {
    options = options || {};

    this._render = options.method || this._render;
};

_.extend(Renderer.prototype, {

    _render: function (template, data) {
        return template(data, {allowProtoPropertiesByDefault: true});
    },

    render: function (template, data) {
        return this._render.call(this, template, data);
    },
});

export default Renderer;
