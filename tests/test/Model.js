var loginModel = new Pln.BaseModel.extend({
    pk: "user_id",
    defaults: {
        user_id: "",
        username: "",
        password: "",
    },
    validation: {
        username: {
            required: "You must supply a username!",
            minLength: {
                val: 2,
                msg: "Username must be more than 2 chars",
            },
            regex: {
                val: /^\S+/i
            },
            fn: {
                val: function(val){
                    // do something, return true
                }
            }
        }
    }
});

///////////
// Model //
// 
// 