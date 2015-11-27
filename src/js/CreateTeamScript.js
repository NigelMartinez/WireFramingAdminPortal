// Team Type Enum - 0 is public, 1 is private

var participantTable;

window.onload = function () {
	document.getElementById("submit-button-href").parentNode.addEventListener("click", function() {

		var nameTextBox = document.getElementById("team-name");
		var captainEmailBox = document.getElementById("captain-email");

		var errorLabel = document.getElementById("team-name-error-message");
		var captainErrorLabel = document.getElementById("team-captain-error-message");

		var sendRequest = true;

		/* Get which radio button is checked */
		var radioButtons = document.getElementById("team-type");

		if(nameTextBox.value == "") {
			errorLabel.innerHTML = "Please enter the team name";
			errorLabel.parentNode.classList.add("bg-danger");
			sendRequest = false;
		} else {
			errorLabel.innerHTML = "";
			errorLabel.parentNode.classList.remove("bg-danger");
		}

		if (captainEmailBox.value == "") {
			captainErrorLabel.innerHTML = "Please enter the team captain's email address";
			captainEmailBox.parentNode.classList.add("bg-danger");
			sendRequest = false;
		} else {
			captainErrorLabel.innerHTML = "";
			captainEmailBox.parentNode.classList.remove("bg-danger");
		}

		/*if (nameTextBox.value != "" && captainEmailBox.value != "") {
			window.location.replace("index.html");
		}*/

		var radioChecked;
		if (radioButtons[0].checked){
			radioChecked = 0;
		} else {
			radioChecked = 1;
		}

		//get participant table
		var captainID;
		$.ajax ({
			type : 'GET',
			url : 'http://131.104.49.63/api/participants/',
			dataType : 'json',

			xhrFields: {
				withCredentials: true
		  	},

			error : function(a, b, c){
				console.log("Failed");
			  	console.log(a);
			  	console.log(b);
			  	console.log(c);
		  	},

		  	success : function(data){
	  			participantTable = data;
	  			console.log(participantTable);
		  	}
		}).then(function() {

			// .then is here because we cannot call this function until the ajax
			// call has returned with the data

			for (var i = 0; i < participantTable.length; i++){
				if (participantTable[i].email == captainEmailBox.value){
					captainID = participantTable[i].id;
				}
			}

			var newTeamJson = {
				"name" : nameTextBox.value,
				"type" : radioChecked,
				"capId" : captainID,
				"eventId" : 1
			};

			$.ajax ({
				type : 'POST',
				url : 'http://131.104.49.63/api/team/',
				data : newTeamJson,
				dataType : 'json',
				error : function(a, b, c){
					console.log("Failed");
				  	console.log(a);
				  	console.log(b);
				  	console.log(c);
			  	},
			  	xhrFields: {
					withCredentials: true
			  	}
			}).then(function(){

				//get team table
				var teamTable;
				var teamID;
				$.ajax ({
					type : 'GET',
					url : 'http://131.104.49.63/api/team/',
					dataType : 'json',

					xhrFields: {
						withCredentials: true
				  	},

					error : function(a, b, c){
						console.log("Failed");
					  	console.log(a);
					  	console.log(b);
					  	console.log(c);
				  	},

				  	success : function(data){
			  			teamTable = data;
			  			console.log(teamTable);
				  	}
				}).then(function() {

					// .then is here because we cannot call this function until the ajax
					// call has returned with the data

					for (var i = 0; i < teamTable.length; i++){
						if (teamTable[i].capId == captainID){
							teamID = teamTable[i].id;
						}
					}

					var emails = document.getElementsByClassName("teammember-email");
					console.log(emails);
					for (var i = 0; i < participantTable.length; i++) {

						if (participantTable[i].id == captainID){
							participantTable[i].type = 2;
							participantTable[i].teamId = teamID;
						} else {
							for(var j = 0; j < emails.length; j++) {
								if(emails[j].value == participantTable[i].email) {
									participantTable[i].teamId = teamID;
								}
							}
						}
					};
					updateParticipants(0);
				});
			});
		});
	});
}; /*79 Roehampton Crescent*/


function updateParticipants(i){

	var currentID;

	if (participantTable[i] != null){
		currentID = participantTable[i].id;
		console.log(currentID);
		$.ajax ({
			type : 'PUT',
			url : 'http://131.104.49.63/api/participants/' + currentID,
			data : participantTable[i],
			dataType : 'json',
			error : function(a, b, c){
				console.log("Failed");
			  	console.log(a);
			  	console.log(b);
			  	console.log(c);
		  	},
		  	success : function(a){
	  			console.log("Success");
	  			console.log(a);
		  	},
		  	xhrFields: {
				withCredentials: true
		  	}
		}).then(function(){
			updateParticipants(i+1);
		});
	}	
}
