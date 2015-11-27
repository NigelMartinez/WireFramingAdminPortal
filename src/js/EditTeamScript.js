//Will hold an array of objects with two properties, a "remove" property and a "team" property that will hold the object returned from the database.
//If "remove" is true upon submit being clicked, DELETE requests will be passed to the server.
var teamsArray;

//The index of selected team in the list. NOT the teamId. 0 based, -1 means no teams are available.
var selectedTeamIndex = -1;

//Holds an array of the participants that belong to the current team selected.
var currentParticipantsArray;

//Holds an array of all the participant objects that were modified. Gets added to when an email field was left.
var modifiedParticipantsData = {};

//Holds all invited team members. A simple mapping of a teamId to a list of email address will be enough.
var invitedTeamMembers = {};

/*
 * Populates the global teamsArray variable using the getTeamsFromDB function and then gives each a "remove" property of false.
 */
function populateTeamsArray() {

    var tempArray;

	getTeamsFromDB( function(tempArray) {

    	teamsArray = [];

    	for (team in tempArray) {
    		teamsArray.push({
    			"remove" : false,
    			"team" : team
    		});
    	}
    	alert("Finished in populateTeamsArray with length = " + teamsArray.length);
	});
};

/*
 * Returns an array of team objects from the database.
 */
function getTeamsFromDB(callback) {
	var apiURL;

	var teamsResponse;

	apiURL = getApiURL('team');
	$.ajax ({
			type : 'GET',
			url : apiURL,
			dataType : 'json',

			xhrFields: {
				withCredentials: true
		  	},

			error : function(a, b, c){
				console.log("Unable to retrieve teams from the database.");
			  	console.log(a);
			  	console.log(b);
			  	console.log(c);
		  	},

		  	success : callback

		}).then(function() {
		    console.log("finished the call to getTeamsFromDB");
		});

};

/*
 * Returns an array of participant objects that all have a teamId equal to what which was passed in.
 */
function getTeamMemberObjects(teamId, callback) {
	var apiURL;

	var participantsResponse;

	if (typeof teamId !== 'number') {
		console.log("The passed in teamId was not a typeof number for the getTeamMemberObjects function.");
		return;
	}

	apiURL = 'http://131.104.49.63/api/participants/teamId/' + teamId;
	alert(apiURL);
	$.ajax ({
			type : 'GET',
			url : apiURL,
			dataType : 'json',

			xhrFields: {
				withCredentials: true
		  	},

			error : function(a, b, c){
				console.log("Unable to retrieve participants from the database with a teamId of " + teamId);
			  	console.log(a);
			  	console.log(b);
			  	console.log(c);
		  	},

		  	success : callback
		});

}

/*
 * Takes the teamId of the currently selected team and inserts the list of associated invited email addresses into the DOM with appropriate HTML and CSS
 */
function populateHTMLofInvitedParticipants(teamId) {

    var inviteSection = document.getElementById("invite-members-section");

    var emailList;

    var index = 0;

    var strHTML = "";

    if (typeof teamId !== 'number') {
        console.log("teamId must be a number for populateHTMLofInvitedParticipants");
        return;
    }

    if (teamId in invitedTeamMembers) {
        emailList = invitedTeamMembers[teamId];
        for (email in emailList) {
            strHTML = strHTML.concat('<div class="row"><div class="col-md-1"></div><div class="col-md-2">Email:</div><div class="col-md-4"><textarea rows="1" cols="50" class="email-textbox" id=invite-' + index + '>' + email + '</textarea></div></div>');
            index++;
        }
    }

    //Add an additional blank field
    strHTML = strHTML.concat('<div class="row"><div class="col-md-1"></div><div class="col-md-2">Email:</div><div class="col-md-4"><textarea rows="1" cols="50" class="email-textbox" id=invite-' + index + '></textarea></div></div>');

    inviteSection.innerHTML = strHTML;

    /* add all the field listeners */
    addInviteMemberLeaveEventListeners();

    /* add an event listener for the add button */
    var additionalInvitesButton = document.getElementById("additional-invite");

    additionalInvitesButton.addEventListener("click", function (event) {
        var newStrHTML = "";

        var section = document.getElementById("invite-members-section");

        var newField;

        index = document.getElementsByClassName("email-textbox").length;

        newStrHTML = '<div class="row"><div class="col-md-1"></div><div class="col-md-2">Email:</div><div class="col-md-4"><textarea rows="1" cols="50" class="email-textbox" id=' + index + '></textarea></div></div>';

        section.innerHTML = section.innerHTML + newStrHTML;

        newField = document.getElementById("invite-" + index);

        newField.addEventListener("blur", function (event) {
            var teamId;

            var index;

            index = this.id.toString().slice("-")[1];

            teamId = teamsArray[selectedIndex].team.id;
            if (teamId in invitedTeamMembers) {
                if (index < invitedTeamMembers[teamId.toString()].length) {
                    invitedTeamMembers[teamId.toString()][index] = this.value;
                } else {
                    invitedTeamMembers[teamId.toString()].push(this.value);
                }
            } else {
                invitedTeamMembers[teamId.toString()] = [this.value];
            }

        });
    });
};

