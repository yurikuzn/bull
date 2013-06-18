(function (Bull, _) {

	Bull.Cacher = function (options) {
	
	};
	
	_.extend(Bull.Cacher.prototype, {
	
		_prefix: 'bull',
		
		_composeFullPrefix: function (type) {
			return this._prefix + '-' + type;
		},
		
		_composeKey: function (type, name) {
			return this._composeFullPrefix(type) + '-' + name;
		},
		
		_checkType: function (type) {
			if (typeof type === 'undefined' && toString.call(type) != '[object String]') {
				throw new TypeError("Bad type \"" + type + "\" passed to Bull.Cacher().");
			}
		},
					
		get: function (type, name) {
			this._checkType(type);
		
			var key = this._composeKey(type, name);
			var stored = localStorage.getItem(key);
			if (stored) {
				var str = stored;
				if (stored[0] == "{" || stored[0] == "[") {	
					try	{
						str = JSON.parse(stored);
					} catch (error) {
						str = stored;
					}
					stored = str;					
				}
				return stored;
			}
			return null;				
		},
		
		set: function (type, name, value) {
			this._checkType(type);

			var key = this._composeKey(type, name);	
			if (value instanceof Object) {
				value = JSON.stringify(value);
			}
			localStorage.setItem(key, value);
		},
		
		clear: function (type) {			
			var reText;
			if (typeof type !== 'undefined') {
				reText = '^' + this._composeFullPrefix(type);
			} else {
				reText = '^' + this._prefix + '-';
			}
			var re = new RegExp(reText);			
			for (var i in localStorage) {						
				if (re.test(i)) {					
					delete localStorage[i];
				}
			}
		},
	});
	
}).call(this, Bull, _);
