const express = require('express'); //Require express module to use routes
const router = express.Router(); //use router function from express
const PaintingsController = require('../controllers/painting-controller'); //require controller

router.get('/', PaintingsController.getPaintings); //http GET method to get all registers
router.get('/:painting_id', PaintingsController.getPaintingDetail); //http GET method to get one register by painting_id
router.post('/', PaintingsController.createPainting); //http POST method to insert data from form
router.put('/:painting_id', PaintingsController.updatePainting); //http PUT method to update with data from form
router.delete('/:painting_id', PaintingsController.deletePainting); //http DELETE method to remove one register by painting_id

module.exports = router; //export orutes to use in app.js