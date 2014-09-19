DROP TABLE board_data IF EXISTS;

CREATE TABLE board_data (
	id INT PRIMARY KEY AUTO_INCREMENT,
	title VARCHAR(60),
	file_name VARCHAR(100),
	contents BLOB
);