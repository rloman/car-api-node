'use strict';

let mysql = require('mysql');
const util = require('util');

class CarRepository {

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
		let cars = await this.connection.query('select id, licensePlate, mileage, price from cars');

		return cars;
	}

	async create(car) {
		let rowResult = await this.connection.query("insert into cars set ?", [car]);
		let id = rowResult.insertId;

		return await this.findById(id);
	}




	async findById(id) { // be aware: returns a Promise
		// this SHOULD be one row(s) but we have to handle it like there might be more ... 
		let rows = await this.connection.query("select id, licensePlate, mileage, price from cars where id='?'", [id]);
		let car = rows[0];
		if (car) {
			return car;
		}
		else {
			return false;
		}
	}

	async updateById(id, data) {
		let resultPacket = await this.connection.query('update cars set licensePlate=?, mileage=?, price=? where id=?', [data.licensePlate, data.mileage, data.price, id]);
		if (resultPacket.affectedRows > 0) {
			// fetch the new row after updating!!!
			let updatedCar = await this.findById(id);

			return updatedCar;
		}
		else {
			return false;
		}
	}

	async deleteById(id) {
		try {
			let packetResult = await this.connection.query("delete from cars where id='?'", id);

			return packetResult.affectedRows === 1;
		}
		catch (error) { // happens when deletion fails because of constraints
			throw error;
		}
	}

}
module.exports = new CarRepository();
