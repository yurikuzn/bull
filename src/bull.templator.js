(function (Bull, _, Handlebars) {

	Bull.Templator = function (data) {	
		var data = data || {};	
		this._templates = {};
		this._layoutTemplates = {};		
		this._cacher = data.cacher || null;
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
		
		_cacher: null,
		
		_loader: null,
		
		_layouter: null,
		
		addTemplate: function (name, template) {
			this._templates[name] = template;			
		},		
	
		getTemplate: function (name, layoutOptions, noCache) {
			var layoutOptions = layoutOptions || {};
			var template = null;
			
			if (!layoutOptions.name && !layoutOptions.layout && !name) {
				throw new Error("Can not get template. Not enough data passed.");
			}
			
			if (!noCache && name) {
				template = this._getCachedTemplate(name);
			}
			
			if (!template) {			
				if (!layoutOptions.name && !layoutOptions.layout) {					
					template = this._loader.load('template', name);					
				} else {								
					var layout = layoutOptions.layout || this._layouter.getLayout(layoutOptions.name);										
					if (layout == null) {
						throw new Error("Could not get layout '" + layoutOptions.name + "'.");
					}										
					template = this._buildTemplate(layout, layoutOptions.data);
				}
								
				if (this.compilable) {
					template = this.compileTemplate(template);
				}
				
				if (!noCache && name) {
					this._cacheTemplate(name, template);
				}				
			}

			return template;		
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
			if (this._cacher != null) {
				return this._cacher.get('template', templateName);
			}
			return false;
		},
		
		_cacheTemplate: function (templateName, template) {
			this._templates[templateName] = template;
			if (this._cacher != null) {
				this._cacher.set('template', templateName, template);
			}
		},
		
		_getCachedLayoutTemplate: function (layoutType) {
			if (layoutType in this._layoutTemplates) {
				return this._layoutTemplates[layoutType];
			}
			if (this._cacher != null) {
				return this._cacher.get('layoutTemplate', layoutType);
			}
			return false;
		},
		
		_cacheLayoutTemplate: function (layoutType, layoutTemplate) {
			this._layoutTemplates[layoutType] = layoutTemplate;
			if (this._cacher != null) {
				this._cacher.set('layoutTemplate', layoutType, layoutTemplate);
			}
		},		
		
		_buildTemplate: function (layoutDefs, data) {
			var layoutType = layoutDefs.type || 'default';
			var layoutTemplate = this._getCachedLayoutTemplate(layoutType);
			if (!layoutTemplate) {
				layoutTemplate = this._loader.load('layoutTemplate', layoutType);
				this._cacheLayoutTemplate(layoutType, layoutTemplate);				
			}
					
			var injection = _.extend(layoutDefs, data || {});
			delete injection['type'];
			return _.template(layoutTemplate, injection);
		},
	});
	
}).call(this, Bull, _, Handlebars);
