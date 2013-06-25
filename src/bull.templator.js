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
				if (!noCache && name) {
					this._cacheTemplate(name, template);
				}				
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
		
		_buildTemplate: function (layoutDefs, data, callback) {
			var layoutType = layoutDefs.type || 'default';
			
			var proceed = function (layoutTemplate) {
				var injection = _.extend(layoutDefs, data || {});
				delete injection['type'];
				callback(_.template(layoutTemplate, injection));
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
