CREATE TABLE IF NOT EXISTS sys_token (
    id  BIGINT NOT NULL AUTO_INCREMENT ,
    token VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    expiration_date TIMESTAMP  ,
    PRIMARY KEY (id),
    UNIQUE KEY unique_token (token),
    INDEX idx_user_id (user_id),
    CONSTRAINT `sys_token_user_id` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
)
COMMENT='用户token管理表'
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;