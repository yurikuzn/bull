
/**
 * @class Layouter
 * @alias Bull.Layouter
 * @param {{
 *   loader: Loader,
 * }|null} data
 */
const Layouter = function (data) {
    data = data || {};

    /**
     * @type {Loader|null}
     * @private
     */
    this._loader = data.loader || null;

    this._layouts = {};
    this._cachedNestedViews = {};
};

_.extend(Layouter.prototype, /** @lends Layouter.prototype */{

    _layouts: null,
    _cachedNestedViews: null,

    addLayout: function (layoutName, layout) {
        this._layouts[layoutName] = layout;
    },

    getLayout: function (layoutName, callback) {
        if (layoutName in this._layouts) {
            callback(this._layouts[layoutName]);

            return;
        }

        this._loader.load('layout', layoutName, layout => {
            this.addLayout(layoutName, layout);

            callback(layout);
        });
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
            let cached = this._getCachedNestedViews(layoutName);

            if (cached) {
                return cached;
            }
        }

        if (typeof layoutDefs === 'undefined') {
            if (layoutName in this._layouts) {
                layoutDefs = this._layouts[layoutName];
            }

            if (!('layout' in layoutDefs)) {
                throw new Error("Layout \"" + layoutName + "\"" + " is bad.");
            }
        }

        let layout = layoutDefs.layout;
        let viewPathList = [];

        let uniqName = (name, count) => {
            let modName = name;

            if (typeof count !== 'undefined') {
                modName = modName + '_' + count;
            } else {
                count = 0;
            }

            for (let i in viewPathList) {
                if (viewPathList[i].name === modName) {
                    return uniqName(name, count + 1);
                }
            }

            return modName;
        };

        let getDefsForNestedView = (defsInLayout) => {
            let defs = {};

            let params = ['view', 'layout', 'notToRender', 'options', 'template', 'id', 'selector', 'el'];

            for (let i in params) {
                let param = params[i];

                if (param in defsInLayout) {
                    defs[param] = defsInLayout[param];
                }
            }

            if ('name' in defsInLayout) {
                defs.name = uniqName(defsInLayout.name);
            }

            return defs;
        };

        let seekForViews = (tree) => {
            for (let key in tree) {
                if (tree[key] !== null && typeof tree[key] === 'object') {
                    if ('view' in tree[key] || 'layout' in tree[key] || 'template' in tree[key]) {
                        let def = getDefsForNestedView(tree[key]);

                        if ('name' in def) {
                            viewPathList.push(def);
                        }
                    }
                    else {
                        seekForViews(tree[key]);
                    }
                }
            }
        };

        seekForViews(layout);

        if (layoutName && !noCache) {
            this._cacheNestedViews(layoutName, viewPathList);
        }

        return viewPathList;
    }
});

export default Layouter;
