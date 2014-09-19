package com.todo.domain;

public class UploadData {
	
	private String fileName;
	private String type;
	private String extension;
	
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getExtension() {
		return extension;
	}
	public void setExtension(String extension) {
		this.extension = extension;
	}
	
	@Override
	public String toString() {
		return "UploadData [fileName=" + fileName + ", type=" + type + ", extension=" + extension + "]";
	}
	
}
