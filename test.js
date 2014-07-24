//Test Case Principle
//1. Given
//2. When
//3. Then

//==========Initialize==========
//==========Given==========
//==========When==========
//==========Then==========

test("TODO 생성테스트", function() {

	//==========Initialize==========
	oTodo.init();
	var eTodoList = document.getElementById("todo-list");
	var eFakeList = document.getElementById("fake-todo-list");
	
	//==========Given==========
	var sExpectedInnerHTML = "<li>"
                        + "<div class=\"view\">"
                        + "<input class=\"toggle\" type=\"checkbox\">"
                        + "<label></label>"
                        + "<button class=\"destroy\"></button>"
                        + "</div>"
                        + "</li>";

	//==========When==========
	var inputValue = "test"

	oTodo.eInput.value = inputValue;
	oTodo.add();
	eFakeList.insertAdjacentHTML('afterbegin', sExpectedInnerHTML);
	eFakeList.querySelector('label').value= inputValue;

	//==========Then==========	
	var resultLi = eTodoList.querySelector("li");
	var fakeResultLi = eFakeList.querySelector("li");

	equal(resultLi.outerHTML, fakeResultLi.outerHTML);
});

test("TODO 완료테스트", function() {
	//==========Initialize==========
	oTodo.init();
	var eToggle;
	var eLiTarget;
	
	//==========Given==========
	oTodo.add();
	eToggle = document.querySelector(".toggle");
	console.log(eToggle);

	eLiTarget = document.querySelector("#todo-list").children[0];
	equal(eLiTarget.className, "");
	
	//==========When==========
	fireEvent(eToggle,"click");

	//==========Then==========
	equal(eLiTarget.className, "completed");
});