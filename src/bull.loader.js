(function (Bull, _) {

    /**
     * @class Bull.Loader
     * @param options
     */
    Bull.Loader = function (options) {
        options = options || {};

        this._paths = _.extend(this._paths, options.paths || {});
        this._exts = _.extend(this._exts, options.exts || {});
        this._normalize = _.extend(this._normalize, options.normalize || {});
        this._isJson = _.extend(this._isJson, options.isJson || {});

        this._externalLoaders = _.extend(this._externalLoaders, options.loaders || {});

        this._externalPathFunction = options.path || null;
    };

    _.extend(Bull.Loader.prototype, /** @lends Bull.Loader.prototype */{

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

        _externalPathFunction: null,

        _normalize: {
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

        getFilePath: function (type, name) {
            if (!(type in this._paths) || !(type in this._exts)) {
                throw new TypeError("Unknown resource type \"" + type + "\" requested in Bull.Loader.");
            }

            let namePart = name;

            if (type in this._normalize) {
                namePart = this._normalize[type](name);
            }

            let pathPart = this._paths[type];

            if (pathPart.substr(-1) === '/') {
                pathPart = pathPart.substr(0, pathPart.length - 1);
            }

            return pathPart + '/' + namePart + '.' + this._exts[type];
        },

        _callExternalLoader: function (type, name, callback) {
            if (type in this._externalLoaders && this._externalLoaders[type] !== null) {
                if (typeof this._externalLoaders[type] === 'function') {
                    this._externalLoaders[type](name, callback);

                    return true;
                }

                throw new Error("Loader for \"" + type + "\" in not a Function.");
            }

            return null;
        },

        load: function (type, name, callback) {
            let customCalled = this._callExternalLoader(type, name, callback);

            if (customCalled) {
                return;
            }

            let response, filePath;

            if (this._externalPathFunction != null) {
                filePath = this._externalPathFunction.call(this, type, name);
            } else {
                filePath = this.getFilePath(type, name);
            }

            filePath += '?_=' + new Date().getTime();

            let xhr = new XMLHttpRequest();

            xhr.open('GET', filePath, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    response = xhr.responseText;

                    if (type in this._isJson) {
                        if (this._isJson[type]) {
                            let obj;

                            if (xhr.status == 404 || xhr.status == 403) {
                                throw new Error("Could not load " + type + " \"" + name + "\".");
                            }

                            try {
                                obj = JSON.parse(String(response));
                            }
                            catch (e) {
                                throw new SyntaxError(
                                    "Error while parsing " + type + " \"" + name + "\": (" + e.message + ").");
                            }

                            callback(obj);

                            return;
                        }
                    }

                    callback(response);
                }
            };

            xhr.send(null);
        },
    });

}).call(this, Bull, _);
