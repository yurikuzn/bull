var Bull = Bull || {};

(function (Bull, _) {

	var root = this;
	
	/**
	 * Bull.Factory is a factory for views. 
	 * It has hard dependency from Backbone.js and uses Handlebard.js templating system by default.
	 *
	 */
	 
	/**
	 * @constructor
	 * @param {Object} options Configuration options. 
	 * <ul>
	 *  <li>useCache: {bool}</li>
	 *  <li>defaultView: {String} Default name for views when it is not defined.</li>
	 *  <li>viewLoader: {Function} Function that returns view class ({Function} in javascript) by the given view name as only parameter. Here you can load js code using sync XHR request. If not defined it will lookup classes in window object.</li>
	 *  <li>helper: {Function} View Helper that will be injected into all views.</li>
	 *  <li>loading: {Object} Resources loading options: paths, exts, loaders. Example: <br>
	 *    <i>{
	 *      paths: { // Custom paths for resource files.
	 *        layout: 'resources/layouts',
	 *        templates: 'resources/templates',
	 *        layoutTemplate: 'resources/templates/layouts',
	 *      },
	 *      exts: { // Custom extensions of resource files.
	 *        layout: 'json',
	 *        templates: 'tpl',
	 *      },
	 *      loaders: { // Custom resources loading functions. Define it if some type of resources needs to be loaded via REST rather than from file.
	 *        layout: function (layoutName) {
	 *          return layoutManager.getLayout(layoutName);
	 *        }    
	 *      }
	 *    }</i>
	 *  </li>
	 *  <li>rendering: {Object} Rendering options: method (Method is the custom function for a rendering. Define it if you want to use another templating engine. <i>Function (template, data)</i>).</li>
	 *  <li>templating: {Object} Templating options: {bool} compilable (If templates are compilable (like Handlebard). True by default.)</li> 
	 * </ul>
	 */
	Bull.Factory = function (options) {	
		var options = options || {};
		
		this.defaultViewName = options.defaultView || this.defaultViewName;	
		
		if ('useCache' in options) {
			this.useCache = options.useCache;
		}	

		if (this.useCache) {
			this._cacher = options.customCacher || new Bull.Cacher();
		}
		
		this._loader = options.customLoader || new Bull.Loader(options.loading || {});		
		this._renderer = options.customRenderer || new Bull.Renderer(options.rendering || {});
		this._layouter = options.customLayouter || new Bull.Layouter(_.extend(options.layouting || {}, {
			loader: this._loader,
			cacher: this._cacher,
		}));		
		this._templator = options.customTemplator || new Bull.Templator(_.extend(options.templating || {}, {
			loader: this._loader,
			cacher: this._cacher,
			layouter: this._layouter,
		}));
		
		this._helper = options.helper || null;
		
		this._viewClassHash = {};		
		this._getViewClassFunction = options.viewLoader || this._getViewClassFunction;	
	};
	
	_.extend(Bull.Factory.prototype, {
	
		defaultViewName: 'View',
	
		useCache: true,		
		
		_layouter: null,
		
		_templator: null,
		
		_cacher: null,
		
		_renderer: null,
		
		_loader: null,
		
		_helper: null,
		
		_viewClassHash: null,		
		
		_getViewClassFunction: function (viewName) {		
			var viewClass = root[viewName];
			if (typeof viewClass !== "function") {
				throw new Error("function \"" + viewClass + "\" not found.");
			}
			return viewClass;			
		},		
		
		_getViewClass: function (viewName) {			
			if (viewName in this._viewClassHash) {
				return this._viewClassHash[viewName];
			}			
			this._viewClassHash[viewName] = this._getViewClassFunction(viewName);			
			return this._viewClassHash[viewName];
		},		
		
		/**
		 * Create view.
		 * @param viewName
		 * @param {Object} options
		 * @return {Bull.View}
		 */
		create: function (viewName, options) {				
			var viewClass = this._getViewClass(viewName);
			
			if (typeof viewClass === 'undefined') {
				throw new Error("Class for view \"" + viewName + "\" not found.");
			}	
					
			var view = new viewClass(_.extend(options || {}, {
				factory: this,
				layouter: this._layouter,
				templator: this._templator,
				renderer: this._renderer,
				helper: this._helper
			}));						
			return view;					
		},
	});	
	
}).call(this, Bull, _);
