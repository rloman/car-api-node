drop database if exists garage;
create database garage;

use garage;

create table cars (
	id INT primary key AUTO_INCREMENT, 
	licensePlate VARCHAR(255) NOT NULL, 
	mileage INT, 
	price DOUBLE
) engine=InnoDB;

grant all privileges on garage.* to 'rloman'@'localhost' identified by 'poedel';
flush privileges;

