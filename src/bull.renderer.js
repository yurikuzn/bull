(function (Bull, _) {

	Bull.Renderer = function (options) {
		var options = options || {};		
		this._render = options.method || this._render;		
	};
	
	_.extend(Bull.Renderer.prototype, {
	
		_render: function (template, data) {
			return template(data);
		},

		render: function (template, data) {
			return this._render.call(this, template, data);
		},
	});
	
}).call(this, Bull, _);
