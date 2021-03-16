const sanitizer = require('sanitizer'); //Module used to sanitize form data
const striptags = require('striptags'); //module used to remove tags of form 
const isBase64 = require('is-base64'); //module used to verify if data is base64 string
const PaintingsModel = require('../models/Paintings'); 


exports.getPaintings = async (req, res, next) => {
    try {

        await PaintingsModel.generateDirectories()

        //Call model function getPaintings()
        const result = await PaintingsModel.getPaintings();
        return res.status(200).send({data: result.map(transformer)});
  

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};




exports.getPaintingDetail = async (req, res, next)=> {
    try {

        await PaintingsModel.generateDirectories()

        let painting_id = '';

        //varify if id from front-end is valid
        if(req.params.painting_id > 0){
            //sanitize data from form
            painting_id = sanitize(req.params.painting_id);
        }
        else{
            //error message
            return res.status(202).send({error: 'ID not defined'})
        }


        //Call model function getPaintingDetail(painting_id)
        const result = await PaintingsModel.getPaintingDetail(painting_id);
            
        //if not found register
        if (!result) {
            return res.status(404).send({error: 'painting not found'})
        }

        //format result to show in route
        const response = {data: [transformer(result)]}

        return res.status(200).send(response);   


    } catch (error) {
        return res.status(500).send({ error: error });
    }
};



exports.createPainting = async (req, res, next) => {
    try {

        await PaintingsModel.generateDirectories()

        //define object
        newRegisterData = {}

        //GENERATE ID with timestamp
        let d = new Date();
        newRegisterData.painting_id = d.getTime();

        //sanitize all data from form 
        newRegisterData.title = sanitize(req.body.title)
        newRegisterData.description = sanitize(req.body.description)

        newRegisterData.artist_name = sanitize(req.body.artist_name),
        newRegisterData.artist_country = sanitize(req.body.artist_country),
        newRegisterData.artist_period = sanitize(req.body.artist_period),


        newRegisterData.image = sanitize(req.body.image)

        //verify if data from form is empty
        if(
            isEmpty(newRegisterData.title) ||
            isEmpty(newRegisterData.description) ||
            isEmpty(newRegisterData.artist_name) ||
            isEmpty(newRegisterData.artist_country) ||
            isEmpty(newRegisterData.artist_period) 
        ){
            return res.status(500).send({error: 'blank fields'})
        }


        //verify if this title exists in some register
        const registerExist = await PaintingsModel.getPaintingByTitle(newRegisterData.title)
    
        if(registerExist){
            return res.status(202).send({error: 'This title already exists'}) 
        } 


        if(isEmpty(newRegisterData.image)){
            newRegisterData.image = generateBlankBase64Image();
        }

        //verify if base64 string is valid
        if(isBase64(newRegisterData.image, {allowMime: true})){
            //create file with painting_id to generate name and image(base64_string)
            newRegisterData.image = await PaintingsModel.base64ToImage(newRegisterData.painting_id, newRegisterData.image)
        }
        else{
            return res.status(500).send({error: 'base64 image is not valid'})
        }
        

        //call function to insert data
        const result = await PaintingsModel.createPainting(newRegisterData);

                    
        //if result is not false, define formated data to send to route
        if(result){

                const link = req.protocol+'://'+req.get('host')+req.originalUrl
                const response = {
                    message: 'Painting created sucessfully',
                    createdPainting: {
                        painting_id: newRegisterData.painting_id,
                        title: newRegisterData.title,
                        description: newRegisterData.description,
                        name: newRegisterData.artist_name,
                        country: newRegisterData.artist_country,
                        period: newRegisterData.artist_period,
                        image: newRegisterData.image,
                        request: {
                            type: 'GET',
                            description: 'Return all paintings',
                            url: link
                        }
                    }
                }
                return res.status(201).send(response);   
        }

         else{
            return res.status(500).send({ error: 'Error at create painting' });
        }

        


    } catch (error) {
        return res.status(500).send({ error: error });
    }
};





exports.updatePainting = async (req, res, next) => {

    try {

        let result = false;

        let painting_id = '';

        //verify if id from front-end is valid
        if(req.params.painting_id > 0){
            painting_id = sanitize(req.params.painting_id);
        }
        else{
            return res.status(500).send({error: 'ID not defined'})
        }

        //Verify if registers with this painting_id exists
        const findPainting = await PaintingsModel.getPaintingDetail(painting_id);

        //If register exists
        if(findPainting !== null){
            
            newRegisterData = {}


            newRegisterData.painting_id = painting_id;


            // if data from form is equals data from json file

            if(findPainting.title == sanitize(req.body.title)){
                newRegisterData.title = findPainting.title;
            }
            else{
                newRegisterData.title = sanitize(req.body.title);
            }


            if(findPainting.description == sanitize(req.body.description)){
                newRegisterData.description = findPainting.description;
            }
            else{
                newRegisterData.description = sanitize(req.body.description);
            }

  

            if(findPainting.artist_name == sanitize(req.body.artist_name)){
                newRegisterData.artist_name = findPainting.artist_name;
            }
            else{
                newRegisterData.artist_name = sanitize(req.body.artist_name);
            }

            if(findPainting.artist_country == sanitize(req.body.artist_country)){
                newRegisterData.artist_country = findPainting.artist_country;
            }
            else{
                newRegisterData.artist_country = sanitize(req.body.artist_country);
            } 

            if(findPainting.artist_period == sanitize(req.body.artist_period)){
                newRegisterData.artist_period = findPainting.artist_period;
            }
            else{
                newRegisterData.artist_period = sanitize(req.body.artist_period);
            } 



            newRegisterData.image = findPainting.image

            if(
                
                isEmpty(newRegisterData.title) ||
                isEmpty(newRegisterData.description) ||
                isEmpty(newRegisterData.artist_name) ||
                isEmpty(newRegisterData.artist_country) ||
                isEmpty(newRegisterData.artist_period) 
            ){
                return res.status(500).send({error: 'blank fields'})
            }



            if(!isEmpty(sanitize(req.body.image))){

                const newImage = sanitize(req.body.image);

                if(isBase64(newImage, {allowMime: true})){
                   await PaintingsModel.base64ToImage(painting_id, newImage)
                }
                else{
                    return res.status(500).send({error: 'base64 image is not valid'})
                }

            }


            newRegisterData.updated = PaintingsModel.getDateTime();


            //Delete
            const deleteRegister = await PaintingsModel.deletePainting(painting_id);
            
            //Create
            const result = await PaintingsModel.createPainting(newRegisterData);

            const link = req.protocol+'://'+req.get('host')+req.originalUrl
            const response = {
                message: 'Painting updated sucessfully',
                updatedPainting: {
                    painting_id: painting_id,
                    title: newRegisterData.title,
                    description: newRegisterData.description,
                    name: newRegisterData.artist_name,
                    country: newRegisterData.artist_country,
                    period: newRegisterData.artist_period,
                    image: newRegisterData.image,
                    request: {
                        type: 'GET',
                        description: 'Return painting with id '+painting_id,
                        url: link
                    }
                }
            }
            return res.status(200).send(response); 

        }
        else{
            return res.status(404).send({ error: 'Painting with ID '+painting_id+' not found' });
        }


       


    } catch (error) {
        return res.status(500).send({ error: error });
    }
};





exports.deletePainting = async (req, res, next) => {
    try {

        let painting_id = '';

        if(req.params.painting_id > 0){
            painting_id = sanitize(req.params.painting_id);
        }
        else{
            return res.status(500).send({error: 'ID not defined'})
        }

        //verify id registers exists
        const findPainting = await PaintingsModel.getPaintingDetail(painting_id);
        if(!findPainting){
            return res.status(404).send({ error: 'Painting with ID '+painting_id+' not found' });
        }

        //cal function to delete register
        const result = await PaintingsModel.deletePainting(painting_id);
  

        if(result){
            //call  function to delete image file from server
            await PaintingsModel.removeImageFromServer(painting_id)
            return res.status(200).send({message: 'Painting with ID '+painting_id+' was successfully deleted'});
        }

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};



//function to verify if value(string is empty)
function isEmpty(value) {

    value = String(value);

    //remove all white spaces
    value = value.replace(/\s{2,}/g, '');

    switch (value) {
      case '':
      case null:
      case typeof(value) == "undefined":
        return true;
      default:
        return false;
    }
  }


  //function to sanitize fields
  function sanitize(value){

    //Strip tags and sanitize values
    value = striptags(value)
    value = sanitizer.sanitize(value)
    value = sanitizer.escape(value)
    return value
    
  }


  //Function to format data into json
const transformer = painting => ({
    type: 'paintings',
    attributes: {
        painting_id: painting.painting_id,
        title: painting.title,
        description: painting.description,
        artist_name: painting.artist_name,
        artist_country: painting.artist_country,
        artist_period: painting.artist_period,
        image: painting.image,
        created: painting.created,
        updated: painting.updated
    },
    links: {
        self: `/api/paintings/${painting.painting_id}`
    }
}); 



function generateBlankBase64Image(){
    return 'data:image/jpeg;base64,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'
}