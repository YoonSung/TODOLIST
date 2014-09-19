<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<link type="text/css" rel="stylesheet" href="/stylesheets/reset.css" />
<link type="text/css" rel="stylesheet" href="/stylesheets/index.css" />
<title>CozyHome</title>
</head>
<body>
	<div class="bgImg"></div>
	<div class="interactBox">
		<h1 class="title">
			Welcome. Please login.
		</h1>
		<p>
			<span>Cozy Home is waiting for you.</span>
		</p>

		<div class="choiceBlock">
			<a href="#" class="choice c_login">LOGIN</a>
			<a href="#" class="choice c_join">JOIN</a>
			<span class="devider">OR</span>
		</div>

		<div class="loginArea">
			<form action="/login" method="post">
				<p>
					<input type="text" name="id" placeholder="Email" />
				</p>
				<p>
					<input type="password" name="password" placeholder="Password" />
				</p>
				<p>
					<input type="submit" value="Enter House" />
				</p>
			</form>
		</div>
		
		<div class="joinArea">
			<form action="#" method="post">
				<p>
					<input type="text" name="id" placeholder="Email" />
				</p>
				<p>
					<input type="text" name="nickname" placeholder="Nickname" />
				</p>
				<p>
					<input type="password" name="password" placeholder="Password" />
				</p>
				<p>
					<input type="password" name="passwordR" placeholder="Password Confirm" />
				</p>
				<p>
					<input type="submit" value="Create own Home" />
				</p>
			</form>
		</div>
		
	</div>
	<script src="/javascripts/index.js"></script>
</body>
</html>