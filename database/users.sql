use o2;
show tables;
create table users(
	id int Not null auto_increment,
    userId varchar(50) Not null,
    password varchar(255),
    salt varchar(255),
    name varchar(50),
    phone varchar(20),
    primary key(id),
    unique (userId)
) engine = InnoDB;

create table pet(
    userId varchar(50) Not null,
    petName varchar(30),
    breed varchar(30),
    age int,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
) engine = InnoDB;

create table post(
	postId INT PRIMARY KEY AUTO_INCREMENT,
	userId varchar(50) Not null,
    title varchar(40),
    content TEXT,
    imageName varchar(200),
    imagePath varchar(200),
    goodNum int DEFAULT 0,
    commentNum int DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) engine = InnoDB;

CREATE TABLE comment (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    postId INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES post(postId) ON DELETE CASCADE
) engine = InnoDB;
describe users;
describe pet;
describe post;
describe comment;
select * from users;
select * from pet;
select * from post;
select * from comment;
