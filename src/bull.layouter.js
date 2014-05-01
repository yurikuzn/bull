(function (Bull, _) {

	Bull.Layouter = function (data) {
		var data = data || {};
		this._layouts = {};
		this._loader = data.loader || null;
		this._cachedNestedViews = {};
	};

	_.extend(Bull.Layouter.prototype, {

		_layouts: null,

		_loader: null,
		
		_cachedNestedViews: null,

		addLayout: function (layoutName, layout) {
			this._layouts[layoutName] = layout;
		},

		getLayout: function (layoutName, callback) {
			if (layoutName in this._layouts) {
				callback(this._layouts[layoutName]);
				return;
			}

			if (!layout) {
				this._loader.load('layout', layoutName, function (layout) {
					this.addLayout(layoutName, layout);
					callback(layout);
				}.bind(this));
				return;
			}
		},

		_getCachedNestedViews: function (layoutName) {
			if (layoutName in this._cachedNestedViews) {				
				return this._cachedNestedViews[layoutName];
			}			
			return false;
		},

		_cacheNestedViews: function (layoutName, nestedViews) {
			if (!(layoutName in this._cachedNestedViews)) {	
				this._cachedNestedViews[layoutName] = nestedViews;
			}
		},

		findNestedViews: function (layoutName, layoutDefs, noCache) {
			if (!layoutName && !layoutDefs) {
				throw new Error("Can not find nested views. No layout data and name.");
			}

			if (layoutName && !noCache) {
				var cached = this._getCachedNestedViews(layoutName);
				if (cached) {
					return cached;
				}
			}

			if (typeof layoutDefs == 'undefined') {
				if (layoutName in this._layouts) {
					layoutDefs = this._layouts[layoutName];
				}
				if (!('layout' in layoutDefs)) {
					throw new Error("Layout \"" + layoutName + "\"" + " is bad.");
				}
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
				var params = ['view', 'layout', 'notToRender', 'options', 'template', 'id', 'selector', 'el'];
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
			if (layoutName && !noCache) {				
				this._cacheNestedViews(layoutName, viewPathList);
			}
			return viewPathList;
		}
	});

}).call(this, Bull, _);
