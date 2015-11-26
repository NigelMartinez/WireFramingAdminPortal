window.onload = function () {
	$("#login-form").submit(function(){
		var username = $("#username").val();
		var password = $("#password").val();
		var userTable;

		$.ajax ({
			type: 'GET',
			url: 'http://131.104.49.63/api/participants',
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
			success: function(data) {
				console.log(data);
			}
		});

	});
};