/*
 * Sets the HTML of EditTeam.html to contain the teams from the database. Uses the teamArray variable and ignores any teams with the "remove" property set to true.
 */
function populateHTMLofTeams() {
	var TeamListDiv = document.getElementById("TeamList");

	var strHTML = "";

	var bit = 0;

	var team;

    var teamObject;

	for (var i = 0; i < teamsArray.length; i++) {
	    teamObject = teamsArray[i];
		if (!teamObject.remove) {
			team = teamObject.team;
			if (bit == 0) {
				strHTML = strHTML.concat('<div class="row"><div class="col-md-10"><p class="bg-info teams" id="Team-' + i + '">' + team.name + '</p></div><div class="col-md-2"><button class="btn btn-secondary delete-team" id="DeleteTeam-' + i + '">Delete?</button></div></div>');
			} else {
				strHTML = strHTML.concat('<div class="row"><div class="col-md-10"><p class="bg-warning teams" id="Team-' + i + '">' + team.name + '</p></div><div class="col-md-2"><button class="btn btn-secondary delete-team" id="DeleteTeam-' + i + '">Delete?</button></div></div>');
			}
			bit++;
			bit %= 2;
		}
	}


    TeamListDiv.innerHTML = strHTML;

	addDeleteTeamButtonEventListeners();

	addTeamClickEventListeners();
};

/*
 * Injects HTML into the DOM containing all the current team members of the team. Initially taken from the database and then manipulated based on current session modifications.
 */
function populateHTMLofTeamParticipants() {
	//Populate the 'Current Team Members' fields
	//Need to change this to be a callback method
	var teamId = teamsArray[selectedTeamIndex].team.id;

	var data;

	getTeamMemberObjects(teamId, function(data) {

        currentParticipantsArray = data;
    	var id;

    	var teamMembersHTML = document.getElementById("current-team-members");

    	var strHTML = "";

    	var participant;
    	/* Algorithm for determining the emails to load:
    	 * 1. Get all teammembers from the database using the loaded field
    	 * 2. Check if there's already been modifications made to the member fields by looping through the list of participants recieved from the database, and
    	 *    checking for their IDs in the modifications variable.
    	 * 3a. If modifications have been made, check if the teamId still matches the teamId they loaded from. If match, load, otherwise don't
    	 * Proposed structure of the modifications object:
    	 * {
    	 * 	"<teamId>" : {
    	 * 					"<participantId>" : <participantObject>,
    	 * 					"<participantId>" : <participantObject>,
    	 * 				},
    	 *  "<teamId>" : {
    	 * 					"<participantId>" : <participantObject>,
    	 * 					"<participantId>" : <participantObject>,
    	 * 				}
    	 * }
    	 */

    	var toLoad;

    	var memberEmailCount = 0;

    	for (var i = 0; i < currentParticipantsArray.length; i++) {
    	    participant = currentParticipantsArray[i];
    		id = participant.id;
    		teamId = participant.teamId;

    		if (teamId in modifiedParticipantsData) {
    			if (id in modifiedParticipantsData[teamId.toString()]) {
    				if (modifiedParticipantsData[teamId.toString()][id.toString()].teamId == teamId) {
    					toLoad = modifiedParticipantsData[teamId.toString()][id.toString()];
    				} else {
    					continue;
    				}
    			} else {
    				toLoad = participant;
    			}
    		} else {
    			toLoad = participant;
    		}

    		strHTML = strHTML.concat('<div class="row"><div class="col-md-1"></div><div class="col-md-2">Email: </div><div class="col-md-4"><textarea rows="1" cols="50" class="email-textbox" id="email-textbox-' + participant.email + '-' + participant.id + '-' + participant.teamId + '-' + memberEmailCount + '">' + toLoad.email + '</textarea></div><div class="col-md-4"><button class="delete-button remove-participant" id="remove-' + participant.email + '">Remove?</button></div></div>');
    		memberEmailCount++;
    	}



        if (currentParticipantsArray.length > 0) {
            teamMembersHTML.innerHTML = strHTML;

        	addRemoveParticipantButtonEventListeners();

        	addTeamMemberLeaveEventListeners();
    	} else {
    	    teamMembersHTML.innerHTML = '<div class="row"><div class="col-md-3"></div><div class="col-md-9">No Members</div></div>';
    	}
    });
}

