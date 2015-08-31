var args = arguments[0] || {},
	moment = require('alloy/moment'),
	imageBlob = "";

function onCameraClick() {
	if (Ti.Media.isCameraSupported) {
	    Titanium.Media.showCamera({
	        success : function(event) {
	        		imageBlob = event.media;
	        		setImage(imageBlob);
	        },
	        cancel : function() {
	        },
	        error : function() {
	        },
	        mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
	        allowImageEditing : true,
	        saveToPhotoGallery : false
	    });
	} else {
		alert('No camera available!');            
	}
	
}

function onGalleryClick() {
    Ti.Media.openPhotoGallery({
        success: function (event) {
        		imageBlob = event.media;
        		setImage(imageBlob);
        },
        cancel : function() {
        },
        error : function() {
        },
        mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
        allowImageEditing : true,
        saveToPhotoGallery : false
    });
}

function setImage(imageBlob) {
	$.imgToDo.setImage(imageBlob);
}

if(args.obj) {
	$.txtContent.color = "#000";
	$.txtContent.value = args.obj.content;
	$.swtchStatus.value = (args.obj.status == "Pending" ? false : true);
	$.imgToDo.image = imageBlob = args.obj.image;
}

function saveToDoItem() {
	var status = $.swtchStatus.value > 0 ? "Completed" : "Pending";
	var content = $.txtContent.value == "Your to do item" ? "" : $.txtContent.value;
	if(args.obj) {
		var model = Alloy.createModel('todolist', {id: args.obj.id});
		if (content !== "") {
			model.set({
				image : imageBlob,
				content : content,
				dt_modified : moment().format(),
				dt_created : moment().format(),
				status : status
			}).save(); 
			Alloy.Globals.Navigator.close($.win);
		} else {
			alert("Error: Content is empty!");
			$.txtContent.focus();
			return;
		}
	} else {
		var modToDoList = Alloy.createModel('todolist', {
			image:imageBlob,
			content: content,
			dt_modified: moment().format(),
			dt_created: moment().format(),
			status: status
		}); 
		// Since set or save(attribute) is not being called, we can call isValid to validate the model object
		if (modToDoList.isValid() && content !== "") {
		    // Save data to persistent storage
	    		modToDoList.save();
		    Alloy.Globals.Navigator.close($.win);
		}
		else {
			$.txtContent.focus();
		    modToDoList.destroy();
		}
	}
}
