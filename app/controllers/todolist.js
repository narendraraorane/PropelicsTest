/**
* @overview
* This is the controller file for the ToDoList View. The todolist view loads data from
* a model (sqlite), and derives a Sectioned and Indexed (iOS) ListView displaying all items.
* The todolist has one ListView Template for showing list item.
* Also, the ToDoList View have search bar to seaerch item.
*/
var _args = arguments[0] || {}, // Any passed in arguments will fall into this property
	moment = require('alloy/moment'),
	status = 'Pending',
	flag = false;

var colToDoList = Alloy.Collections.instance('todolist');	

/**
 * Appcelerator Analytics Call
 */
var title = _args.title ? _args.title.toLowerCase() : "todolist";
Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".viewed");

/**
 * This function handles the click events for the rows in the ListView.
 * We want to capture the list property associated with the row, and pass
 * it into the next View
 * 
 * @param {Object} Event data passed to the function
 */
function onItemClick(e){
	console.log("e ==> " + JSON.stringify(e));
	if(!flag) {
		flag = true;
		return;
	}
	/**
	 * Appcelerator Analytics Call
	 */
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".contact.clicked");
	
	/**
	 * Get the Item that was clicked
	 */
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	
	/**
	 * Open the profile view, and pass in the user data for this contact
	 */
	var data = colToDoList.toJSON();
	
	_.each(data, function(value, key) {
		if(value.id === item.todo.id) {
			Alloy.Globals.Navigator.open("todoform", {obj: value});
		}		
	});
}

/**
 * This code is only relevant to iOS - to make it cleaner, we are declaring variables, and
 * then assigning them to functions within an iOS Block. On MobileWeb, Android, etc this code block will not
 * exist
 */
var onSearchChange, onSearchFocus, onSearchCancel;

if(OS_IOS){
	
	/**
	 * Handles the SearchBar OnChange event
	 * 
	 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
	 * 				to the ListView
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchChange = function onChange(e){
		$.listView.searchText = $.searchBar.value;
	};
	
	/**
	 * Updates the UI when the SearchBar gains focus. Shows
	 * the Cancel button.
	 * 
	 * @description We used the focus event to show the Cancel button.
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchFocus = function onFocus(e){
		$.searchBar.showCancel = true;
	};
	
	/**
	 * Updates the UI when the Cancel button is clicked within the search bar. Hides the Cancel button.
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchCancel = function onCancel(e){
		$.searchBar.showCancel = false;
		$.searchBar.blur();
	};
}
else if(OS_ANDROID){
	/**
	 * Handles the SearchBar OnChange event
	 * 
	 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
	 * 				to the ListView
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchChange = function onChange(e){
		if($.searchBar.value !==''){
			$.closeBtn.visible = true;
		}
		else{
			$.closeBtn.visible = false;
		}
		
		$.listView.searchText = $.searchBar.value;
	};
	/**
	 * Hides the keyboard when the cancel button is clicked
	 * 
	 * @param {Object} Event data passed to the function
	 */
	onSearchCancel = function onCancel(e){
		$.closeBtn.visible = false;
		$.searchBar.value = '';
		$.searchBar.blur();
	};
}

function onWinFocus() {
	if(status === "Pending") {
		$.btnPending.fireEvent("click");
	} else {
		$.btnCompleted.fireEvent("click");
	}
}

function init() {
	colToDoList.fetch({query: "SELECT * FROM todolist ORDER BY dt_modified DESC"});
	// while (colToDoList.length > 0)
		// colToDoList.at(0).destroy();
}

function doTransform(model) {
    // Need to convert the model to a JSON object
    var transform = model.toJSON();
    transform.dt_modified = moment(transform.dt_modified).fromNow();
    return transform;
}

function addToDoItem() {
	Alloy.Globals.Navigator.open("todoform");
	return;
}

function filterOutput(collection) {
	return collection.where({status: status});
}

function emlShare(e) {
	flag = false; // Just a hack since bubbleParent is not working.
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	var data = colToDoList.toJSON();
	
	_.each(data, function(value, key) {
		if(value.id === item.todo.id) {
			var emailDialog = Ti.UI.createEmailDialog();
			emailDialog.subject = "To Do List";
			emailDialog.toRecipients = ['pablo.guevara@propelics.com', 'carolina.lopez@propelics.com', 'cesar.cavazos@propelics.com'];
			emailDialog.messageBody = '<b>' + value.status + '</b><br/>' + value.content;
			if(value.image && value.image != "") {
				emailDialog.addAttachment(value.image);
			}
			emailDialog.open();			
		}		
	});
}

function smsShare(e) {
	flag = false; // Just a hack since bubbleParent is not working.
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	var data = colToDoList.toJSON();
	
	_.each(data, function(value, key) {
		if(value.id === item.todo.id) {
			if(OS_IOS) {
				sendSMS("+91 1234567890", value.content + "\n" + value.status, value.image);
			} else {
				openSMSIntent("+91 1234567890", value.content, value.status);
			}
		}		
	});
}

function openSMSIntent(phone, content, status) {
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_SENDTO,
		data: 'smsto:' + phone
	});
	intent.putExtra('sms_body', content + " - " + status);
	Ti.Android.currentActivity.startActivity(intent);
}

function sendSMS(phone, content, imageBlob) {
    var module = require('com.omorandi');
    Ti.API.info("module is => " + module);

    //create the smsDialog object
    var smsDialog = module.createSMSDialog();
    //check if the feature is available on the device at hand
    if (!smsDialog.isSupported()) {
        //falls here when executed on iOS versions < 4.0 and in the emulator
        var a = Ti.UI.createAlertDialog({title: 'warning', message: 'the required feature is not available on your device'});
        a.show();
    }
    else
    {
        //pre-populate the dialog with the info provided in the following properties
        smsDialog.recipients = phone ? ['+14151234567'] : [phone];
        smsDialog.messageBody = content;

        //set the color of the title-bar
        smsDialog.barColor = '#E5E4E2';

        //add attachments if supported
        if (smsDialog.canSendAttachments()) {
            Ti.API.info('We can send attachments');
            //add an attachment as a file path
            //smsDialog.addAttachment('images/01.jpg', 'image1.jpg');
			if(imageBlob) {
				var fileName = "" + ".png";
	            smsDialog.addAttachment(imageBlob, filename);
			}
        }
        else {
            Ti.API.info('We cannot send attachments');
        }

        //add an event listener for the 'complete' event, in order to be notified about the result of the operation
        smsDialog.addEventListener('complete', function(e){
            Ti.API.info("Result: " + e.resultMessage);
            var a = Ti.UI.createAlertDialog({title: 'complete', message: 'Result: ' + e.resultMessage});
            a.show();
            if (e.result == smsDialog.SENT)
            {
                //do something
            }
            else if (e.result == smsDialog.FAILED)
            {
               //do something else
            }
            else if (e.result == smsDialog.CANCELLED)
            {
               //don't bother
            }
        });

        //open the SMS dialog window with slide-up animation
        smsDialog.open({animated: true});
    }
	
}

function sortData(e) {
	status = e.source.title;
	$.addClass(e.source, "fontBold");
	if(status === "Pending") {
		$.removeClass($.btnCompleted, "fontBold");
	} else {
		$.removeClass($.btnPending, "fontBold");
	}
	init();
}

function delRow(e) {
	/**
	 * Get the Item that was clicked
	 */
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	var model = Alloy.createModel('todolist', {id: item.todo.id});
	model.destroy();
}

function openPic(e) {
	flag = false;
	Alloy.Globals.Navigator.open("taskpic", {image: e.source.image});
}
