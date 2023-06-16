
/**
 * @alias Bull.Renderer
 */
class Renderer {

    constructor(options) {
        options = options || {};

        this._render = options.method || this._render;
    }

    render(template, data) {
        return this._render.call(this, template, data);
    }

    _render(template, data) {
        return template(data, {allowProtoPropertiesByDefault: true});
    }
}

export default Renderer;
