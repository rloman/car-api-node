'use strict';

let bodyParser = require('body-parser');

let express = require('express');
let controller = express();

let carService = require('./modules/car.service');

controller.use(bodyParser.json());

controller.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

controller.get('/api/cars', async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	let cars = await carService.findAll();
	res.end(JSON.stringify(cars));
});


controller.post('/api/cars', async function (req, res) {
	let car = req.body;
	let savedCar = await carService.save(car);
	if (savedCar) {
		res.setHeader('Content-Type', 'application/json')
		// response end with a string of the created and found car
		res.status(201).end(JSON.stringify(savedCar));
	} else {
		// error, we did NOT find a car 
		res.setHeader('Content-Type', 'application/json')
		// so render the common 404 (Not found)
		res.status(404).end();
	}
});

controller.get('/api/cars/:id', async function (req, res) {
	let id = +req.params.id
	let car = await carService.findById(id);
	// OK we found one
	if (car) {
		 res.setHeader('Content-Type', 'application/json')
		//response successful end with a string of the found row
		res.end(JSON.stringify(car));
	} else {
		// error, we did NOT find one
		res.setHeader('Content-Type', 'application/json')
		// so render the common 404 (Not found)
		res.status(404).end();
	}
});


controller.put('/api/cars/:id', async function (req, res) {
	// First read id from params
	let id = +req.params.id
	let inputCar = req.body;
	let updatedCar = await carService.updateById(id, inputCar);
	if (updatedCar) {
		res.setHeader('Content-Type', 'application/json')
		res.end(JSON.stringify(updatedCar));
	} else {
		res.setHeader('Content-Type', 'application/json')
		console.log('Unable to update since a car with id:'+id+' does not exist!');
		res.status(404).end();
	}
});


controller.delete('/api/cars/:id', async function (req, res) {
	let id = +req.params.id;
	 try {
		let result = await carService.deleteById(id);
		if (result) {
			res.status(204).end();// true hence the deletion succeeded
		}
		else {
			res.status(404).end();// false hence the deletion failed (non existing)
		}
	}
	catch (error) {
		res.status(412).end();// false hence the deletion failed because of constraints
	}
});

// set correct time zone
process.env.TZ='Europe/Amsterdam';

// and finally ... run the server :-)
let server = controller.listen(3000, function () {
	console.log('garage app listening at http://%s:%s', server.address().address, server.address().port)
});

