import express, { Response, Request } from 'express';
import bodyParser from 'body-parser';
import { 
  filterImageFromURL, 
  deleteLocalFiles, 
  validateURL,
  imageTypeSupported
 } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get('/filteredimage', async (req: Request, res: Response) => {
    try {
      let { image_url } : { image_url : string } = req.query;
      if (!image_url) {
        return res.status(400).send('image_url not specified in query parameters');
      };

      image_url = validateURL(image_url); //Validate the image URL

      if (!image_url) {
        return res.status(400).send({ message: "Endpoint URL malformed.." });
      }

      if (!imageTypeSupported(image_url.toLowerCase())) {
        return res.status(422).send({ message: "Image type not supported" });
      }

      const filteredpath : string = await filterImageFromURL(image_url);

      return res.sendFile(filteredpath, {}, async (err : Error) => {
        if (err) console.log(err);
        await deleteLocalFiles([filteredpath]);
      });
    } catch (e) {
      console.log(e);
      return res.status(422).send('An unexpected error occured! Kindly contact support!');
    } 
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();