var args = arguments[0] || {};

if(args.image && args.image !== "") {
	$.imgTaskPic.setImage(args.image);	
} else {
	$.imgTaskPic.setImage("/Default.png");
}

