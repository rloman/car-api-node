'use strict';

class PersonService {

	constructor() {
		this.repository=require('./person.repository');
	}

	async findAll() {
		return await this.repository.findAll();
	}

	 async save(person) {

		return await this.repository.create(person);
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

module.exports = new PersonService();
