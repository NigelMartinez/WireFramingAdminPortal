window.onload = function () {
	$("#submit").click(function(){
		login();
	});
	
	$(document).bind('keypress', pressed);
	
};

function pressed(e) {
    if(e.keyCode === 13) {
        login();
    }
}
	
function login() {
	var username = $("#username").val();
	var password = $("#password").val();
		
	var userTable;
	var type;
	var userDB;
	var pwdDB;

	$.ajax ({
		type: 'GET',
		url: 'http://131.104.49.63/api/participants',
		dataType: 'json',
		xhrFields: {
			withCredentials: true
		},
		error: function(a, b, c){
			console.log(a);
			console.log(b);
			console.log(c);
		},
		success: function(data) {
			userTable = data;
		}
	}).then(function() {
		for (var i = 0; i < userTable.length; i++){
			userDB = userTable[i].username;
			pwdDB = userTable[i].password;
			
			if(username.toUpperCase() == userDB.toUpperCase() && password == pwdDB) {
				type = userTable[i].type;
				break;
			}
		}
			
		//Clear out form.
		var clearText = document.getElementById("password");
		clearText.focus();
		clearText.value = "";
		//Get message element.
		var msg = document.getElementById("error-message");
			
		if(type == 0) {
			document.cookie = "username=" + username;
			window.location.replace("index.html");
			msg.innerHTML = "";
			msg.parentNode.classList.remove("bg-danger");
		}
		else if(type == 1 || type == 2) {
			msg.innerHTML = "Sorry, you do not have access.";
			msg.classList.add("bg-danger");
		}
		else {
			msg.innerHTML = "Incorrect username or password.";
			msg.classList.add("bg-danger");
		}
	});
}