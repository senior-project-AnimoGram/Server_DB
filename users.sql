use o2;
show tables;
create table users(
	id int Not null auto_increment,
    userId varchar(50) Not null,
    password varchar(255),
    salt varchar(255),
    nickname varchar(50),
    phone varchar(20),
    primary key(id),
    unique (userId)
) engine = InnoDB;

select * from users;
describe users;