function registEvents() {
	document.querySelector(".c_login").addEventListener('click', loginChoiceONOFF, false);
	document.querySelector(".c_join").addEventListener('click', joinChoiceONOFF, false);
	document.querySelector(".joinArea input[type=submit]").addEventListener('click', join, false);
	document.querySelector(".loginArea input[type=submit]").addEventListener('click', login, false);
}

function login(event) {
	event.preventDefault();
	
	var form = event.currentTarget.form;
	
//	check input value
	var id = form[0].value;
	var password = form[1].value;
	
	if ( id.length ===0 || password.length ===0 ) {
		alert ("아이디와 패스워드를 모두 입력해 주세요");
		return;
	}
	
//	check input value END
	
	
	var formData = new FormData(form);
	var url = "/login";
	var request = new XMLHttpRequest();
	request.open("POST", url, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			var result = request.responseText;

			if ( result === "" ) {
				alert("예기치 못한 에러가 발생하였습니다.\n다시 시도해 주세요.");
			} else if ( result === "pwError" ) {
				alert("비밀번호를 다시 확인해 주세요.");
			} else if ( result === "notExist" ) {
				alert("존재하지 않는 id입니다.\n아이디를 다시 확인해 주세요.");
			} else {
				alert(result +"님 환영합니다.");
				window.location = "/board/list";
			}
		}
	}
	request.send(formData);
}

function join(event) {
	event.preventDefault();

	var form = event.currentTarget.form;
	
//	check input value
	var email = form[0].value;
	var nickname = form[1].value;
	var password = form[2].value;
	var passwordR = form[3].value;
	
	if ( email.length===0 || nickname.length===0 || password.length===0 || passwordR===0 ) {
		alert ("공란은 허용되지 않습니다. 모두 입력해 주세요");
		return;
	}
	
	if ( email.indexOf(".") <= -1 || email.indexOf("@") <= -1 ) {
		alert("이메일 형식에 맞춰 정확하게 입력해 주세요.")
		return;		
	}
	
	if ( password != passwordR ) {
		alert ('입력된 비밀번호가 서로 다릅니다."');
		return;
	}
//	check input value END
	
	
	var formData = new FormData(form);
	var url = "/join";
	var request = new XMLHttpRequest();
	request.open("POST", url, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			var result = request.responseText;
			
			console.log("request.responseText : "+result);
			window.location = "/";
		}
	}
	request.send(formData);
}

function loginChoiceONOFF() {
	event.preventDefault();
	
	var loginNode = document.querySelector(".loginArea");
	var loginNodeStyle = getStyleValue(loginNode, "display");
	var titleNode = document.querySelector(".title");
	titleNode.innerHTML = "Welcome. Please login.";
	titleNode.nextElementSibling.innerHTML = "Cozy Home is waiting for you.";
	
	
	if ( loginNodeStyle == "none" )
		loginNode.style.display="block";
	else
		loginNode.style.display="none";

	loginNode.nextElementSibling.style.display="none";
}

function joinChoiceONOFF() {
	event.preventDefault();
	
	var loginNode = document.querySelector(".joinArea");
	var loginNodeStyle = getStyleValue(loginNode, "display");
	var titleNode = document.querySelector(".title");
	
	titleNode.innerHTML = "Join, and Take Cozy Home.";
	titleNode.nextElementSibling.innerHTML = "Make Your Own Beautiful House";
	
	if ( loginNodeStyle == "none" )
		loginNode.style.display="block";
	else
		loginNode.style.display="none";

	loginNode.previousElementSibling.style.display="none";
}

function init() {
	registEvents();
}

function getStyleValue(node, style) {
	var totalStyle= window.getComputedStyle(node , null);
	return totalStyle.getPropertyValue(style);
}

if ( document.URL.indexOf("list") > -1 ) {
	alert("잘못된 접근입니다. 로그인 후 이용해 주세요");
}

init();