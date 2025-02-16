var Declaration = require('./declaration');
var Comment     = require('./comment');
var AtRule      = require('./at-rule');
var Result      = require('./result');
var Rule        = require('./rule');
var Root        = require('./root');

// List of functions to process CSS
class PostCSS {
    constructor(processors = []) {
        this.processors = processors;
    }

    // Add another function to CSS processors
    use(processor) {
        this.processors.push(processor);
        return this;
    }

    // Process CSS throw installed processors
    process(css, opts = { }) {
        if ( opts.map == 'inline' ) opts.map = { inline: true };

        var parsed;
        if ( css instanceof Root ) {
            parsed = css;
        } else if ( css instanceof Result ) {
            parsed = css.root;
        } else {
            parsed = postcss.parse(css, opts);
        }

        for ( var processor of this.processors ) {
            var returned = processor(parsed);
            if ( returned instanceof Root ) parsed = returned;
        }

        return parsed.toResult(opts);
    }
}

// Framework for CSS postprocessors
//
//   var processor = postcss(function (css) {
//       // Change nodes in css
//   });
//   processor.process(css)
var postcss = function (...processors) {
    return new PostCSS(processors);
};

// Compile CSS to nodes
postcss.parse = require('./parse');

// Nodes shortcuts
postcss.comment = function (defaults) {
    return new Comment(defaults);
};
postcss.atRule = function (defaults) {
    return new AtRule(defaults);
};
postcss.decl = function (defaults) {
    return new Declaration(defaults);
};
postcss.rule = function (defaults) {
    return new Rule(defaults);
};
postcss.root = function (defaults) {
    return new Root(defaults);
};

module.exports = postcss;
