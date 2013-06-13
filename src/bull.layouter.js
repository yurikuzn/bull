(function (Bull, _) {

	Bull.Layouter = function (data) {	
		var data = data || {};	
		this._layouts = {};		
		this._cacher = data.cacher || null;
		this._loader = data.loader || null;
	};
	
	_.extend(Bull.Layouter.prototype, {
	
		_layouts: null,
		
		_cacher: null,
		
		_loader: null,
		
		addLayout: function (layoutName, layout) {
			this._layouts[layoutName] = layout;			
		},	
	
		getLayout: function (layoutName) {
			if (layoutName in this._layouts) {
				return this._layouts[layoutName];
			}
			
			var layout = this._getCachedLayout(layoutName);
			if (!layout) {
				layout = this._loader.load('layout', layoutName);
				this._cacheLayout(layoutName, layout);
			}
						
			this.addLayout(layoutName, layout);
			return layout;		
		},
		
		_getCachedLayout: function (layoutName) {
			if (this._cacher != null) {
				return this._cacher.get('layout', layoutName);
			}
			return false;
		},
		
		_cacheLayout: function (layoutName, layout) {
			if (this._cacher != null) {
				this._cacher.set('layout', layoutName, layout);
			}
		},
		
		_getCachedNestedViews: function (layoutName) {
			if (this._cacher != null) {
				return this._cacher.get('nestedView', layoutName);
			}
			return false;
		},
		
		_cacheNestedViews: function (layoutName, nestedViews) {
			if (this._cacher != null) {
				this._cacher.set('nestedView', layoutName, nestedViews);
			}
		},
		
		findNestedViews: function (layoutName, layoutDefs) {
			var cached = this._getCachedNestedViews(layoutName);
			if (cached) {
				return cached;
			}	
			var layoutDefs = layoutDefs || this.getLayout(layoutName);
			if (typeof layoutDefs == 'undefined' || !('layout' in layoutDefs)) {
				throw new Error("Layout \"" + layoutName + "\"" + " is bad.");
			}			
			var layout = layoutDefs.layout;
			var viewPathList = [];	
			
			var uniqName = function (name, count) {			
				var modName = name;
				if (typeof count !== 'undefined') {
					modName = modName + '_' + count;
				} else {
					var count = 0;
				}
				for (var i in viewPathList) {
					if (viewPathList[i].name == modName) {
						return uniqName(name, count + 1);
					}
				}				
				return modName;
			}
			
			var getDefsForNestedView = function (defsInLayout) {
				var defs = {};
				var params = ['view', 'layout', 'notToRender', 'options', 'template', 'id', 'selector'];
				for (var i in params) {
					var param = params[i];
					if (param in defsInLayout) {
						defs[param] = defsInLayout[param];
					}
				}
				if ('name' in defsInLayout) {
					defs.name = uniqName(defsInLayout.name);
				}
				return defs;
			}
					
			var seekForViews = function (tree) {
				for (var key in tree) {
					if (tree[key] != null && typeof tree[key] === 'object') {
						if ('view' in tree[key] || 'layout' in tree[key] || 'template' in tree[key]) {
							var def = getDefsForNestedView(tree[key]);							
							if ('name' in def) {
								viewPathList.push(def);
							}		
						} else {
							seekForViews(tree[key]);
						}
					}
				}	
			}			
			seekForViews(layout);
			this._cacheNestedViews(layoutName, viewPathList);
			return viewPathList;
		}	
	});
	
}).call(this, Bull, _);
