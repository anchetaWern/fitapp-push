const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.init_push = functions.https.onRequest((request, response) => {
	
	if(request.method == 'POST'){

	  	var id = request.body.id; // ID of the user who made the request
	  	var steps = parseInt(request.body.steps); // latest steps, not recorded yet
	  	var friend_ids = request.body.friend_ids.split(','); 

  		friend_ids.push(id); // also include the ID of the current user
  	
  		// check if user exists
  		admin.database().ref('/users')
			.orderByChild('id')
			.limitToFirst(1)
			.equalTo(id)
			.once('value').then(snapshot => {
       
        		var user_data = snapshot.val();

		        if(user_data){

		        	admin.database().ref('/users')
		        		.once('value').then(snapshot => {

		        			var friends_data = [];
		        			var current_user_data = null;
		        			var notification_data = {};
		        			var has_notification = false;

		        			var users = snapshot.val();
		        			for(var key in users){
		  						var user_id = users[key].id;
		  						
		  						if(friend_ids.indexOf(user_id) != -1 && id != user_id){
		  							friends_data.push(users[key]);
		  						}else if(id == user_id){
		  							current_user_data = users[key];
		  						}
							}

							var sorted_friends_data = friends_data.sort(function(a, b) {
								return b.steps - a.steps;
							}); 

							if(steps > sorted_friends_data[0].steps){
								// notify friend who was overtaken
								var diff_steps = steps - sorted_friends_data[0].steps;
								notification_data = {
									payload: {
										title: 'One of your friends beat your record',
										body: 'Too bad, your friend ' + current_user_data.user_name + ' just overtook you by ' + diff_steps + ' steps'
									},
									device_token: sorted_friends_data[0].device_token
								};
								has_notification = true;
								
							}else if(steps > current_user_data.steps){
								// notify current user
								var diff_steps = steps - current_user_data.steps;
								notification_data = {
									payload: {
										title: 'You beat your record!',
										body: 'Congrats! You beat your current record by ' + diff_steps + ' steps!'	
									},
									device_token: current_user_data.device_token
								};
								has_notification = true;
							}

							if(has_notification){

								var payload = {
							      notification: notification_data.payload
							    };

							    admin.messaging().sendToDevice(notification_data.device_token, payload).then(function(res) {
								    
								    response.send(JSON.stringify({'has_notification': true}));
							  	})
							  	.catch(function(error) {
								    
								    response.send(JSON.stringify(error));
							  	});

							}else{
								response.send(JSON.stringify({'has_notification': false}));
							}

		        		});
		        		
		        }

       
      	});

	}	

});
