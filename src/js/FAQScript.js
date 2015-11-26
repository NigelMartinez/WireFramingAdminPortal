window.onload = function () {
	var editMode = false;
	var questions = [];
	var answers = [];

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

			PutFAQToDB(questions, answers, 1);
		}

		for(var i = 0; i < toggleEdit.length; i++) {
			toggleEdit[i].setAttribute("contentEditable", contentEditable);
		}
		this.innerText = buttonText;
	});

	$.ajax ({
		type : 'GET',
		url : 'http://131.104.49.63/api/Faq',
		success : function(data) {

			for(var i = 0; i < data.length; i++) {
				console.log("question-" + (i+1));
				var question = document.getElementById("question-" + (i+1)).children[0];
				var answer = document.getElementById("answer-" + (i+1));
				question.innerText = data[i].question;
				answer.innerText = data[i].answer;
				questions.push(question);
				answers.push(answer);
			}
		}
	});
};

function PutFAQToDB(questions, answers, i) {
	if(answers[i-1] != null && questions[i-1] != null) {

		var json = {
			"question" : questions[i-1].innerText,
			"answer" : answers[i-1].innerText
		};
		console.log(json);

		$.ajax ({
			type : 'PUT',
			url : 'http://131.104.49.63/api/faq/' + i,
			data : json,
			dataType: 'json',
			xhrFields : {withCredentials : true},
			error : function(a, b, c) {
				console.log(a);
				console.log(b);
				console.log(c);
			}
		}).then(function() {
			PutFAQToDB(questions, answers, i+1);
		});
	}
}