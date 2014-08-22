var oUtil = {
	isUndefinedOrNull: function(value) {
		return (value === undefined || value === null);
	}
};

var oTodo = {
	eList: null,
	eInput: null,
	eTodoTemplate : null,

	eventHandler: function() {
		this.eInput.addEventListener("keydown", function(e) {

			//if Press Enter Key
			if (e.keyCode === 13) {
				this.create(this.eInput.value, true);
    		}
    	}.bind(this));

		this.eList.addEventListener("click", this.clickList.bind(this));

		/*
		TODO Browser Detection
		TODO Animation Test
		https://developer.mozilla.org/en-US/docs/Web/Events/transitionend
    	*/
    	this.eList.addEventListener("webkitTransitionEnd", this.animationEnd.bind(this));
	},

    init: function() {
    	this.eList = document.getElementById("todo-list");
    	this.eInput = document.getElementById("new-todo");
    	this.eTodoTemplate = document.getElementById("template-todo");

    	this.eventHandler();
    },

    create: function(sTodo, isAnimation) {
    	oTodoSync.add(sTodo, function(oResult) {

    		if (oResult["affectedRows"] == 1) {
    			this.add(oResult["insertId"], sTodo, false, isAnimation);
    			this.eInput.value = "";
    		} else {
    			alert ("Sorry! UnExpected Error Occur!! Please Try Again");
    		}
    		
    	}.bind(this));
    },

    add: function(id, sTodo, isCompleted, isAnimation) {
    	if (oUtil.isUndefinedOrNull(sTodo))
    		return;

    	var sTodoTemplate = this.eTodoTemplate.innerText;

    	if (oUtil.isUndefinedOrNull(id))
    		id = 0;

		sTodoTemplate = sTodoTemplate.replace(/{id}/, id);
    	sTodoTemplate = sTodoTemplate.replace(/{todo}/, sTodo);
    	
    	sTodoTemplate = ( (isCompleted) == 0 || oUtil.isUndefinedOrNull(isCompleted) ? 
    		//if true
    		sTodoTemplate
    			.replace(/{completed}/, "")
    			.replace(/{checked}/, "")
    		: 
    		//if false
    		sTodoTemplate
    			.replace(/{completed}/, "completed")
    			.replace(/{checked}/, "checked")
    	);
  		

    	this.eList.insertAdjacentHTML('afterbegin', sTodoTemplate);
    	
    	if (isAnimation == true) {
    		this.eList.children[0].style.opacity = 0;
    		//TODO Delete
    		this.eList.offsetHeight;
    		this.eList.children[0].style.opacity = 1;
    	}
    },

    complete: function(id) {

    	oTodoSync.complete(id, function(oResult) {
			if (oResult["affectedRows"] == 1) {
				var eTargetLi = document.querySelector('li[data-id="' + id + '"]');
				eTargetLi.className = (eTargetLi.className == "completed") ? "" : "completed";

    		} else {
    			alert ("Sorry! UnExpected Error Occur!! Please Try Again");
    		}
		});
    },

    delete: function(id) {
    },

    clickList: function(e) {

		//e.target = trigger element
		//e.currentTarget =  event binding element
		var eClicked = e.target;

		//Press Complete toggle
		if (eClicked.tagName == "INPUT") {
			var eTargetLi = eClicked.parentNode.parentNode;
			this.complete(eTargetLi.dataset.id);
			
		//Press Destroy Button
		} else if (eClicked.tagName == "BUTTON") {
			var eTargetLi = eClicked.parentNode.parentNode;
			eTargetLi.style.opacity = 0;
			
		}
	},

	animationEnd: function(e) {
		var eAnimated = e.target;

		if (eAnimated.tagName !== "LI")
			return;

		var opacity = eAnimated.style.opacity;
		
		if (opacity == 0) {
			console.log(this.eList.removeChild(eAnimated));
			this.eList.removeEventListener("click", this);
		}
	}
};

var oTodoSync = {
	getAll: function(callback) {
		this.xhr("GET", "http://localhost:8080/", null, function(aResult) {
			callback(aResult);
		});
	},

	add: function(sTodo, callback) {
		this.xhr(
			"POST", 
			"http://localhost:8080/", 
			"todo="+sTodo, 
			function(oResult) {
				callback(oResult);
			}	
		);
	},

	complete: function(id, callback) {
		this.xhr(
			"PUT", 
			"http://localhost:8080/", 
			"id="+id, 
			function(oResult) {
				callback(oResult);
			}	
		);
	},

	delete: function(id, callback) {
		this.xhr(
			"DELETE", 
			"http://localhost:8080/", 
			"id="+id, 
			function(oResult) {
				callback(oResult);
			}	
		);
	},

	xhr: function(method, url, parameter, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.onload = function() {
			callback(JSON.parse(xhr.responseText));
		}

		xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
		//xhr.load
		xhr.send(parameter);
	},
};

function init() {

	oTodo.init();

	oTodoSync.getAll(function(aTodo) {
		for(var i = 0 ; i < aTodo.length ; ++i) {
			oTodo.add(aTodo[i]["id"], aTodo[i]["todo"], aTodo[i]["completed"], false);
			//oTodo.add(aTodo[i]["id"], aTodo[i]["todo"], true, false);
		}
	});
}