tomatao.js
===

A Medium weight Javascript Framework built as a practical learning excersize.

###Concept
Based on the flexibility and simplicity of Backbone JS, this framework aims to:

- reduce load time
- promote the MVP design pattern
- add structural components
- add integration components
- add convenience

####reduced load time
By utilising more of the existing features within jQuery and underscore (which are requirements of backbone), the full and compressed versions of the files for this framework are much smaller.

The framework is currently incomplete, but, already adding a small number of features and covering most existing features; shows a significant reduction in file size.

######Comparison

| Framework | Version | Size |
|-----------|---------|------|
|**backbone.js** | 1.1.0 | *60.515 kb* |
|**backbone.min.js** | 1.1.0 | *19.548 kb* |
|**tomatao.js** | 0.0.1 | *17.29 kb* …29% |
|**tomatao.min.js** | 0.0.1 | *4.42 kb*  …23% |

Once complete, I plan to also release a *'lite'* version that will not contain validation strings and other features that take up many bytes.

##Features


Below is a list of the current and working features:

***Philanthropy*** - This is one of my favourite words and it is at the heart of this Framework… infact it's the namespace, a convenient three letter alternative to longer namespaces such as 'Backbone'.

	var MyEventObj = _.({
		foo: function(){}
	}).extend(Pln.Events); // Pln = Main Namespace

***Base Klass Object*** - A base class is exposed for custom lightweight objects

**'init'** is used instead of **'initialize'** as I always spell it incorrectly and often don't even realise; causing a world of pain!

```javascript
// Extend normally gaining Klass methods
var Parent = Pln.Klass.extend({
	foo: function(){
		return this.bar;
	}
});

// extend through parent definition
// access methods through super
// allows for quick and dirty multiple extension
var Child = Pln.Klass.extend({
	parent: myParent; // extend through super
	bar: "wurp durp";
	init: function(){ // automatically called
		this.once("custom:event", this.super.foo);
	}
});	
```

This exposes an events implementation as well as init and parent (super) access.

***Automatic method binding*** - Within many parts of backbone, methods lose their context. Tomatao JS maintains the original context of each method

***Render and Request*** - Not only can you publish and subscribe to events, you can also make requests; an inversion of the pubsub technique.

```
var foo = new Child.extend({
	parent: Child,
	cheezburger: "YES",
	init: function(){
		this.super.init();
		Pln.response("canihaz:cheezburger",
			function(){
				return this.cheezeburger;
			}
		);
	}
});

// somewhere else completely
var chzbrgr = Pln.request('canihaz:cheezburger);

```
These methods accept options that are passed from the request to the response for further control.

***Presenter Object*** - This is an MVP framework, and so the Backbone's 'View' object could be an equivilent and is for translating Model data into a format suitable for the view (template).  As such, the object is not called a View, it is called a 'Presenter' aka 'Pres'.

```
var Todo = Pln.Pres.extend({
	view: someTemplateHTML,
	el: "selector",
	attrs: {
		id: "my-id",
		klass: "my classname"
	},
	events: {
		'click': 'method'
	},
	modelEvents: {
		'change:name': 'method'
	}
	model: Todo,
	method: function(){}
});
```
***Composite Presenter*** - TBA

***Module*** - A higher level object for orchestrating Views and Models.  This can be seen as used for grouping components or use-cases.  Also TBA.

```
var TodoComponent = Pln.Module.extend({
	model: MyApp.Model.Todo,
	views: {
		todo: MyApp.Pres.Todo
	}
});
```

Features of this are still undecided; currently the Views are all initialized when a module is initialized.  Also the views are cleaned when you call Module.stop().

***Models*** - Basic models are very similar to Backbone Models but have a few syntactical differences along with no implementation.

***Base Model*** - The basic model functionality.

***Rest Model*** - Extends the base model for Restful server communication.

***Socket Model*** - Extends the base model for Web Socket communication.

These are all TBA as SockJS and SocketIO each offer advantages.  You can also add new types through a modelMaps property of Pln.

The default model defaults to 'Base' when you use Pln.Model using a factory.

***Validation*** - I plan to provide a number of basic validation options that will ease validation implementation; such as required, min, max, length, patterns, etc…  These will be possible to bind to both Models and Views.

The implementation of this is also yet to be decided.

##Not Featured
- This framework has no Routing implementation but may do in the future.

- This framework is not designed to be used in NodeJS applications; it is purely for client side UI development.

##TODO
- Validation methods, this is in the works
- Composite Presenters, for binding Collections and rendering of views
- Tests
- Modules
- Model Implementations
- TBA


***
#INCOMPLETE#
This project is incomplete and just a learning excersize for myself.  As such, the requirements have not been confirmed and so I have not bothered with any Unit tests.  This will come once I'm more happy with the expected Use Cases and behaviour!
