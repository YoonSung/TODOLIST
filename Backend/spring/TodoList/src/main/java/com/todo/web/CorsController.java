package com.todo.web;

import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Preflight 요청을 처리하기 위한 컨트롤러.
 * 
 * @author mj
 *
 */
@Controller
public class CorsController {
	private static final String ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Request-Method";
	private static final String ACCESS_CONTROL_REQUEST_HEADERS = "Access-Control-Request-Headers";
	private static final String ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods";
	private static final String ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
	private static final String ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age";
	private static final Integer DAY_IN_SECONDS = 24 * 60 * 60;

	/**
	 * Prefilght 요청을 처리한다.
	 * 
	 * @param requestMethods
	 * @param requestHeaders
	 * @param response
	 */
	@RequestMapping(method = RequestMethod.OPTIONS)
	public void handleOptionsRequest(@RequestHeader(value = ACCESS_CONTROL_REQUEST_METHOD, required = false) String requestMethods,
			@RequestHeader(value = ACCESS_CONTROL_REQUEST_HEADERS, required = false) String requestHeaders, HttpServletResponse response) {
		// response 헤더를 request 헤더와 동일하게 만든다. 제한이 필요하다면 필요한 값으로 설정한다.
		if (StringUtils.hasLength(requestMethods)) {
			response.setHeader(ACCESS_CONTROL_ALLOW_METHODS, requestMethods);
		}

		// response 헤더를 request 헤더와 동일하게 만든다. 제한이 필요하다면 필요한 값으로 설정한다.
		if (StringUtils.hasLength(requestHeaders)) {
			response.setHeader(ACCESS_CONTROL_ALLOW_HEADERS, requestHeaders);
		}

		// 브라우저가 preflight 응답을 캐싱하도록 max age를 세팅해준다.
		response.setHeader(ACCESS_CONTROL_MAX_AGE, DAY_IN_SECONDS.toString());
	}
}