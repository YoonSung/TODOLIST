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
				
			
			} else if (eClicked.tagName.toLowerCase() === "button") {

				var sClassName = eClicked.className.toLowerCase();

				//Press Speech Button
				if (sClassName === "speech") {
					TodoSpeech.say(eClicked.previousElementSibling.innerText);

				//Press Destroy Button
				} else if (sClassName === "destroy") {	
					var eTargetLi = eClicked.parentNode.parentNode;
					eTargetLi.style.opacity = 0;	

				}
			}
		}.bind(this));

		//Filters Root Object
		document.getElementById("filters").addEventListener("click", function(e) {
			e.preventDefault();

			var eTarget = e.target;
			if (eTarget.tagName.toLowerCase() === "a") {
				var href = eTarget.getAttribute("href");
				href = href.substring(0,1).toUpperCase() + href.substring(1,href.length);

				this["show"+href]();
				history.pushState({"filter": href}, href, href);
			}
		}.bind(this));

		window.addEventListener("popstate",function(e){
			if (e.state) {
				this["show"+e.state.filter]();

			} else {
				this.showAll();
			}
		}.bind(this));

		//Delete Todo When AnimationEnd
    	this.eList.addEventListener("webkitTransitionEnd", this.animationEnd.bind(this));


    	this.eList.addEventListener("dragstart", TodoDrag.start);
		this.eList.addEventListener("dragenter", TodoDrag.enter);
		this.eList.addEventListener("dragover", TodoDrag.over);
		this.eList.addEventListener("dragleave", TodoDrag.leave);
		this.eList.addEventListener("dragend", TodoDrag.end);
		this.eList.addEventListener("drop", TodoDrag.drop);
	},

	changeFilterStatus: function(clickedFilterIndex) {
		this.aFilter[this.nLastFilterIndex].className = "";
		this.aFilter[clickedFilterIndex].className = "selected";
		this.nLastFilterIndex = clickedFilterIndex;
	},

	showAll: function() {
		this.eList.className = "";
		this.changeFilterStatus(0);
	},
	
	showActive: function() {
		this.eList.className = "all-active";
		this.changeFilterStatus(1);
	},

	showCompleted: function() {
		this.eList.className = "all-completed";
		this.changeFilterStatus(2);
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
	storage: null,

	init: function() {

		//init localStorage API
		this.storage = localStorage;
		this.storage.clear();

		window.addEventListener("online", this.online.bind(this));
	},

	online: function() {
		
		console.log(this.storage);

		var length = this.storage.length;

		/*
			{
				"method": method,
				"url": url,
				"parameter": parameter
			}
		*/
		var oRequest = null;

		var method = null;
		var url = null;
		var parameter = null;

		if (length > 0) {

			var nIndex = 0;

			for (var i = 0 ; i < length ; ++i) {
				oRequest = JSON.parse(this.storage.getItem(i));
				console.log(oRequest);

				method = oRequest["method"];
				url = oRequest["url"];
				parameter = oRequest["parameter"];

				//When COMPLETE, DELETE
				//need check id (When delete, complete request By offline Object)
				//
				//CONDITION
				//1. is not undefined or null
				//2. parameter is startWith ("id=")
				if (!Util.isUndefinedOrNull(parameter) && parameter.substring(0, "id=".length).indexOf("id=") > -1) {
					var requestId = parameter.replace("id=", "");

					//Id is Generated at offline Status
					if (requestId < 0) {
						//get RequestData From localStorage, this data is Already modified 
						//(COMPLETE , DELETE Request cannot be located in before CREATE)
						var sRequestData = this.storage.getItem(-1 * requestId);
						var oData = JSON.parse(sRequestData);

						var nLimit = 5;

						while(oData["id"] == null && requestDatanLimit > 0 ) {
							setTimeout(function() {
								sRequestData = this.storage.getItem(-1 * requestId);
								oData = JSON.parse(sRequestData);
							}.bind(this), 500);
						}

						parameter = "id="+oData.id;
					}
				}
				console.log("parameter : "+parameter);
				this.xhr(method, url, parameter, function(oResult) {
					//TODO Catch Exception When XHR Failed!
					console.log(arguments);
					console.log("nIndex : ",nIndex);

					//
					if (oResult["insertId"] !== 0) {
						//When Create Request And Get InsertId
						//Element DataSet Change, 
						//Change LocalStorage Data For If Exists UPDATE or REMOVE request later
						console.log("insertId : ",oResult["insertId"]);
						console.log('li[data-id="' + (-1 * nIndex) + '"]');
						var eTarget = document.querySelector('li[data-id="' + (-1 * nIndex) + '"]');
						console.log("eTarget : ",eTarget);

						eTarget.dataset.id = oResult["insertId"];
						console.log("eTarget : "+eTarget);
						oRequest["id"] = oResult["insertId"];

						console.log("update oRequest : "+oRequest);
						this.storage[nIndex] = JSON.stringify(oRequest);
						++nIndex;
					}

				}.bind(this));

			}
		}

		this.storage.clear();
	},

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

	reorder: function(sourceId, targetId, callback) {
		this.xhr(
			"POST", 
			"http://localhost:8080/reorder", 
			"sourceId="+sourceId
			+"&targetId="+targetId, 
			function(oResult) {
				callback(oResult);
			}	
		);
	},

	xhr: function(method, url, parameter, callback) {
		console.log(arguments);
		if (navigator.onLine) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url, false);
			xhr.onload = function() {
				callback(JSON.parse(xhr.responseText));
			}

			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
			//xhr.load
			xhr.send(parameter);

		} else {

			var length = this.storage.length;

			this.storage.setItem(
				//parameter1
				length,

				//parameter2
				JSON.stringify({
					"method": method,
					"url": url,
					"parameter": parameter,
					"id": null,
				})
			);

			callback({
				"affectedRows": 1,
				"insertId": -1 * length
			});
		}

	},
};

