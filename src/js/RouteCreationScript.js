var routePoints = []; //A list of two tuples holding the coordinates of a route

window.onload = function () {
	var canvas = document.getElementById("viewport");

	var pointOne = null;
	var pointTwo = null;

	context = canvas.getContext('2d');

	base_image = new Image();
	base_image.src = 'img/GuelphMap.png';
	base_image.onload = function() {
		context.drawImage(base_image, 0, 0, 373, 414);
	};

	canvas.addEventListener("click", function(e) {
		var x;
		var y;
		var rect = canvas.getBoundingClientRect();

		x = e.clientX - rect.left;
		y = e.clientY - rect.top;

		if(pointOne == null) {
			pointOne = [x, y];
			context.fillStyle="#FF0000";
		} else {
			pointTwo = [x, y];
			context.fillStyle="#0000FF";
		}

		context.fillRect(x-2, y-2, 7, 7);

		if(pointTwo != null) {
			context.strokeStyle = '#0000FF';
			context.lineWidth = 3;
			context.moveTo(pointOne[0],pointOne[1]);
			context.lineTo(pointTwo[0],pointTwo[1]);
			context.stroke();

			pointOne[0] = pointTwo[0];
			pointOne[1] = pointTwo[1];
		}

		routePoints.push( (x, y) );
	});

	document.getElementById("clear-route").addEventListener("click", function() {
		routePoints = [];
	});

	document.getElementById("submit-button").addEventListener("click", function() {
		var name = document.getElementById("route-name");
		var maxParticipant = document.getElementById("num-participants");
		var checkboxes = document.getElementsByTagName("input");

		var forgotName = document.getElementById("forgot-name");
		if(name.value == "") {
			forgotName.innerHTML = "Please Fill in Team Name";
			forgotName.parentNode.classList.add("bg-danger");
		} else {
			forgotName.innerHTML = "";
			forgotName.parentNode.classList.remove("bg-danger");
		}

		var forgotParticipant = document.getElementById("forgot-participant");
		if(maxParticipant.value == "") {
			forgotParticipant.innerHTML = "Please Fill in Max Amount of Participants";
			forgotParticipant.parentNode.classList.add("bg-danger");
		} else {
			forgotParticipant.innerHTML = "";
			forgotParticipant.parentNode.classList.remove("bg-danger");
		}

		var oneChecked = false;
		for(var i = 0; i < checkboxes.length; i++) {
			if(checkboxes[i].checked) {
				oneChecked = true;
			}
		}

		var forgotChecked = document.getElementById("forgot-checkbox");
		if(!oneChecked) {
			forgotChecked.classList.add("bg-danger");
			forgotChecked.innerHTML = "Please Choose a Route Type";
		} else {
			forgotChecked.classList.remove("bg-danger");
			forgotChecked.innerHTML = "";
		}

		if(document.getElementsByClassName("bg-danger").length == 0) {
			window.location.replace("LajosIndex.html");
		}
	});

	var thing = false;
	var numParticipants = document.getElementById("num-participants");
	numParticipants.addEventListener("keyup", function(e) {
		if(e.keyCode < 48 || e.keyCode > 57 && !(event.keyCode == 46 || event.keyCode == 8)) {
			numParticipants.value = numParticipants.value.slice(0, -1);
		}
	});
};
