require.config({
    baseUrl: '../',
    shim: {
        html: {
            deps: [
                'chai'
            ]
        },
        sinon: {
            exports: 'sinon',
            init: function(){
                return this.sinon;
            }
        }
    },
    paths: {
        // test tools
        chai: 'vendor/chai/chai',
        sinon: 'vendor/sinon/sinon',
        sinonChai: 'vendor/sinon-chai/sinon-chai',
        // libs
        underscore: 'vendor/underscore/underscore.1.5.2',
        jquery: 'vendor/jquery/jquery.2.0.3',
        // directories
        tests: '../test/tests',
        // helpers
        funcs: 'hlpr/functions',
        createContext: 'hlpr/customContext'
    }
});

require([
    'chai',
    'sinonChai',
    'sinon',
    // libs
    'jquery',
    'underscore',
    // helpers
    'funcs',
    'createContext'
], function( chai, sinonChai, sinon ) {
    chai.should();
    chai.use(sinonChai);

    require([
        'tests/firstTest'
    ], function( ){
        // get all the baby contexts
        var contexts = _.reject(require.s.contexts, function(c, i){
            // _ is the root context, so not that
            return i === '_';
        });
        // get the deffered from each of em
        _.each(contexts, function(c, i){
            contexts[i] = c.config.deferred;
        });

        $.when.apply($, contexts).done(function(){
            if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
            else { mocha.run(); }
        });

    });
});