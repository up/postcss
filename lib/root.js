var Declaration = require('./declaration');
var Container   = require('./container');
var Comment     = require('./comment');
var AtRule      = require('./at-rule');
var Result      = require('./result');
var Rule        = require('./rule');

// Root of CSS
class Root extends Container.WithRules {
    constructor(defaults) {
        this.type  = 'root';
        this.rules = [];
        super(defaults);
    }

    // Fix spaces on insert before first rule
    normalize(child, sample, type) {
        var childs = super.normalize(child, sample, type);

        for ( child of childs ) {
            if ( type == 'prepend' ) {
                if ( this.rules.length > 1 ) {
                    sample.before = this.rules[1].before;
                } else {
                    sample.before = this.after;
                }
            } else {
                if ( this.rules.length > 1 ) {
                    child.before = sample.before;
                } else {
                    child.before = this.after;
                }
            }
        }

        return childs;
    }

    // Stringify styles
    stringify(builder) {
        this.stringifyContent(builder);
        if ( this.after) builder(this.after);
    }

    // Generate processing result with optional source map
    toResult(opts = { }) {
        return new Result(this, opts);
    }
}

module.exports = Root;
