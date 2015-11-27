window.onload = function () {
	var editMode = false;
	var agencies = [];
	var infos = [];

	document.getElementById("edit-submit-button").addEventListener("click", function() {
		var toggleEdit = document.getElementsByClassName("toggle-edit");
		var contentEditable;
		var buttonText;

		if(editMode == false) {
			editMode = true;
			contentEditable = true;
			buttonText = "Submit";
		} else {
			editMode = false;
			contentEditable = false;
			buttonText = "Edit";
			PutAgencyToDB(agencies, infos, 1);
		}

		for(var i = 0; i < toggleEdit.length; i++) {
			toggleEdit[i].setAttribute("contentEditable", contentEditable);
		}
		this.innerText = buttonText;
	});

	$.ajax ({
		type : 'GET',
		url : 'http://131.104.49.63/api/agency',
		success : function(data) {

			console.log(data);

			for(var i = 0; i < data.length; i++) {
				console.log("agency-" + (i+1));
				var agency = document.getElementById("agency-" + (i+1)).children[0];
				var info = document.getElementById("info-" + (i+1));
				agency.innerText = data[i].name;
				info.innerText = data[i].info;
				agencies.push(agency);
				infos.push(info);
			}
		},
		error : function(a, b, c) {
			console.log(a);
			console.log(b);
			console.log(c);
		}
	});
};

function PutAgencyToDB(agencies, infos, i) {
	console.log("Put Agency");
	if(infos[i-1] != null && agencies[i-1] != null) {

		var json = {
			"name" : agencies[i-1].innerText,
			"info" : infos[i-1].innerText
		};
		console.log(json);

		$.ajax ({
			type : 'PUT',
			url : 'http://131.104.49.63/api/agency/' + i,
			data : json,
			dataType: 'json',
			xhrFields : {withCredentials : true},
			error : function(a, b, c) {
				console.log(a);
				console.log(b);
				console.log(c);
			},
			success : function(a) {
				console.log(a);
			}

		}).then(function() {
			PutAgencyToDB(agencies, infos, i + 1);
		});
	}
}