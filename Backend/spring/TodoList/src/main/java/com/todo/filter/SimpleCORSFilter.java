package com.todo.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;

@Component
public class SimpleCORSFilter implements Filter{

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {}

	@Override
	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		
		HttpServletRequest request = (HttpServletRequest) req;
		System.out.println("CORS FILTER!! ");
		System.out.println(request.getContentType());
		System.out.println(request.getMethod());
		System.out.println(request.getRequestURI());
		
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
		response.setHeader("Access-Control-Max-Age", "3600");
		response.setHeader("Content-Type", "application/json, application/x-www-form-urlencoded");
		response.setHeader("Access-Control-Allow-Headers", "x-requested-with, Content-Type");
		
		chain.doFilter(req, res);
	}

	@Override
	public void destroy() {}
}

