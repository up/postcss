var postcss = require('../lib/postcss');
var Result  = require('../lib/result');
var Root    = require('../lib/root');

describe('postcss.root()', () => {

    it('allows to build own CSS', () => {
        var root = postcss.root();
        var rule = postcss.rule({ selector: 'a' });
        rule.append( postcss.decl({ prop: 'color', value: 'black' }) );
        root.append( rule );

        root.toString().should.eql("a {\n    color: black\n}");
    });

});

describe('postcss()', () => {

    it('creates processors list', () => {
        postcss().should.eql({ processors: [] });
    });

    it('saves processors list', () => {
      var a = () => 1;
      var b = () => 2;
      postcss(a, b).should.eql({ processors: [a, b] });
    });

    describe('use()', () => {

        it('adds new processors', () => {
            var a = () => 1;
            var processor = postcss();
            processor.use(a);
            processor.should.eql({ processors: [a] });
        });

        it('returns itself', () => {
            var a = () => 1;
            var b = () => 2;
            postcss().use(a).use(b).should.eql({ processors: [a, b] });
        });

    });

    describe('process()', () => {
        before( () => {
            this.processor = postcss( (css) => {
                css.eachRule( (rule) => {
                    if ( !rule.selector.match(/::(before|after)/) ) return;
                    if ( !rule.some( i => i.prop == 'content' ) ) {
                        rule.prepend({ prop: 'content', value: '""' });
                    }
                });
            });
        });

        it('processes CSS', () => {
            var result = this.processor.process('a::before{top:0}');
            result.css.should.eql('a::before{content:"";top:0}');
        });

        it('processes parsed AST', () => {
            var root   = postcss.parse('a::before{top:0}');
            var result = this.processor.process(root);
            result.css.should.eql('a::before{content:"";top:0}');
        });

        it('processes previous result', () => {
            var empty  = postcss( (css) => css );
            var result = empty.process('a::before{top:0}');
            result = this.processor.process(result);
            result.css.should.eql('a::before{content:"";top:0}');
        });

        it('throws with file name', () => {
            var error;
            try {
                postcss().process('a {', { from: 'A' });
            } catch (e) {
                error = e;
            }

            error.file.should.eql('A');
            error.message.should.eql(
                "Can't parse CSS: Unclosed block at line 1:1 in A");
        });

        it('allows to replace Root', () => {
            var processor = postcss( () => new Root() );
            processor.process('a {}').css.should.eql('');
        });

        it('returns Result object', () => {
            var result = postcss().process('a{}');
            result.should.be.an.instanceOf(Result);
            result.css.should.eql(       'a{}');
            result.toString().should.eql('a{}');
        });

        it('calls all processors', () => {
            var calls = '';
            var a = () => calls += 'a';
            var b = () => calls += 'b';

            postcss(a, b).process('');
            calls.should.eql('ab');
        });

        it('parses, convert and stringify CSS', () => {
            var a = (css) => css.should.be.an.instanceof(Root);
            postcss(a).process('a {}').css.should.have.type('string');
        });

    });

});
