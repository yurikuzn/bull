(function (Bull, Backbone, _) {

	Bull.View = Backbone.View.extend({
	
		/**
		 * @property {string} Template name.
		 */
		template: null,
		
		/**
		 * @property {string} Layout name. Used if template is not specified to build template.
		 */
		layout: null,
		
		/**
		 * @property {string} Name of View. If template name is not defined it will be used to cache built template and layout. Otherwise they won't be cached. Name it unique.
		 */
		name: null,		
	
		/**
		 * @property {Object} or {function} Data that will be passed into template.
		 */
		data: null,
		
		/**
		 * @property {bool} Not to use cache for layouts. Use it if layouts are dynamic.
		 */
		noCache: false,
		
		/**
		 * @property {bool} Not to rended view automatical when build view tree. Afterwards it can be rendered manually.
		 */
		notToRender: false,
		
		/**
		 * @property {string} Template itself.
		 */
		_template: null,
		
		/**
		 * @property {Object} Layout itself.
		 */
		_layout: null,
		
		layoutData: null,		
		
		isReady: false,
		
		/**
		 * @property {Object} Definitions for nested views that should be automaticaly created. Example: {body: {view: 'Body', selector: '> .body'}}.
		 */
		views: null,		

		nestedViews: null,
		
		_nestedViewDefs: null,
		
		_factory: null,
		
		factory: null,
		
		_templator: null,
		
		_renderer: null,
		
		_layouter: null,
	
		_helper: null,
				
		_templateCompiled: null,

		_parentView: null,
		
		_path: '',
		
		_wait: false,
		
		expectedViews: null,
		
		optionsToPass: null,
		
		_nestedViewsFromLayoutLoaded: false,
		
		_readyConditions: null,	
		
		_rendered: false,
	
		initialize: function () {				
			this._factory = this.factory = this.options.factory || null;			
			this._renderer = this.options.renderer || null;
			this._templator = this.options.templator || null;
			this._layouter = this.options.layouter || null;			
			
			this._helper = this.options.helper || null;
			
			this.noCache = this.options.noCache || this.noCache;
			
			this.name = this.options.name || this.name;
			
			this.nestedViews = {};
			this._nestedViewDefs = {};
			
			if (this.expectedViews == null) {
				this.expectedViews = [];
			}
			
			if (this._readyConditions == null) {
				this._readyConditions = [];
			}
			
			this.optionsToPass = this.options.optionsToPass || this.optionsToPass || [];
			
			this.once('after:render', function () {
				this._rendered = true;
			}, this);
			
			var merge = function (target, source) {
				for (var prop in source) {
					if (typeof target == 'object') { 
						if (prop in target) {
							merge(target[prop], source[prop]);
						} else {
							target[prop] = source[prop];
						}
					}
				}
				return target;
			}
			
			if (this.views || this.options.views) {		
				this.views = merge(this.options.views || {}, this.views || {});			
			}	
		
			this.init();
			this.setup();
			
			this.template = this.options.template || this.template;			
			this.layout = this.options.layout || this.layout;
			this._layout = this.options._layout || this._layout;
			this.layoutData = this.options.layoutData || this.layoutData;		
			
			if (this._template != null && this._templator.compilable) {
				this._templateCompiled = this._templator.compileTemplate(this._template);
			}
			
			if (this.options.el || null) {
				this.setElementInAdvance(this.options.el);
			}
			
			var _layout = this._getLayout();			
			
			var loadNestedViews = function () {				
				this._loadNestedViews(function () {
					this._nestedViewsFromLayoutLoaded = true;					
					this._tryReady();				
				}.bind(this));				
			}.bind(this);
			
			if (this.layout != null || _layout !== null) {					
				if (_layout === null) {					
					this._layouter.getLayout(this.layout, function (_layout) {			
						this._layout = _layout;						
						loadNestedViews();
					}.bind(this));
					return;
				}
				loadNestedViews();
				return;
			} else {
				if (this.views != null) {
					loadNestedViews();
					return;
				}
			}
			this._nestedViewsFromLayoutLoaded = true;
								
			this._tryReady();
		},
		
		/**
		 * Init view. Empty function by default.
		 */
		init: function () {},
		
		/**
		 * Setup view. Empty function by default.
		 */
		setup: function () {},				
		
		/**
		 * Set view container element if doesn't exist yet. It will call setElement after render.
		 */
		setElementInAdvance: function (el) {
			this.on("after:render-internal", function () {
				this.setElement(el);
			}.bind(this));
		},
		
		/**
		 * Check whether view has been already rendered.
		 * @return {Bool}
		 */
		isRendered: function () {
			return this._rendered;
		},
		
		/**
		 * Get HTML of view but don't render it.
		 */
		getHtml: function (callback) {
			this._getHtml(callback);
		},
		
		/**
		 * Render view.
		 */
		render: function (callback) {		
			this.trigger("before:render", this);
			this._getHtml(function (html) {
				this.trigger("render", this);
				if (this.$el) {			
					this.$el.html(html);
				} else {
					this.el.innerHTML = html;
				}
				this._afterRender();
				if (typeof callback === 'function') {
					callback();
				}
			}.bind(this));
			
		},				
		
		_afterRender: function () {
			this.trigger("after:render-internal", this);
			this.trigger("after:render", this);
			this.afterRender();	
			for (var key in this.nestedViews) {				
				this.nestedViews[key]._afterRender();
			}						
		},
		
		afterRender: function () {},
		
		_tryReady: function () {
			if (this.isReady) {
				return;
			}
			if (this._wait) {				
				return;
			}
			if (!this._nestedViewsFromLayoutLoaded) {				
				return;
			}	
			for (var i in this.expectedViews) {
				if (!this.hasView(this.expectedViews[i])) {					
					return; 
				}
			}			
			for (var i in this._readyConditions) {
				if (typeof this._readyConditions[i] === 'function') {
					if (!this._readyConditions[i]()) {
						return;
					}
				} else {
					if (!this._readyConditions) {
						return;
					}
				}
			}

			this._makeReady();
		},
		
		tryReady: function () {
			this._tryReady();
		},
		
		_makeReady: function () {
			this.isReady = true;
			this.trigger('ready');
			if (typeof this.options.onReady === 'function') {		
				this.options.onReady(this);
			}
		},
		
		asyncLoop: function (o) {
			var i = -1;
			var loop = function () {
				i++;
				if (i == o.length){
					o.callback();
					return;
				}
				o.functionToLoop(loop, i);
			} 
			loop();
		},
		
		_createViews: function () {
			var views = this.options.views || [];
			views.forEach(function (o, name) {			
				var options = _.clone(o);
				delete options['view'];
				options.model = this.model;
				options.collection = this.collection;
				
				for (var i in this.optionsToPass) {
					var name = this.optionsToPass[i];
					options[name] = this.options[name];
				}
				
				if (!options.el && this.el && o.selector) {
					options.el =  this.el + ' ' + o.selector;
				}		
				this.createView(name, o.view || null, options);								
			}.bind(this));
		},
		
		_addDefinedNestedViewDefs: function (list) {
			for (var name in this.views) {
				var o = _.clone(this.views[name]);
				o.name = name;
				list.push(o);
				this._nestedViewDefs[name] = o;
			}
			return list
		},		
		
		_getNestedViewsFromLayout: function () {
			var nestedViewDefs = this._layouter.findNestedViews(this._getLayoutName(), this._getLayout() || null, this.noCache);			

			if (Object.prototype.toString.call(nestedViewDefs) !== '[object Array]') {
				throw new Error("Bad layout. It should be an Array.");
			}
			
			var nestedViewDefsFiltered = [];
			for (var i in nestedViewDefs) {	
				var key = nestedViewDefs[i].name;	

				this._nestedViewDefs[key] = nestedViewDefs[i];				
				
				if ('view' in nestedViewDefs[i] && nestedViewDefs[i].view === true) {
					if (!('layout' in nestedViewDefs[i] || 'template' in nestedViewDefs[i])) {
						continue;
					}
				}
				nestedViewDefsFiltered.push(nestedViewDefs[i]);
			}
			
			return nestedViewDefsFiltered;
		},
		
		
		_loadNestedViews: function (callback) {			

			var nestedViewDefs = [];
			
			if (this._layout != null ) {
				nestedViewDefs = this._getNestedViewsFromLayout();
			}
			
			this._addDefinedNestedViewDefs(nestedViewDefs);
			
			this.asyncLoop({
				length : nestedViewDefs.length,
				functionToLoop : function (loop, i) {
					var key = nestedViewDefs[i].name;
					var viewName = this._factory.defaultViewName;
				
					if ('view' in nestedViewDefs[i]) {
						viewName = nestedViewDefs[i].view;
					}
					
					if (viewName === false) {
						loop();
						return;
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
					
					for (var i in this.optionsToPass) {
						var name = this.optionsToPass[i];
						options[name] = this.options[name];
					}		
					this._factory.create(viewName, options, function (view) {
						if ('notToRender' in nestedViewDefs[i]) {
							view.notToRender = nestedViewDefs[i].notToRender;
						}						
						this.setView(key, view);						
						loop();
					}.bind(this));
				}.bind(this),
				callback : function() {
					callback();
				}    
			});				
		},
		
		_getData: function () {			
			if (typeof this.data === 'function') {
				return this.data();
			}
			return this.data;
		},
		
		_getNestedViewsAsArray: function (nestedViews) {
			var nestedViewsArray = [];			
			var i = 0;
			for (var key in this.nestedViews) {				
				nestedViewsArray.push({
					key: key,
					view: this.nestedViews[key]
				});
				i++;
			}
			return nestedViewsArray;
			
		},
		
		_getNestedViewsHtmlList: function (callback) {
			var data = {};			
			var nestedViewsArray = this._getNestedViewsAsArray();
			
			this.asyncLoop({
				length : nestedViewsArray.length,
				functionToLoop : function (loop, i) {				
					var key = nestedViewsArray[i].key; 
					var view = nestedViewsArray[i].view;
					if (!view.notToRender) {					
						view.getHtml(function (html) {
							data[key] = html;
							loop();
						});	
					} else {
						loop();
					}
				},
				callback: function () {
					callback(data);
				}
			});						
		},
		
		_getHtml: function (callback) {		
			this._getNestedViewsHtmlList(function (nestedViewsHtmlList) {
				var data = _.extend(this._getData() || {}, nestedViewsHtmlList);			
				if (this.collection || null) {
					data.collection = this.collection;
				}
				if (this.model || null) {
					data.model = this.model;
				}				
				this._getTemplate(function (template) {
					var html = this._renderer.render(template, data);
					callback(html);
				}.bind(this));				
			}.bind(this));
		},
		
		_getTemplateName: function () {
			return this.template || null;
		},
		
		_getLayoutName: function () {
			return this.layout || this.name || null;
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
		
		_getTemplate: function (callback) {		
			if (this._templator.compilable && this._templateCompiled !== null) {				
				callback(this._templateCompiled);
				return;
			} 
		
			var _template = this._template || null;											
			
			if (_template !== null) {				
				callback(_template);
				return;
			}
			
			var templateName = this._getTemplateName();			

			var noCache = false;
			var layoutOptions = {};			
				
			if (!templateName) {
				noCache = this.noCache;
			
				var layoutName = this._getLayoutName();				
								
				if (!layoutName) {
					noCache = true;				
				} else {
					templateName = 'built-' + layoutName;
				}				
				layoutOptions = {
					name: layoutName,
					data: this._getLayoutData(),
					layout: this._getLayout(),
				}		
			}
			
			this._templator.getTemplate(templateName, layoutOptions, noCache, callback);
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
					if ('el' in this._nestedViewDefs[key]) {
						el = this._nestedViewDefs[key].el;
					} else {
						if ('selector' in this._nestedViewDefs[key]) {							
							var currentEl = null;
							if (typeof this.el == 'object') {
								currentEl = this.$el.selector;
							} else {								
								currentEl = this.options.el || this.el;	
							}		
							if (currentEl) {
								el = currentEl + ' ' + this._nestedViewDefs[key].selector;
							}					
						}
					}
				}
			}
			return el;
		},		
		
		hasView: function (key) {
			if (key in this.nestedViews) {
				return true;
			}
			return false;
		},
		
		/**
		 * Get nested view.
		 * @param {string} key
		 * @return {Jet.View}
		 */
		getView: function (key) {
			if (key in this.nestedViews) {
				return this.nestedViews[key];
			}
		},
		
		createView: function (key, viewName, options, callback, wait) {
			wait = (typeof wait === 'undefined') ? true : wait;
			if (wait) {
				this.waitForView(key);
			}			
			this._factory.create(viewName, options, function (view) {
				this.setView(key, view);
				/*if (key === 'record') {					
					console.log(this.record.nestedViews.name._rendered);
				}*/
				if (typeof callback === 'function') {
					callback(view);
				}
			}.bind(this));		
		},
		
		/**
		 * Set nested view.
		 * @param {string} key
		 * @param {Jet.View} view
		 * @param {string} el Selector for view container.
		 */
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

			this._tryReady();	
		},
		
		/**
		 * Clear nested view.
		 * @param {string} key
		 */
		clearView: function (key) {
			if (key in this.nestedViews) {
				this.nestedViews[key].remove();
				delete this.nestedViews[key];
			}			
		},
		
		/**
		 * Get parent view.
		 * @return {Jet.View}
		 */
		getParentView: function () {
			return this._parentView;
		},
		
		/**
		 * Add condition for view getting ready.
		 * @param {Function} or {Bool}
		 */
		addReadyCondition: function (condition) {
			this._readyConditions.push(condition);
		},
		
		waitForView: function (viewName) {
			this.expectedViews.push(viewName);
		},
		
		/**
		 * Add wait condition is true is passed. Remove wait condition if false.
		 * @param {Bool}
		 */
		wait: function (wait) {
			if (wait) {
				this._wait = true;
			} else {
				this._wait = false;
				this._tryReady();
			}	
		},
		
		/**
		 * Remove view and all nested tree. Triggers 'remove' event.
		 */
		remove: function () {
			for (var key in this.nestedViews) {				
				this.clearView(key);
			}
			this.trigger('remove');
			this.off();	
			this.$el.empty();
      		this.stopListening();
      		this.undelegateEvents();
      		if (this.model) {
      			this.model.off(null, null, this);
      		}
      		if (this.collection) {
      			this.collection.off(null, null, this);
      		}
     		return this;		
		},
	});	
	
}).call(this, Bull, Backbone, _);