/*
 * Deletes the team with the id specified from the database. This is a permanent deletion.
 */
function deleteTeamFromDB(id) {

	if (typeof id !== 'number') {
		console.log("Must pass a number to deleteTeamFromDB.");
		return false;
	}
	var success;

	var apiURL;

	apiURL = getApiURL('team', id);

	$.ajax ({
		type : 'DELETE',
		url : apiURL,

		xhrFields: {
			withCredentials: true
	  	},

		error : function(a, b, c){
			console.log("Unable to delete the team with id=" + id + " from the database.");
		  	console.log(a);
		  	console.log(b);
		  	console.log(c);
		  	success = false;
	  	},

	  	success : function(data){
	  		success = true;
  			console.log(data);
	  	}

	}).then( function() {
		return success;
	});
}

/*
 * Adds click listeners to the teams
 */
function addTeamClickEventListeners() {
    var teamObject;

    var element;

    if (teamsArray.length != 0) {
        //Add click methods to each of the teams in the list

        for (var i = 0; i < teamsArray.length; i++) {
            teamObject = teamsArray[i];
            if (!teamObject.remove) {


                document.getElementById("Team-" + i).addEventListener("click", function() {
                    var index = parseInt(this.id.split("-")[1]);
                    selectedTeamIndex = index;
                    alert("Calling populateFormInformation with selected index of " + selectedTeamIndex);
                    populateFormInformation();
                });
            }
        } /* end of for loop of teams in teamsArray */
    }

};

/*
 * Adds event listeners to the buttons added from the populateHTMLofTeams function.
 */
function addDeleteTeamButtonEventListeners() {
	var teamObject;

	var element;

	if (teamsArray.length != 0) {
		//Add delete methods to each of the buttons just added to the html

		for (var i = 0; i < teamsArray.length; i++) {
		    teamObject = teamsArray[i];
			if (!teamObject.remove) {


				document.getElementById("DeleteTeam-" + i).addEventListener("click", function() {
				    var index = parseInt(this.id.split("-")[1]);
					if (!teamsArray[index].remove && window.confirm("Are you sure you'd like to remove the " + teamsArray[index].team.name + " team?")) {
						teamsArray[index].remove = true;
						populateHTMLofTeams();
						addDeleteTeamButtonEventListeners();
					}
				});
			}
		} /* end of for loop of teams in teamsArray */
	}

};

/*
 * Adds a leave listener to all invite member fields to update the invitedMembers variable
 * class="email-textbox" id=' + index + '>

   id="additional-invite"

 */
function addInviteMemberLeaveEventListeners() {
    /* get all invite team member text areas */
    var allFields = document.getElementsByClassName("email-textbox");

    var textField;

    //alert(allFields.)

    for (var i = 0; i < allFields.length; i++) {
        textField = allFields[i];

        textField.addEventListener("blur", function (event) {
            var teamId;

            var index;

            index = this.id.toString().slice("-")[1];

            teamId = teamsArray[selectedTeamIndex].team.id;
            if (teamId in invitedTeamMembers) {
                if (index < invitedTeamMembers[teamId.toString()].length) {
                    invitedTeamMembers[teamId.toString()][index] = this.value;
                } else {
                    invitedTeamMembers[teamId.toString()].push(this.value);
                }
            } else {
                invitedTeamMembers[teamId.toString()] = [this.value];
            }

        });
    }
};

/*
 * Adds event listners to the text-areas containing the emails so that they will be updated if they are entered and then left, implying (possible) change.
 */
