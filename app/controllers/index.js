/**
 * Global Navigation Handler.
 * It handles the navigation accross the app.
 */
Alloy.Globals.Navigator = {
	
	/**
	 * Handle to the Navigation Controller
	 */
	navGroup: $.nav,
	
	open: function(controller, payload){
		var win = Alloy.createController(controller, payload || {}).getView();
		
		if(OS_IOS){
			$.nav.openWindow(win);
		}
		else if(OS_MOBILEWEB){
			$.nav.open(win);
		}
		else {
			
			// added this property to the payload to know if the window is a child
			if (payload.displayHomeAsUp){
				win.addEventListener('open',function(evt){
					var activity=win.activity;
					activity.actionBar.displayHomeAsUp=payload.displayHomeAsUp;
					activity.actionBar.onHomeIconItemSelected=function(){
						evt.source.close();
					};
				});
			}
			win.open();
		}
	},
	close: function(win) {
		if(OS_IOS) {
			$.nav.closeWindow(win);
		} else {
			win.close();
		}
		
	}
};

/**
 * Open the window as per platform.
 * 
 */
if(OS_IOS){
	$.nav.open();
}
else if(OS_MOBILEWEB){
	$.index.open();
}
else{
	$.index.getView().open();
} 
