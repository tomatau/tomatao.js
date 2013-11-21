;(function(window, document, $, _, undef){
    'use strict';
    var a = this,
        Pln = a.Pln = {};
    
    /* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
     * http://benalman.com/
     * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
    (function($) {
        var o = $({});
        $.sub = function() {
            o.on.apply(o, arguments);
        };
        $.unsub = function() {
            o.off.apply(o, arguments);
        };
        $.pub = function() {
            o.trigger.apply(o, arguments);
        }
    }(jQuery));

    // make arguments an array
    function _arg2a(args, idx){
        return idx = (idx || 1), [].splice.call(args, idx);
    };

    // reusable constructor functionlaity
    function con(opts, t){
        t.setops(opts);
        // force all methods to keep klass context
        _.each(_.functions(t), function(f){
            t[f] = t[f].bind(t);
        });
        t.init && t.init.call(t, opts);
    };

    /**
     *      Events
     */
    var Events = Pln.Events = {
        _listeningTo: {},
        _handlers: {},
        evReg: /^(\S+)\s*(.*)$/,
        // listen to own events
        on: function() {
            var $t = $(this);
            return $t.on.apply($t, arguments), this;
        },
        one: function() {
            var $t = $(this);
            return $t.one.apply($t, arguments), this;
        },
        off: function() {
            var $t = $(this);
            return $t.off.apply($t, arguments), this;
        },
        // trigger
        trigger: function() {
            var $t = $(this);
            return $t.trigger.apply($t, arguments), this;
        },

        // ReqRes
        response: function(evt, callback){
            this._handlers[evt] = callback;
        },
        request: function(evt, param){
            return this._handlers[evt](param);
        },

        // global events already in jquery pubsub
        // other object events
        listenTo: function(obj, name, method) {
            method = _.bind(method, this);
            this._listeningTo[name] = obj;
            return obj.on(name, this, method);
        },
        listenToOnce: function(obj, name, method) {
            method = _.bind(method, this);
            this._listeningTo[name] = obj;
            return obj.one(name, this, method);
        },
        stopListening: function(obj, name) {
            if ( this._listeningTo[name] ) {
                this._listeningTo[name];
                return delete this._listeningTo[name];
            }
            _.each(this._listeningTo, function(n, o) {
                o.off(n);
                delete this._listeningTo[n];
            });
        },
        // e.g. 'click element#id:hover'
        parseSelector: function(key){
            key = key.match(this.evReg);
            return {
                name: key[1],
                sel: ( !_.isBlank(key[2]) ) ? key[2] : null
            };
        }
    };
    // Global events for fun
    _.extend(Pln, Events);

    /**
     *      Klass
     */
    var Klass = Pln.Klass = function(opts){
        var t = this;
        con(opts, t);
    };
    _.extend(Klass.prototype, Events, {
        parent: Object,
        super: function(){
            var m = arguments[0];
            this.parent.prototype[m].apply(this, _arg2a(arguments, 1));
        },
        setops: function(opts) {
            // clone because this is empty..
            this.opts = _.omit(opts, _.keys(_.clone(this)));
        }
    });

    /**
     *      Controller
     *
     * pass viewOpts or modelOpts
     */
    var Ctrlr = Pln.Ctrlr = function(opts) {
        var t = this;
        t.setViews(opts.views);
        t.setEntities(opts);
        con(opts, t);
    };
    _.extend(Ctrlr.prototype, Klass.prototype, {
        opts: null,
        views: {},
        models: {},
        collections: {},
        view: function(name, view){
            this.views[name] = view;
        },
        model: function(name, model){
            this.models[name] = model;
        },
        collection: function(name, col){
            this.collections[name] = col;
        },
        setViews: function(){
            var t = this;
            if (_.empty(t.views)) return;
            _.each(t.views, function(v, name){
                t.views[name] = new v();
            }); 
        },
        setEntities: function(opts){
            var t = this;
            this.models = opts.models || this.models;
            this.collections = opts.collections || this.collections;
            if ( _.empty(t.models) && _.empty(t.collections) ) return;
            _.each(t.models, function(m, name){
                t.models[name] = new m();
            });
            _.each(t.collections, function(c, name){
                t.collections[name] = new c();
            });
        },
        close: function(){
            this.off();
            this.viewsOff();
            this.modelsOff();
        },
        viewsOff: function(){
            _.each(this.views, function(v, idx) {
                v.stopListening();
                v.unsetElEvents();
                v.off();
            });
        },
        entitiesOff: function(){
            _.each(this.models, function(m, idx) {
                m.off()
            });
            _.each(this.collections, function(c, idx) {
                c.off()
            });
        }
    });

    /**
     *      View
     */
    var View = Pln.View = function(opts){
        var t = this;
        t.setTmpl(opts.tmpl);
        t.setEl(opts.el);
        t.setElEvents(opts.events);
        con(opts, t);
    };
    _.extend(View.prototype, Klass.prototype, {
        el      : null,
        attrs   : {
            id      : null,
            klass   : null
        },
        tmpl    : null,
        events  : {},
        opts    : {},
        setTmpl: function(tmpl){
            this.tmpl = tmpl || this.tmpl;
            this.checkTmpl();
            this.tmpl = _.template(this.tmpl);
        },
        setEl: function(el) {
            this.el = el || this.el;
            this.el = $(this.el);
        },
        setElEvents: function(events){
            // make sure we have events
            this.events = (typeof events === 'object' && events) || this.events;
            if ( this.events.length < 1) return;
            _.each(this.events, function(cb, key){
                this.addElEvent(key, cb);
            }, this);
        },
        addElEvent: function(key, cb){
            var t = this,evnt;
            // if we don't have the event
            // add it to the events list
            if ( !t.events[key] ) t.events[key] = cb;
            // get the cb function
            if (!_.isFunction(cb)) cb = this[cb];
            if (!cb) return false;
            evnt = t.parseSelector(key);
            cb = _.bind(cb, t);
            // jquery parses this for us
            // because we attach to el, new elements are still delegated
            t.el.on(evnt.name, evnt.sel, cb);
        },
        render: function( data ) {
            if ( data == null || !_.isObject(data) ) return;
            this.checkTmpl();
            this.checkEl();
            this.el.html(this.tmpl(data));
        },
        checkTmpl: function(){
            if ( this.tmpl == null ){
                throw 'You must supply a template for a view!';
            }
        },
        checkEl: function(){
            if ( this.el == null ){
                throw 'You must supply a container element!';
            }
        },
        remove: function(){
            var t = this;
            t.$el.remove();
            t.unsetElEvents();
            t.stopListening();
            t.off();
            return t;
        },
        unsetElEvents: function(){
            if ( this.events.length < 1) return;
            _.each(this.events, function(cb, key){
                this.rmElEvent(key);
            }, this); 
        },
        rmElEvent: function(key){
            evnt = t.parseSelector(key);
            this.el.off(evnt.name, evnt.sel);
        }
    });
    
    /**
     *      View - Composite
     *
     * has a section for a collection
     */
    var Composite = Pln.Composite = function(opts){
        var t = this;
        t.setTmpl(opts.tmpl);
        t.setEl(opts.el);
        t.setCollTmpl(opts.collTmpl);
        t.setCollEl(opts.collEl);
        t.setElEvents(opts.events);
        con(opts, t);
    };
    _.extend(Composite.prototype, View.prototype, {
        // the el within the template for rendering
        collEl: null,
        itemView: null,


        // start from here
        collTmpl: null,
        collHtml: null,
        rendered: false,
        // renders el
        render: function( data ){
            var html, t = this;
            if ( data == null || !_.isObject(data) ) return;
            t.checkTmpl();
            t.checkEl();
            t.el.html(t.tmpl(data));
            this.rendered = true;
        },
        renderColl: function( collData ){
            // must be rendered first and have collEl
            // must have an item view
            // build all the coll html from data
            // plop the collhtml into the collEl
        },
        setCollTmpl: function( collTmpl ){
            this.collTmpl = collTmpl || this.collTmpl;
            this.collTmpl = _.template(this.collTmpl);
        },
        setCollEl: function( collEl ){
            this.collEl = collEl || this.collEl;
            // no jquery cuz need to render first
            if ( this.rendered ) {
                this.collEl = $(this.collEl);
            }
        },
        /**
         * build collection rows from data array
         */
        buildCollHtml: function( collData ){
            var html = '';
            if ( data == null || !_.isArray(data) ) return;
            if ( !this.itemView ) return;
            this.itemView = new this.itemView();
            _.each(collData, function(row, idx){
                html += this.itemView.render(row);
            });
        }
    });
    
    /**
     *  Model
     */
    var BaseModel = Pln.BaseModel = function(opts, instanceData){
        var t = this;
        con(opts, t);
    };
    _.extend(BaseModel.prototype, Klass.prototype, {
        defaults: {},
        props: {},
        validation: {}, // id specific validation options
        pK: 'id',
        set: function(prop, val, opts){
            var attrs, attr, t = this;
            if (!prop) return;

            if ( _.isObject(prop) ) {
                attrs = prop;
                opts = val;
            } else {
                (attrs = {})[prop] = val;
            }
            // perform validation
            if (!t.validate(attrs)) return;

            silent = opts.silent;

            // set the property
            for ( attr in attrs ) {
                t.props[attr] = attrs[attr];
                if (!silent) {
                    t.trigger('change:' + attr, t, opts);
                }
            }
            t.trigger('changed', t, opts);
        },
        has: function(attr){
            return this.propts(attr) != null;
        },
        validate: function(){
            // go through validation object
            // check each prop listed in object against validation type
            // 
            return true;
        },
        toJSON: function(){
            return _.clone(this.props);
        }
    });

    /**
     *  Model - Rest
     */
    var RESTModel = Pln.RESTful = function(opts, instanceData){
        var t = this;
        con(opts, t);
        // when we fetch, set them all
        // when we save, post
        // when we 
    };
    _.extend(RESTModel.prototype, BaseModel.prototype, {
        baseUrl: '',
        url: function(){
            return this.baseUrl;
        },
        ajaxOpts: function(xOpts, opts){
            var t = this;
            xOpts = xOpts || (xOpts = {});
            opts = opts || (opts = {});
            return _.extend({
                type: 'GET',
                url: t.url(),
                success: function(data, status, xhr){
                    t.set(t.parse(data, opts), opts);
                },
                statusCodes: {
                    404: function(){}
                }
                /* 
                    password: ,*/
                    /* username: ,*/
                    /* headers: {
                        'Authorisation': 'Basic' +  btoa(username + ':' password)
                    };
                    /* error: ,*/
            }, xOpts);
        },
        request: function(xOpts, opts) {
            var ajaxOpts = this.ajaxOpts(xOpts, opts);
            return $.ajax(ajaxOpts);
        },
        fetch: function(opts) {
            var xOpts = {};
            return this.request(xOpts, opts);
        },
        save: function(opts) {
            var xOpts = {
                type: 'POST',
                data: this.toJSON()
            };
            return this.request(xOpts, opts);
        },
        destroy: function(opts) {
            var t = this,
                xOpts = {
                    type: 'DELETE',
                    success: function(data, status, xhr){
                        t.clear(opts);
                    }
                };
            return this.request(xOpts, opts);
        },
        parse: function(data, opts) {
            return data;
        }
    });
    
    /**
     *  Model - Web Sockets
     */
    var SocketModel = Pln.SocketModel = function(opts, instanceData){
        var t = this;
        con(opts, t);
        // setup the events
    };
    _.extend(SocketModel.prototype, BaseModel.prototype, {
        url: '',
        onOpen: function(){

        },
        onMessage: function(){
            
        },
        onClose: function(){

        }
    });

    /*
        Model Factory Facade
     */
    // available to configure more model types
    Pln.ModelMaps = {
        rest    : RESTModel,
        socket  : SocketModel,
        basic   : BaseModel
    };
    Pln.defaultModel = 'basic';

    // factory method for creating models
    var Model = Pln.Model = function(opts, instanceData){
        if ( opts.type ) {
            return new Pln.ModelMaps[opts.type](opts, instanceData);
        }
        return new Pln.ModelMaps[Pln.defaultModel](opts, instanceData);
    };

    /**
     *  Pagination
     *
     *  somehow make all models paginate?
     */
    
    /**
     *  Validation
     *
     * generic validation stuff for 
     */

    // Extend method, stolen from backbone.js
    /**
     * Extend a Klass
     * can provide new methods that will persist scope
     * cannot override constructors
     */
    var extend = function(props) {
        var parent = this, 
            child = function(){ return parent.apply(this, arguments); };
        _.extend(child, parent);
        // make a constructor whose con is the funct up there
        var Surrogate = function(){ this.constructor = child; };
        // steal the parents prototype
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;
        if (props) _.extend(child.prototype, props);
        child.__super = parent.prototype;
        return child;
    };
    // attach to all classes
    Klass.extend = Ctrlr.extend = View.extend = Model.extend = extend;

}).call(this, window, document, jQuery, _);