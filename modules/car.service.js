'use strict';

class CarService {

	constructor() {
		this.repository=require('./car.repository');
	}

	async findAll() {
		return await this.repository.findAll();
	}

	 async save(car) {

		return await this.repository.create(car);
	}



	async findById(id) { // be aware: returns a Promise

		 return await this.repository.findById(id);
	}

	async updateById(id, data) {
		return await this.repository.updateById(id, data);
	}

	async deleteById(id) {

		try {
			return await this.repository.deleteById(id);
		}
		catch (error) {
			throw error;
		}
	}

}

module.exports = new CarService();