var TodoDrag = {
	eOriginTarget: null,

	start: function(e) {
		this.eOriginTarget = e.target;
		this.eOriginTarget.classList.add("movingTarget");
		e.dataTransfer.effectAllowed = 'move';
		//e.dataTransfer.setData("text/plain", eSource.id);
	},

	enter: function(e) {

		var eTarget = e.target;
		if (eTarget.tagName.toLowerCase() === "label") {
			eTarget = eTarget.parentNode.parentNode;
		} else {
			return;
		}
		
		(this.eOriginTarget == eTarget || this.eOriginTarget.previousElementSibling == eTarget) ? null : eTarget.classList.add("over");		
	},

	over: function(e) {
		if (e.preventDefault) {
			// Allows to drop.
      		e.preventDefault(); 
   		}
		e.dataTransfer.dropEffect = 'move';
    	return false;
	},

	leave: function(e) {
  		var eTarget = e.target;

		if (eTarget.tagName.toLowerCase() === "label") {
			eTarget = eTarget.parentNode.parentNode;
		} else {
			return;
		}
		eTarget.classList.remove('over');
	},

	drop: function(e) {

		// Stops some browsers from redirecting.
		e.stopPropagation(); 
  		e.preventDefault();

  		var eTarget = e.target;

  		if (eTarget.tagName.toLowerCase() === "label") {
			eTarget = eTarget.parentNode.parentNode;
		} else {
			return;
		}

		console.log("eTarget : ",eTarget);

		eTarget.classList.remove('over');
		TodoSync.reorder(this.eOriginTarget.dataset.id, eTarget.dataset.id, function(oResult) {
			console.log(oResult);
			eTarget.parentNode.insertBefore(this.eOriginTarget, eTarget.nextElementSibling);
		}.bind(this));
	},

	end: function(e) {
		this.eOriginTarget.classList.remove("movingTarget");
	}
};

var TodoSpeech = {
	eSpeechToggle: null,
	eMicToggle: null,
	recognition: null,
	utterance: null,

	init: function() {

		//Check Speech Recognition API Support
		if (!('webkitSpeechRecognition' in window))
			return;

		//Check Speech Utterance API Support
		if (Util.isUndefinedOrNull(window.speechSynthesis))
			return;

		/*
		 * Above All API Support, Initialize And Support Function
		 */

		//Initialize SpeechRecognition API
		this.recognition = new webkitSpeechRecognition();

		//Initialize SpeechUtterance API
		this.utterance = new SpeechSynthesisUtterance();
		this.utterance.lang = 'ko';

		this.eSpeechToggle = document.querySelector("#speech");
		this.eMicToggle = document.querySelector("#mic");

		//Display Speech Toggle Menu
		this.eSpeechToggle.classList.remove("invisible");
		this.eSpeechToggle.classList.remove("invisible");

		//Event Binding
  		this.eventHandler();
	},

	eventHandler: function() {
		this.recognition.onstart = this.start;
  		this.recognition.onresult = this.result;
  		this.recognition.onerror = this.error;
  		this.recognition.onend = this.end;

  		this.eSpeechToggle.addEventListener("click", function(e) {

  		});

  		this.eMicToggle.addEventListener("click", function(e) {

  		});
	},

	say: function(text) {
		this.utterance.text = text;
		//window.speechSynthesis(this.utterance);
		//window.speechSynthesis.speak("test");
		//window.speechSynthesis.speak(this.utterance);
		//var u = new SpeechSynthesisUtterance("testest");
		//u.lang = 'ko';
		//u.volume = 1.0;
		//u.text = '안녕. 공부 잘하고 있지?';
		speechSynthesis.speak(this.utterance);
	},

	active: function() {

	},

	disactive: function() {

	},

	start: function() {

	},

	end: function() {

	},

	result: function() {

	},

	error: function() {

	}
};

function init() {

	Todo.init();
	TodoSync.init();
	TodoSpeech.init();

	TodoSync.getAll(function(aTodo) {
		for(var i = 0 ; i < aTodo.length ; ++i) {
			Todo.add(aTodo[i]["id"], aTodo[i]["todo"], aTodo[i]["completed"], false);
			//Todo.add(aTodo[i]["id"], aTodo[i]["todo"], true, false);
		}
	});
}