(function (Bull, Backbone, _) {

	Bull.View = Backbone.View.extend({
	
		template: null,
		
		layout: null,		
	
		data: null,
		
		layoutData: null,
		
		nestedViews: null,
		
		_nestedViewDefs: null,
		
		_factory: null,
		
		_templator: null,
		
		renderer: null,
		
		_layouter: null,
	
		_helper: null,
		
		_template: null,
		
		_templateCompiled: null,
		
		_layout: null,
		
		_parentView: null,
		
		_path: 'root',
		
		notToRender: false,
		
		noCache: false,
		
		_elResrved: null,
	
		initialize: function () {				
			this._factory = this.options.factory || null;			
			this._renderer = this.options.renderer || null;
			this._templator = this.options.templator || null;
			this._layouter = this.options.layouter || null;			
			
			this._helper = this.options.helper || null;
			
			this.noCache = this.options.noCache || this.noCache;
			
			this.nestedViews = {};
			this._nestedViewDefs = {};
			
			this.setup();
			
			this.template = this.options.template || this.template;			
			this.layout = this.options.layout || this.layout;
			this._layout = this.options._layout || this._layout;
			
			if (this.layout != null || this._getLayout() != null) {				
				this._loadNestedViews();
			}			
			
			if (this._template != null && this._templator.compilable) {
				this._templateCompiled = this._templator.compileTemplate(this._template);
			}
			
			if (this.options.el || null) {
				this.setElementInAdvance(this.options.el);
			}			
		},
		
		setup: function () {},
		
		setElementInAdvance: function (el) {
			this.on("after:render", function () {
				if (!this.el) {
					this.setElement(el);
				}
			}.bind(this));
		},
		
		getHtml: function () {
			return this._getHtml();
		},
		
		render: function () {		
			this.trigger("before:render", this);
			var html = this._getHtml();
			this.trigger("render", this);
			if (this.$el) {			
				this.$el.html(html);
			} else {
				this.el.innerHTML = html;
			}
			this._afterRender();			
		},
		
		_afterRender: function () {
			this.trigger("after:render", this);		
			for (var key in this.nestedViews) {				
				this.nestedViews[key]._afterRender();
			}						
		},
		
		_loadNestedViews: function () {
			if (this._layouter == null) {
				return;
			}
			var nestedViewDefs = this._layouter.findNestedViews(this._getLayoutName(), this._getLayout() || undefined);

			if (Object.prototype.toString.call(nestedViewDefs) !== '[object Array]') {
				throw new Error("Bad layout. It should be an Array.");
			}
			
			for (var i in nestedViewDefs) {	
				var key = nestedViewDefs[i].name;	

				this._nestedViewDefs[key] = nestedViewDefs[i];				
				
				if ('view' in nestedViewDefs[i] && nestedViewDefs[i].view === true && !('layout' in nestedViewDefs[i])) {
					continue;
				}
				
				var viewName = this._factory.defaultViewName;
				
				if ('view' in nestedViewDefs[i]) {
					viewName = nestedViewDefs[i].view;
				}
				var options = {};
				if ('layout' in nestedViewDefs[i]) {
					options.layout = nestedViewDefs[i].layout;
				} 
				if ('template' in nestedViewDefs[i]) {
					options.template = nestedViewDefs[i].template;
				}
				
				if ('options' in nestedViewDefs[i]) {
					options = _.extend(options, nestedViewDefs[i].options);
				}
				if (this.model) {					
					options.model = this.model;
				}
				if (this.collection) {
					options.collection = this.collection;
				}
							 
				var view = this._factory.create(viewName, options);
				
				if ('notToRender' in nestedViewDefs[i]) {
					view.notToRender = nestedViewDefs[i].notToRender;
				}
				
				this.setView(key, view);
			}					
		},
		
		_getData: function () {
			if (typeof this.data === 'function') {
				return this.data();
			}
			return this.data;
		},
		
		_getNestedViewsHtmlList: function () {
			var data = {};
			for (var key in this.nestedViews) {
				var view = this.nestedViews[key];
				if (!view.notToRender) {
					data[key] = view.getHtml();
				}
			}
			return data;			
		},
		
		_getHtml: function () {	
			var html = this._renderer.render(this._getTemplate(), _.extend(this._getData() || {}, this._getNestedViewsHtmlList()));
			return html;
		},
		
		_getTemplateName: function () {
			return this.template || null;
		},
		
		_getLayoutName: function () {
			if (this.layout == null && this._getLayout() != null) {
				// TODO find a better way to generate name
				return JSON.stringify(this._getLayout());
			}
			return this.layout;
		},
		
		_getLayoutData: function () {
			return this.layoutData;
		},
		
		_getLayout: function () {
			if (typeof this._layout === 'function') {
				return this._layout();
			}
			return this._layout;
		},
		
		_getTemplate: function () {		
			if (this._templator.compilable && this._templateCompiled !== null) {
				return this._templateCompiled;
			} 
		
			var _template = this._template || null;											
			if (_template == null) {
				var templateName = this._getTemplateName();
				
				var noCache = false;
				var layoutOptions = {};
				if (!templateName) {
					var layoutName = templateName = this._getLayoutName();
					layoutOptions = {
						name: layoutName,
						data: this._getLayoutData(),
						layout: this._getLayout(),
					}
					var noCache = this.noCache;					
				}
				
				_template = this._templator.getTemplate(templateName, layoutOptions, noCache);
			}	
			return _template;
		},
		
		_updatePath: function (parentPath, viewKey) {
			this._path = parentPath + '/' + viewKey;
			for (var key in this.nestedViews) {
				this.nestedViews[key]._updatePath(this._path, key);
			}
		},
		
		_getSelectorForNestedView: function (key) {
			var el = false;
			if (key in this._nestedViewDefs) {								
				if ('id' in this._nestedViewDefs[key]) {
					el = '#' + this._nestedViewDefs[key].id;
				} else {
					if ('selector' in this._nestedViewDefs[key]) {
						el = this._nestedViewDefs[key].selector;
					}
				}
			}
			return el;
		},
		
		getView: function (key) {
			if (key in this.nestedViews) {
				return this.nestedViews[key];
			}
		},		
		
		setView: function (key, view, el) {
			var el = el || this._getSelectorForNestedView(key) || false;
			if (el) {
				view.setElementInAdvance(el);
				view.setElement(el);
			}
			
			if (key in this.nestedViews) {
				this.clearView(key);
			}
			this.nestedViews[key] = view;			
			view._parentView = this;
			view._updatePath(this._path, key);	
			
			if (!(key in this)) {
				this[key] = view;
			}			
		},
		
		clearView: function (key) {
			if (key in this.nestedViews) {
				this.nestedViews[key].remove();
				delete this.nestedViews[key];
			}			
		},
		
		getParentView: function () {
			return this._parentView;
		},
		
		remove: function () {
			for (var key in this.nestedView) {
				this.clearView(key);
			}
			this.trigger('remove');
			this.off();	
			Backbone.View.prototype.remove.apply(this, arguments);		
		},
	});	
	
}).call(this, Bull, Backbone, _);