function addTeamMemberLeaveEventListeners() {
	/* get all team-member text-area objects */
    var textAreas = document.getElementsByClassName("email-textbox"); //id="email-textbox-' + memberEmailCount + '")

    var textArea;

    //id form:  id="email-textbox-' + participant.email + '-' + participant.id + '-' + participant.teamId + '
	/*
	 * loop through all text-area objects
	 *     /Assign the leave event
	 *         /get teamId and Id of participant
	 *         /update entry in the map for email, or add it if not there
	 */
	for (var i = 0; i < textAreas.length; i++) {
	    textArea = textAreas[i];

        textArea.addEventListener("blur", function( event ) {

            var parId;

            var parTeamId;

            var idParts;

            var index;

            var modifiedParticipantObject;

            idParts = this.id.toString().split("-");
            parId = idParts[idParts.length - 3];
            parTeamId = idParts[idParts.length - 2];
            index = parseInt(idParts[idParts.length - 1]);
            alert("currentParticipantsArray.length = " + currentParticipantsArray.length + ", this.id = " + this.id + ", index = " + index);

            modifiedParticipantObject = {
                "id" : currentParticipantsArray[index].id,
                "name" : currentParticipantsArray[index].name,
                "email" : currentParticipantsArray[index].email,
                "username" : currentParticipantsArray[index].username,
                "password" : currentParticipantsArray[index].password,
                "teamId" : currentParticipantsArray[index].teamId,
                "accessibleStatus" : currentParticipantsArray[index].accessibleStatus,
                "studentStatus" : currentParticipantsArray[index].studentStatus,
                "busStatus" : currentParticipantsArray[index].busStatus,
                "participantStatus" : currentParticipantsArray[index].participantStatus,
                "type" : currentParticipantsArray[index].type
            };

            if (parTeamId in modifiedParticipantsData) {
                if (parId in modifiedParticipantsData.parTeamId) {
                    modifiedParticipantsData.parTeamId.parId.email = this.value;
                } else {
                    modifiedParticipantsData.parTeamId.parId = modifiedParticipantObject;
                    modifiedParticipantsData.parTeamId.parId.email = this.value;
                }
            } else {

                modifiedParticipantObject.email = this.value;
                modifiedParticipantsData.parTeamId = { parId : modifiedParticipantObject };
                alert(modifiedParticipantsData.parTeamId.parId.email);
            }
        });
	}
}
/*
 * Adds event listeners to the buttons added to remove team members from teams.
 */
function addRemoveParticipantButtonEventListeners() {
	var removeButtons = document.getElementsByClassName("remove-participant");

	var rmButton;



	var apiURL;

	var id;

	var teamId;

	var inModifiedParticipantsData = false;

	for (var i = 0; i < removeButtons.length; i++) {

	    rmButton = removeButtons[i];
		rmButton.addEventListener("click", function() {
			/* get the email */
            var participantObject;

			/* make a database call */
			apiURL = getApiURL("participant", rmButton.id.toString().slice(7));
			alert(apiURL);
			$.ajax({
				type : 'GET',
				url : apiURL,
				dataType : 'json',

				xhrFields: {
					withCredentials: true
			  	},

				error : function(a, b, c){
					console.log("Unable to retrieve teams from the database.");
				  	console.log(a);
				  	console.log(b);
				  	console.log(c);
			  	},

			  	success : function(data){
		  			participantObject = data[0];
		  			console.log(participantObject);
			  	}

			}).then(function() {
				/* enter it in the variable of modifications with a teamId of -1 */
				id = participantObject.id;

				teamId = participantObject.teamId;

				if (teamId in modifiedParticipantsData) {
					if (id in modifiedParticipantsData[teamId.toString()]) {
						modifiedParticipantsData[teamId.toString()][id.toString()].teamId = -1;
					} else {
						participantObject.teamId = -1;
						modifiedParticipantsData[teamId.toString()][id.toString()] = participantObject;
					}
				} else {
					participantObject.teamId = -1;
					var key = participantObject.id.toString();
					modifiedParticipantsData[teamId.toString()] = { key : participantObject };
				}

				/* redraw the html for team members */
				populateHTMLofTeamParticipants();
			});

		});
	}
}

/*
 * A simple method to call that would populate the entire form, to be called when a different team is selected.
 */
function populateFormInformation() {
	var team = teamsArray[selectedTeamIndex].team;

	//Set the team name
	var teamNameField = document.getElementById("team-name");

	teamNameField.innerHTML = team.name;

	//Set the team privacy
	var teamPrivacyField = document.getElementById("team-type");

	var elements = document.getElementsByName("team-type");

	if (team.type == 0) {
		for (var i = 0; i < elements.length; i++)
		{
		    if (elements[i].value == "Public")
		    {
		        elements[i].checked = true;
		    }
		}
	} else if (team.type == 1) {
		for (var i = 0; i < elements.length; i++)
		{
		    if (elements[i].value == "Private")
		    {
		        elements[i].checked = true;
		    }
		}
	} else {
		console.log("Team with id " + team.id + " has an illegal type set. Check the data.");
	}


	//Populate the current team members fields
	populateHTMLofTeamParticipants();


	//Populate the 'Invite Team Members' fields
	/* this field will solely be populated by the user during sessions, so no database loading is required */
	populateHTMLofInvitedParticipants(team.id);



	//Populate the 'Route Selection' fields
};



