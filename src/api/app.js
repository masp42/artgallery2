const express = require('express'); //Use express to manage routes
const fileUpload = require('express-fileupload'); //Use express-fileupload to allow receive form data
const cors = require('cors') //Control request from origins


const app = express();


const paintingRoute  = require('./routes/painting-route');

app.use(
    express.json(), //Receive JSON data
    express.static("src/view"), //Allow static file path - src/view
    express.static('src/api/uploads'), //Allow static file path - src/api/uploads
    fileUpload() //allow form data upload
)

app.use(cors()) //This is CORS-enabled for all origins

/* VIEW route - GET method */
app.get('/', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.sendFile('src/view/');
})


app.use('/api/canvas', paintingRoute);
//if route nor found
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

//default server error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({ error: error });
});

module.exports = app; //export to use this file configuration in others files