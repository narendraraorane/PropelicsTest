var args = arguments[0] || {},
	moment = require('alloy/moment'),
	filePath = "";

function onCameraClick() {
	if (Ti.Media.isCameraSupported) {
	    Titanium.Media.showCamera({
	        success : function(event) {
				saveImage(event.media);                  
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
        		saveImage(event.media);
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

function saveImage(imgBlob){
	var fileName = makeName() + ".png";
	Ti.API.info("fileName ==> " + fileName);
	var fHandle = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileName);	
	fHandle.write(imgBlob);
	filePath = fHandle.nativePath;
	fHandle = null;	
	setImage(filePath);
}

function setImage(imgPath) {
	$.imgToDo.setImage(imgPath);
}

if(args.obj) {
	$.txtContent.color = "#000";
	$.txtContent.value = args.obj.content;
	$.swtchStatus.value = (args.obj.status == "Pending" ? false : true);
	$.imgToDo.image = args.obj.image;
}

function makeName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function saveToDoItem() {
	var status = $.swtchStatus.value > 0 ? "Completed" : "Pending";
	var content = $.txtContent.value == "Your to do item" ? "" : $.txtContent.value;
	var filePath;
	if(args.obj) {
		var model = Alloy.createModel('todolist', {id: args.obj.id});
		filePath = $.imgToDo.image ? $.imgToDo.image : "";
		console.log("path == > " + filePath);
		if (content !== "") {
			model.set({
				image : filePath,
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
			image:filePath,
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
