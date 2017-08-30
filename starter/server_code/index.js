const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.init_push = functions.https.onRequest((request, response) => {
	
	if(request.method == 'POST'){

	  	var id = request.body.id; // ID of the user who made the request
	  	var steps = parseInt(request.body.steps); // latest steps, not recorded yet
	  	var friend_ids = request.body.friend_ids.split(','); 

	  	// todo: process request

	}	

});
