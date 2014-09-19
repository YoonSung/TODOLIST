package com.todo.domain;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Todo {
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id;
	
	@Column(length=100, nullable=false)
	private String todo;
	
	@Column(length=1, nullable=false)
	private boolean completed;
	
	@Column(nullable=false)
	private int priority;
	
	@Column
	private Timestamp updatedDate;
	
	@Column
	private Timestamp createdDate;
}
