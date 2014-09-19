CREATE TABLE IF NOT EXISTS todo (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	todo TEXT NOT NULL,
	completed CHAR(1) DEFAULT 0,
	priority INT NOT NULL,
	updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
 	created_date TIMESTAMP DEFAULT 0
)



DROP PROCEDURE IF EXISTS UPDATE_PRIORITY;

DELIMITER $$
CREATE PROCEDURE UPDATE_PRIORITY(IN sourceID INT, IN targetID INT)
	BEGIN
		DECLARE sourcePriority INT;
		DECLARE targetPriority INT;

		SELECT priority INTO sourcePriority FROM todo WHERE id = sourceID;
		SELECT priority INTO targetPriority FROM todo WHERE id = targetID;

		IF sourcePriority < targetPriority 
			THEN
				UPDATE todo 
				SET priority = priority -1 
				WHERE priority > sourcePriority
				AND priority < targetPriority;

				UPDATE todo
				SET priority = targetPriority-1 
				WHERE id = sourceID;
			ELSE
				UPDATE todo
				SET priority = priority -1
				WHERE priority < targetPriority;

				UPDATE todo
				SET priority = targetPriority-1
				WHERE id = sourceID;
		END IF;
		
	END $$
DELIMITER ;

ALTER TABLE todo AUTO_INCREMENT = 1
select * from todo order by priority desc;
CALL UPDATE_priority(43, 39);
