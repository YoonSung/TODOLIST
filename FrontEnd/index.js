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

//http://commondatastorage.googleapis.com/io-2013/presentations/4057%20Web%20Speech%20API%20creates%20Interactive%20Experiences%20-%20Google%20I-O%202013%20Codelab.pdf
var TodoSpeech = {
	CONSTANT: {
		"LANGUAGE": "ko",
		"ANNOUNCE_SPEECH": "상단의 마이크사용을 허용하면 음성인식모드가 실행됩니다.",
		"ANNOUNCE_START_SPEECH": "음성인식모드가 시작되었습니다.",
		"ANNOUNCE_END_SPEECH": "음성인식모드가 종료되었습니다.",
		"ANNOUNCE_CANNOT_MOVE_SPEECH": "할일 목록이 없습니다. 다른 명령을 제시해주세요",
		"COMMAND" : {
			" 더하기": "create",
			" 지우기": "erase",
			" 취소" : "cancle",
			"다음" : "next",
			" 다음" : "next",
			" 이전" : "prev",
		}
	},
	eSpeechToggle: null,
	eMicToggle: null,
	eDiscription: null,

	recognition: null,
	utterance: null,
	sMessage: "",
	eHeader: null,
	isOnTodoElement: false,

	init: function() {
		//For Test
		//return;

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
		this.recognition.lang = this.CONSTANT.LANGUAGE;
		this.recognition.continuous = true;				//Mic Capture Once true or not (Default is false)
		this.recognition.continuous
		this.recognition.interimResults = true;			//Browser Recognition "Word", Apply result. (Default is false)

		//Initialize SpeechUtterance API
		this.utterance = new SpeechSynthesisUtterance();
		this.utterance.lang = this.CONSTANT.LANGUAGE;

		//Initialize Element
		this.eSpeechToggle = document.querySelector("#speechControl .speech");
		this.eMicToggle = document.querySelector("#mic");
		this.eDiscription = document.querySelector("#speechControl .discription");
		this.eHeader = document.querySelector("#header");

		//Display Speech Toggle Menu
		this.eSpeechToggle.classList.remove("invisible");
		this.eMicToggle.classList.remove("invisible");

		//Appear Speech Toggle on each TODO
		Todo.eList.classList.add("speechPossible");

		//Event Binding
  		this.eventHandler();
	},

	eventHandler: function() {
		this.recognition.onstart = this.listenStart.bind(this);
  		this.recognition.onresult = this.listenResult.bind(this);
  		this.recognition.onend = this.listenEnd.bind(this);

  		//leftTop Speech Control Menu
  		this.eSpeechToggle.addEventListener("click", function(e) {

  			var eSpeechToggleClasses = this.eSpeechToggle.classList;
  			console.log("eSpeechToggleClasses : ",eSpeechToggleClasses);
			console.log("contains? : ",eSpeechToggleClasses.contains("active"));

  			if (eSpeechToggleClasses.contains("active") == true) {
  				this.recognition.stop();

  			} else {
  				this.say(this.CONSTANT.ANNOUNCE_SPEECH);

				this.recognition.start();
  			}

  		}.bind(this));

  		//MIC in TODO inputBox. It is use to be add new Todo by oral
  		this.eMicToggle.addEventListener("click", function(e) {
			console.log("recognition : ",this.recognition);
  			this.recognition.start();
  		}.bind(this));
	},

	say: function(text) {
		this.utterance.text = text;
		speechSynthesis.speak(this.utterance);
	},

	listenStart: function(e) {
		console.log("listenStart");
		this.sMessage = "";
		this.isOnTodoElement = false;

		this.eMicToggle.classList.add("active");
		this.eHeader.classList.add("speechFocus");

		this.eSpeechToggle.classList.add("active");
		this.eDiscription.classList.add("active");

		this.say(this.CONSTANT.ANNOUNCE_START_SPEECH);
	},

	listenEnd: function(e) {
		console.log("listenEnd");
		this.eMicToggle.classList.remove("active");
		this.eHeader.classList.remove("speechFocus");

		this.eSpeechToggle.classList.remove("active");
		this.eDiscription.classList.remove("active");

		this.say(this.CONSTANT.ANNOUNCE_END_SPEECH);

		var eSpeechFocus = document.querySelector("#todo-list > li.speechFocus");

		if (!Util.isUndefinedOrNull(eSpeechFocus)) 
			eSpeechFocus.classList.remove("speechFocus");
	},

	listenResult: function(e) {
		console.log("listenResult");

		var sTranscript = null;
		var eInput = Todo.eInput;

	    for(var i = e.resultIndex; i < e.results.length; ++i) {

	    	sTranscript = event.results[i][0].transcript;
			console.log("hasOwnProperty?: ",this.CONSTANT.COMMAND.hasOwnProperty(sTranscript));

	    	if (event.results[i].isFinal) {
              	// + ' (Confidence: ' + event.results[i][0].confidence + ')';
              	//sTranscript = sTranscript.substring(1, sTranscript.length);

	            //Analyse Command
	            if (this.CONSTANT.COMMAND.hasOwnProperty(sTranscript) == true) {
	            	console.log("testestest");
	            	console.log(this.CONSTANT.COMMAND[sTranscript]);

	            	//When Create Command Request
					if (this.CONSTANT.COMMAND[sTranscript] === "create") {
						eInput.value == "" ? 
							this.say("할일을 입력하세요") 
							: 
							function() {
								Todo.create(this.sMessage, true);
								eInput.value = "";
							}.bind(this)();

					//When Erase Last Input Word
	          		} else if (this.CONSTANT.COMMAND[sTranscript] === "erase") {
	          			var aMessage = this.sMessage.split(" ");

	          			//erase last word
	          			aMessage.pop();

	          			this.sMessage = aMessage.join(" ");
	          			eInput.value = this.sMessage;

	          		//Want to Erase All Input Value
	          		} else if (this.CONSTANT.COMMAND[sTranscript] === "cancle") {
	          			this.sMessage = "";
	          			eInput.value = "";
	          		
	          		//Want to Focus Next Todo
	          		} else if (this.CONSTANT.COMMAND[sTranscript] === "next") {

	          			//First Access
	          			if (this.isOnTodoElement === false) {
	          				var eTarget = document.querySelector("#todo-list > li");

	          				//If List is Empty
	          				if (Util.isUndefinedOrNull(eTarget)) {
	          					this.say(this.CONSTANT.ANNOUNCE_CANNOT_MOVE_SPEECH);
	          					return;

	          				}

	          				this.eHeader.classList.remove("speechFocus");
	          				eTarget.classList.add("speechFocus");
	          				this.isOnTodoElement = true;
	          					

	          			//Already in Todo Element
	          			} else {
	          				var ePrevTarget = document.querySelector("#todo-list > li.speechFocus");
	          				var eCurrentTarget = ePrevTarget.nextElementSibling;

	          				ePrevTarget.classList.remove("speechFocus");
	          				eCurrentTarget.classList.add("speechFocus");
	          			}
	          			this.sMessage = "";
	          			eInput.value = "";

	          		//Want to Focus Previous Todo
	          		} else if (this.CONSTANT.COMMAND[sTranscript] === "prev") {
	          			//First Access
	          			if (this.isOnTodoElement === false) {
	          				this.say(this.CONSTANT.ANNOUNCE_CANNOT_MOVE_SPEECH);
	          				return;
	          			} else {
	          				var ePrevTarget = document.querySelector("#todo-list > li.speechFocus");
	          				var eCurrentTarget = ePrevTarget.previousElementSibling;

	          				ePrevTarget.classList.remove("speechFocus");

	          				if (eCurrentTarget === null) {
	          					this.eHeader.classList.add("speechFocus");
	          				} else {
	          					eCurrentTarget.classList.add("speechFocus");	
	          					this.isOnTodoElement = false;
	          				}
	          			}
	          		}

	          	
				} else {
					this.sMessage += sTranscript;
					eInput.value = this.sMessage;
	          	}

            } else {
              eInput.value = this.sMessage + sTranscript;
            }

            this.eMicToggle.classList.add("on");

			setTimeout(function() {
				this.eMicToggle.classList.remove("on");
	    	}.bind(this), 200);
	    }
	    
	    console.log("sMessage : ", this.sMessage);
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