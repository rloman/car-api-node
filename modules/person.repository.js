'use strict';

let mysql = require('mysql');
const util = require('util');

class PersonRepository {

	constructor() {
		// create a MySQL connection
		this.connection = mysql.createConnection({
			host: 'localhost', 
			database: 'garage', 
			user: 'rloman', 
			password: 'poedel', 
			typeCast: function castField( field, useDefaultTypeCasting ) {
				if (field.type === 'TINY' && field.length === 1) {
					var bytes = field.buffer();
					return( bytes == 1 );
				}
				else {
					return useDefaultTypeCasting();
				}
			}
		});
		this.connection.connect(function (err) {
			if (err) {
				throw err;
			} else {
				// console.log('Connected!');
			}
		});
		this.connection.query = util.promisify(this.connection.query); // Magic happens here.
	}

	async findAll() {
		let persons = await this.connection.query({sql:"select persons.id, persons.name, persons.phone, group_concat(cars.id) as 'carIds' from persons left join cars on persons.id=cars.person_id group by persons.id;", nestTables: ''});
		for(let person of persons) {
			person.cars = [];
			if(person.carIds) {
				for(let carId of person.carIds.split(',')) {
					let rows = await this.connection.query('select * from cars where id=?', [carId]);
					person.cars.push(rows[0]);
				}
			}
			delete person.carIds;
		}

		return persons;
	}

	async create(person) {
		let rowResult = await this.connection.query("insert into persons set ?", [person]);
		let id = rowResult.insertId;

		return await this.findById(id);
	}




	async findById(id) { // be aware: returns a Promise
		// this SHOULD be one row(s) but we have to handle it like there might be more ... 
		let persons = await this.connection.query({sql:"select persons.id, persons.name, persons.phone, group_concat(cars.id) as 'carIds' from persons left join cars on persons.id=cars.person_id where persons.id=? group by persons.id ;", values:[id],  nestTables: ''});
		if(persons && persons[0]) {
			let person=persons[0];
			person.cars = [];
			if(person.carIds) {
				for(let carId of person.carIds.split(',')) {
						let rows = await this.connection.query('select * from cars where id=?', [carId]);
						person.cars.push(rows[0]);
				}
			}
			delete person.carIds;

			return person;
		}
	}

	async updateById(id, data) {
		let resultPacket = await this.connection.query('update persons set name=?, phone=? where id=?', [data.name, data.phone, id]);
		if (resultPacket.affectedRows > 0) {
			// fetch the new row after updating!!!
			let updatedPerson = await this.findById(id);

			return updatedPerson;
		}
		else {
			return false;
		}
	}

	async deleteById(id) {
		try {
			let packetResult = await this.connection.query("delete from persons where id='?'", id);

			return packetResult.affectedRows === 1;
		}
		catch (error) { // happens when deletion fails because of constraints
			throw error;
		}
	}

}
module.exports = new PersonRepository();
