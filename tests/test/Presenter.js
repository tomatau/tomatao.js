var loginForm = new Pln.Pres.extend({
    tmpl: someHTML,
    
});

///////////////
// Presenter //
// 
// accepts a parent object for super function
// 
// setops function for setting opts object
// 
// has a template
// 
// requires an el (doesn't need to exist already)
// 
// listens to el events
// 
// renders the template in the el
// 
// can be removed
// 
// removes all the events when removed
// 
// should only have ONE model
// 
// needs to be flexible enough to respond to events 
// both when the view has been rendered and not
