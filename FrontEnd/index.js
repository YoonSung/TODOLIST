var Util = {
	isUndefinedOrNull: function(value) {
		return (value === undefined || value === null);
	}
};

var Todo = {
	eList: null,
	eInput: null,
	eTodoTemplate : null,
	aFilter: [],
	nLastFilterIndex: 0,

    init: function() {
    	this.eList = document.getElementById("todo-list");
    	this.eInput = document.getElementById("new-todo");
    	this.eTodoTemplate = document.getElementById("template-todo");
    	
    	//querySelectorAll Result is not array. convert list to array
		var filterList = document.querySelectorAll("#filters a");
		var length = filterList.length
		for(var i = 0 ; i < length ; ++i) {
			this.aFilter.push(filterList[i]);
		}

    	console.log(this.aFilter);
    	this.eventHandler();
    },

	eventHandler: function() {
		this.eInput.addEventListener("keydown", function(e) {

			//if Press Enter Key
			if (e.keyCode === 13) {
				this.create(this.eInput.value, true);
    		}
    	}.bind(this));

		//Entire Todo's ROOT Element Events. Delegate EventCall
		this.eList.addEventListener("click", function(e) {
			//e.target = trigger element
			//e.currentTarget =  event binding element
			var eClicked = e.target;

			//Press Complete toggle
			if (eClicked.tagName.toLowerCase() === "input") {
				var eTargetLi = eClicked.parentNode.parentNode;
				this.complete(eTargetLi.dataset.id);
				
			//Press Destroy Button
			} else if (eClicked.tagName.toLowerCase() === "button") {
				var eTargetLi = eClicked.parentNode.parentNode;
				eTargetLi.style.opacity = 0;
				
			}
		}.bind(this));

		//Filters Root Object
		document.getElementById("filters").addEventListener("click", function(e) {
			e.preventDefault();

			var eTarget = e.target;
			if (eTarget.tagName.toLowerCase() === "a") {
				var href = eTarget.getAttribute("href");
				href = href.substring(0,1).toUpperCase() + href.substring(1,href.length);

				this.changeFilterStatus(this.aFilter.indexOf(eTarget));
				this["show"+href]();
			}
		}.bind(this));

		//Delete Todo When AnimationEnd
    	this.eList.addEventListener("webkitTransitionEnd", this.animationEnd.bind(this));
	},

	changeFilterStatus: function(clickedFilterIndex) {
		this.aFilter[this.nLastFilterIndex].className = "";
		this.aFilter[clickedFilterIndex].className = "selected";
		this.nLastFilterIndex = clickedFilterIndex;
	},

	showAll: function() {
		console.log("showAll");
	},

	showCompleted: function() {
		console.log("showCompleted");
	},

	showActive: function() {
		console.log("showActive");
	},

    create: function(sTodo, isAnimation) {
    	TodoSync.add(sTodo, function(oResult) {

    		if (oResult["affectedRows"] == 1) {
    			this.add(oResult["insertId"], sTodo, false, isAnimation);
    			this.eInput.value = "";
    		} else {
    			alert ("Sorry! UnExpected Error Occur!! Please Try Again");
    		}
    		
    	}.bind(this));
    },

    add: function(id, sTodo, isCompleted, isAnimation) {
    	if (Util.isUndefinedOrNull(sTodo))
    		return;

    	var sTodoTemplate = this.eTodoTemplate.innerText;

    	if (Util.isUndefinedOrNull(id))
    		id = 0;

		sTodoTemplate = sTodoTemplate.replace(/{id}/, id);
    	sTodoTemplate = sTodoTemplate.replace(/{todo}/, sTodo);
    	
    	sTodoTemplate = ( (isCompleted) == 0 || Util.isUndefinedOrNull(isCompleted) ? 
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

    	TodoSync.complete(id, function(oResult) {
			if (oResult["affectedRows"] == 1) {
				var eTargetLi = document.querySelector('li[data-id="' + id + '"]');
				eTargetLi.className = (eTargetLi.className == "completed") ? "" : "completed";

    		} else {
    			alert ("Sorry! UnExpected Error Occur!! Please Try Again");
    		}
		});
    },

    delete: function(id) {

    	TodoSync.delete(id, function(oResult) {
    		if (oResult["affectedRows"] == 1) {

    			var eTargetLi = document.querySelector('li[data-id="' + id + '"]');
				console.log(this.eList.removeChild(eTargetLi));
				this.eList.removeEventListener("click", this);
    		} else {
    			alert ("Sorry! UnExpected Error Occur!! Please Try Again");
    		}
    	}.bind(this));
    },

	animationEnd: function(e) {
		var eAnimated = e.target;

		if (eAnimated.tagName.toLowerCase() !== "li")
			return;

		var opacity = eAnimated.style.opacity;
		
		if (opacity == 0) {
			Todo.delete(e.target.dataset.id);
		}
	}
};

var TodoSync = {
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

	Todo.init();

	TodoSync.getAll(function(aTodo) {
		for(var i = 0 ; i < aTodo.length ; ++i) {
			Todo.add(aTodo[i]["id"], aTodo[i]["todo"], aTodo[i]["completed"], false);
			//Todo.add(aTodo[i]["id"], aTodo[i]["todo"], true, false);
		}
	});
}