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
    			this.add();
    			this.eInput.value = "";
    		}
    	}.bind(this));

    	this.eList.addEventListener("click", this.clickList.bind(this));
	},

	init: function() {
		this.eList = document.getElementById("todo-list");
		this.eInput = document.getElementById("new-todo");
		this.eTodoTemplate = document.getElementById("template-todo");

		this.eventHandler();
	},

	add: function() {

		var sInput = this.eInput.value;
		if (oUtil.isUndefinedOrNull(sInput))
			return;

		var sTodo = this.eTodoTemplate.innerText;
		this.eList.insertAdjacentHTML('afterbegin', sTodo.replace(/{}/, sInput));
	},

	clickList: function(e) {

		//e.target = trigger element
		//e.currentTarget =  event binding element
		var eClicked = e.target;

		//Press Complete toggle
		if (eClicked.tagName == "INPUT") {
			var eTargetLi = eClicked.parentNode.parentNode;
			
			if (eTargetLi.className == "completed") {
				eTargetLi.className = "";
			} else {
				eTargetLi.className = "completed";
			}
			
		//Press Destroy Button
		} else if (eClicked.tagName == "BUTTON") {
			var eTargetLi = eClicked.parentNode.parentNode;
			eTargetLi.parentNode.removeChild(eTargetLi);
		}
	}
};