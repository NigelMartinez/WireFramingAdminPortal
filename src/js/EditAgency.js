window.onload = function () {
	var editMode = false;


	console.log("Text written using JavaScript code!");

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
		}

		for(var i = 0; i < toggleEdit.length; i++) {
			toggleEdit[i].setAttribute("contentEditable", contentEditable);
		}
		this.innerText = buttonText;
	});

};