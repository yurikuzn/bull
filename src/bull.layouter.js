
/**
 * @alias Bull.Layouter
 */
class Layouter {

    /**
     * @param {Object} layoutDefs
     * @return {Bull.View~nestedViewItemDefs[]}
     */
    findNestedViews(layoutDefs) {
        if (!layoutDefs) {
            throw new Error("Can not find nested views. No layout data and name.");
        }

        let layout = layoutDefs.layout;
        let viewPathList = [];

        const uniqName = (name, count) => {
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

        const getDefsForNestedView = (defsInLayout) => {
            let defs = {};

            let params = [
                'view',
                'layout',
                'notToRender',
                'options',
                'template',
                'id',
                'selector',
                'el',
            ];

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

        const seekForViews = (tree) => {
            for (let key in tree) {
                if (tree[key] == null || typeof tree[key] !== 'object') {
                    continue;
                }

                if ('view' in tree[key] || 'layout' in tree[key] || 'template' in tree[key]) {
                    let def = getDefsForNestedView(tree[key]);

                    if ('name' in def) {
                        viewPathList.push(def);
                    }

                    continue;
                }

                seekForViews(tree[key]);
            }
        };

        seekForViews(layout);

        return viewPathList;
    }
}

export default Layouter;