window.onload = function () {
	/* populate the team list */
	var tempArray;

	var tempteam; //to be removed

	var team;

    getTeamsFromDB( function(tempArray) {

        teamsArray = [];

        for (var i = 0; i < tempArray.length; i++) {
            team = tempArray[i];
            teamsArray.push({
                "remove" : false,
                "team" : team
            });
        }
        populateHTMLofTeams();
    });

	/* populate data form */
	var teamNameBox = document.getElementById("team-name");
	teamNameBox.addEventListener("blur", function() {
	    if (selectedTeamIndex > -1) {
	        teamsArray[selectedTeamIndex].team.name = teamNameBox.value;
	        populateHTMLofTeams();
	    }
	});

	/* attach functions to the buttons */
	document.getElementById("submit-button").addEventListener("click", function() {

        var teamObject;

		/* loop through all team objects and confirm their names have not been changed */
		for (var i = 0; i < teamsArray.length; i++) {
		    if (teamsArray[i].team.name == "") {
		        alert("The team in position " + (i + 1) + " of the list does not have a name. All teams must have names before submission.");
		        return;
		    }
		}

		if (window.confirm("Are you sure you'd like to confirm your changes?")) {
			/* cycle through all the teams in the team array, updating the information */
			for (var i = 0; i < teamsArray.length; i++) {
			    teamObject = teamsArray[i];
				if (teamObject.remove) {
					if (!deleteTeamFromDB(teamObject.team.id)) {
						//To be used later when proper callbacks are utilized
					}
				} else {

				}
			}

			/* cycle through all the modified participant changes and update them in the database */

			for (var teamId in modifiedParticipantsData.keys) {
			    for (var parId in modifiedParticipantsData.teamId) {
			        apiURL = getApiURL('participant', parseInt(parId));
			        alert(apiURL);
			        $.ajax ({
			           type : 'PUT',
                        url : apiURL,
                        data : modifiedParticipantsData.teamId.parId,
                        dataType : 'json',
                        error : function(a, b, c){
                            console.log("Failed to update participant with ID =" + participant.id);
                            console.log(a);
                            console.log(b);
                            console.log(c);
                        },
                        xhrFields: {
                            withCredentials: true
                        }
			        });
			    }
			}
		}
	});

	document.getElementById("cancel-button").addEventListener("click", function() {
	    if (!window.confirm("Are you sure you'd like to erase all pending changes?")) {
	        return;
	    }

        getTeamsFromDB( function(tempArray) {

            teamsArray = [];

            for (var i = 0; i < tempArray.length; i++) {
                team = tempArray[i];
                teamsArray.push({
                    "remove" : false,
                    "team" : team
                });
            }
            populateHTMLofTeams();
        });

        var selectedTeamIndex = -1;

        var currentParticipantsArray;

        var modifiedParticipantsData = {};

        var invitedTeamMembers = {};

        alert("All pending changes have been erased.");
	});

};


var getApiURL = function (entityName, identifier) {
	if (typeof entityName !== 'string') {
		return;
	}

	if (typeof identifier === 'undefined') {
		switch (entityName.toLowerCase()) {
			case 'team':
				return "http://131.104.49.63/api/team/";
			case 'participant':
				return "http://131.104.49.63/api/participants/";
			case 'route':
				return "http://131.104.49.63/api/route/";
			case 'waiver':
				return "http://131.104.49.63/api/waiver/";
			case 'faq':
				return "http://131.104.49.63/api/faq/";
			case 'agency':
				return "http://131.104.49.63/api/agency/";
			default:
				console.log("An incorrect entity name was passed into the getApiURL function. The entity name was " + entityName.toLowerCase());
				break;
		}
	} else {
		switch (entityName.toLowerCase()) {
			case 'team':
				return "http://131.104.49.63/api/team/" + identifier;
			case 'participant':
				if (typeof identifier === 'number') {
					return "http://131.104.49.63/api/participants/" + identifier;
				} else {
					return "http://131.104.49.63/api/participants/email/" + identifier;
				}
			case 'route':
				return "http://131.104.49.63/api/route/" + identifier;
			case 'waiver':
				return "http://131.104.49.63/api/waiver/" + identifier;
			case 'faq':
				return "http://131.104.49.63/api/faq/" + identifier;
			case 'agency':
				return "http://131.104.49.63/api/agency/" + identifier;
			default:
				console.log("An incorrect entity name was passed into the getApiURL function. The entity name was " + entityName.toLowerCase());
				break;
		}
	}
};