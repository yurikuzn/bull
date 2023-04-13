(function (Bull, _) {

    /**
     * @class Bull.Renderer
     */
    Bull.Renderer = function (options) {
        options = options || {};

        this._render = options.method || this._render;
    };

    _.extend(Bull.Renderer.prototype, {

        _render: function (template, data) {
            return template(data, {allowProtoPropertiesByDefault: true});
        },

        render: function (template, data) {
            return this._render.call(this, template, data);
        },
    });

}).call(this, Bull, _);
