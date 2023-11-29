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
select * from users;
select * from pet;
create table pet(
    userId varchar(50) Not null,
    petName varchar(30),
    breed varchar(30),
    age int,
    primary key(userId)
) engine = InnoDB;
describe users;
describe pet;