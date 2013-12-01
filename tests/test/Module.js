var hpmodule = Module.extend({
    views: {
        widget: App.Views.Widget, // presenter
        search: App.Views.Search
    },
    model: App.Models.Session,
    viewEvents: {
        'widget.something': 'something'
    },
    init: function(){
        // maybe set some model for control
        // each presenter has 
    },
    something: function(){

    }
});
// modules controller a bunch of MVPs
// 
// modules encapsulate widgets/features/parts of the UI
// 
// modules listen to presenters for more high level control
// 
// modules trigger model events
// 
// presenters listen to models, trigger view events and prepare view data
// 
