exports.definition = {
	config: {
		columns: {
			id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		    "image": "TEXT",
		    "content": "TEXT",
		    "status": "Varchar(9)",
		    "dt_modified": "TEXT",
		    "dt_created": "TEXT",
		    "isDeleted": "boolean"
		},
        "defaults": {
            "image": "",
            "status": "Pending",
		    "isDeleted": false
        },		
		adapter: {
			type: "sql",
			collection_name: "todolist",
			idAttribute: 'id'
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
            // Extend, override or implement Backbone.Model 
            // Implement the validate method						
            validate: function (attrs) {
	    	        for (var key in attrs) {
	                    var value = attrs[key];
	                    if (key == "content") {
	                        if (value.length <= 0) {
	                        		alert("Error: Content is empty!");
	                            return -1;
	                        }
	                    }
	            }
	        }
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here

			// For Backbone v1.1.2, uncomment the following to override the
			// fetch method to account for a breaking change in Backbone.
			/*
			fetch: function(options) {
				options = options ? _.clone(options) : {};
				options.reset = true;
				return Backbone.Collection.prototype.fetch.call(this, options);
			}
			*/
			comparator: function(todo) {
				return todo.get('status');
			}			
		});

		return Collection;
	}
};
