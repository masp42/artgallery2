const db = require('../database') //Use MongoDb database with Mongoose ORM
const fs = require('fs') //require file system nodeJs module

//get current date in usual format
const getDateTime = exports.getDateTime = function() {

    let dt = new Date();

    year  = dt.getFullYear();
    month = (dt.getMonth() + 1).toString().padStart(2, "0");
    day   = dt.getDate().toString().padStart(2, "0");
    hour   = dt.getHours().toString().padStart(2, "0");
    minute   = dt.getMinutes().toString().padStart(2, "0");
    second   = dt.getSeconds().toString().padStart(2, "0");

    return year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
}

//Define model to generate database and collection automatically
const paintingSchema = db.Schema({
    canvas_id: { type: String, unique: true, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    artist_name: { type: String, required: true, trim: true },
    artist_country: { type: String, required: true, trim: true },
    artist_period: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    created: { type: String, default: getDateTime() },
    updated: { type: String, default: getDateTime() }
});

//Generate Collection product
const Painting = db.model('canvas', paintingSchema);

//function to get all registers
exports.getPaintings = async function() {
    try {
        const data = await Painting.find().sort({canvas_id: -1})
        return data;
        
    } catch(error){
        console.log(error);
        return false
    }
};


//function to get one register by property id
exports.getPaintingDetail = async function(canvas_id) {
    try {

        const data = await Painting.findOne({ canvas_id: canvas_id }).exec();
        return data;
 
    } catch(error){
        console.log(error);
        return false
    }
}



//function to get one register by property title
exports.getPaintingByTitle = async function(title) {
    try {

        const data = await Painting.findOne({ title: title }, 'canvas_id title').exec();

        if(data !== null){
            return true
        }
        else{
            return false
        }
    
    } catch(error){
        console.log(error);
        return false
    }
}



//function to insert register with object send from form
exports.createPainting = async function(newRegisterData) {
    try {
        //save the new register to database
        new Painting(
            newRegisterData
        ).save().then(() => {
            console.log('registered succesfull')
        }).catch((error) =>{
            console.log('Error to register '.error)
        })
        return true
   
    } catch(error){
        console.log(error);
        return false
    }
}



//function to update register with object send from form
exports.updatePainting = async function(canvas_id,  newRegisterData) {
    try {
        const data = await Painting.findOneAndUpdate(canvas_id, newRegisterData, {
            returnOriginal: false
          });
        return true
   
    } catch(error){
        console.log(error);
        return false
    }
}


//function to delete one register by id
exports.deletePainting = async function(canvas_id) {
    try {

        const data = await Painting.deleteOne({ canvas_id: canvas_id }).exec();

        if(data !== null){
            return true
        }
        else{
            return false
        }   

    } catch(error){
        console.log(error);
        return false
    }
}



//function to convert base64 string to image file
exports.base64ToImage = async function(fileName, base64String) {

    //remove parts of base 64 string is not used
    let base64Image = base64String.split(';base64,').pop();

    //Define filename and extension
    fileName = fileName+'.jpg'

    //path to save converted file
    const pathToSave = 'src/api/uploads/'+fileName

    try{
        //write base64 string to file and save in defined path
        fs.writeFile(pathToSave, base64Image, {encoding: 'base64'}, function() {})
        return fileName

    }catch(error){
        console.log(error);
        return false
    }
    
}



//function to delete image file in server
exports.removeImageFromServer = async function(fileName) {

    //path to delete file
    filePath = 'src/api/uploads/'+fileName+'.jpg'

    try{
        //file system function to delete file
        fs.unlinkSync(filePath)
        return true
    }catch(error){
        console.log(error);
        return false
    }
    
}


//function to generate folder uploads if not exists
exports.generateDirectories = async function(){

    //generate folder uploads if not exists
    if (!fs.existsSync('src/api/uploads/')){
        fs.mkdirSync('src/api/uploads/');
    }

    return true
    
}

