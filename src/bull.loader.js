(function (Bull, _) {

	Bull.Loader = function (options) {
		var options = options || {}; 
		this._paths = _.extend(this._paths, options.paths || {});
		this._exts = _.extend(this._exts, options.exts || {});
		this._namingFunctions = _.extend(this._namingFunctions, options.namingFunctions || {});
		this._isJson = _.extend(this._isJson, options.isJson || {});
		
		this._externalLoaders = _.extend(this._externalLoaders, options.loaders || {});
	};
	
	_.extend(Bull.Loader.prototype, {	
	
		_exts: {
			layout: 'json',
			template: 'tpl',
			layoutTemplate: 'tpl',
		},	
		
		_paths: {
			layout: 'layouts',
			template: 'templates',
			layoutTemplate: 'templates/layouts',
		},
		
		_isJson: {
			layout: true,
		},
		
		_externalLoaders: {
			layout: null,
			template: null,
			layoutTemplate: null,	
		},
		
		_namingFunctions: {
			layouts: function (name) {
				return name;
			},
			templates: function (name) {
				return name;
			},
			layoutTemplates: function (name) {
				return name;
			},
		},
		
		_getFilePath: function (type, name) {
			if (!(type in this._paths) || !(type in this._exts)) {
				throw new TypeError("Unknown resource type \"" + type + "\" requested in Bull.Loader.");
			}
			
			var namePart = name;
			if (type in this._namingFunctions) {
				namePart = this._namingFunctions[type](name);
			}
			
			var pathPart = this._paths[type];			
			if (pathPart.substr(-1) == '/') {
				pathPart = pathPart.substr(0, pathPart.length - 1);
			}
		
			return pathPart + '/' + namePart + '.' + this._exts[type];
		},
		
		_callExternalLoader: function (type, name, callback) {
			if (type in this._externalLoaders && this._externalLoaders[type] !== null) {
				if (typeof this._externalLoaders[type] === 'function') {					
					this._externalLoaders[type](name, callback);
					return true;					
				} else {
					throw new Error("Loader for \"" + type + "\" in not a Function.");
				}			
			}
			return null;
		},
		
		load: function (type, name, callback) {			
			var customCalled = this._callExternalLoader(type, name, callback);			
			if (customCalled) {
				return;
			}
			
			var response;
			
			var filePath = this._getFilePath(type, name) + '?_=' + Math.floor((Math.random() * 100000) + 1);
		
			var xhr = new XMLHttpRequest();
			xhr.open('GET', filePath, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					response = xhr.responseText;
					if (type in this._isJson) {						
						if (this._isJson[type]) {				
							var obj;
							if (xhr.status == 404 || xhr.status == 403) {
								throw new Error("Could not load " + type + " \"" + name + "\".");
							}
					
							try {
								obj = JSON.parse(String(response));
							} catch (e) {						
								throw new SyntaxError("Error while parsing " + type + " \"" + name + "\": (" + e.message + ").");
							}
							callback(obj);
							return;			
						}
					}		
					callback(response);    		
				}
			}.bind(this);
			
			xhr.send(null);
		},
	});
	
}).call(this, Bull, _);
