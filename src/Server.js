import FileManager from "./FileManager.js";
import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { profileEnd } from "console";


const fileManager = new FileManager("src/profiles.json");


const __dirname = fileURLToPath(import.meta.url);
const app = express();
app.use(express.json());
const routerProfiles = express.Router();
app.use(routerProfiles);
const PORT = process.env.PORT || 8080;


routerProfiles.use(express.urlencoded({ extended: true }));
routerProfiles.use("/",express.static('public'));






routerProfiles.get("/", (req, res) => {

  res.sendFile(__dirname+"/public/index.html")

}); 

routerProfiles.get("/profiles", async (req, res) => {
  let response;
  let profiles=[];
  try {
    response = await fileManager.getAll();
     profiles = await response.map((profile)=>{ 
      const {linkedin,señority,areaBuscada,posicionBuscada,empresaActual} = profile;
      let prof = {
                areaBuscada,
                posicionBuscada,
                señority,
                empresaActual,
                linkedin
      }
      return prof
      })
  } catch (e) {
    console.error(e);
    res.status(404)
  }

  res.status(200)
  res.json(profiles);
});


routerProfiles.get("/searchProfiles", async (req, res) => {
  const params = req.query;
  let response;
  let profiles=[];
  try {
    response = await fileManager.getAll();
     profiles = await response.map((profile)=>{ 
      const {linkedin,señority,areaBuscada,posicionBuscada,empresaActual} = profile;
     
      if(params.posicionBuscada == posicionBuscada || params.areaBuscada == areaBuscada ||params.señority == señority){
          let prof = {
                areaBuscada,
                posicionBuscada,
                señority,
                empresaActual,
                linkedin
      }
      return prof
      }
    
  })
  } catch (e) {
    console.error(e);
    res.status(404)
  }

  res.status(200)
  res.json(profiles.filter(Boolean));
});

routerProfiles.get("/profiles/:id", async (req, res) => {
  
  let response;
  try {
    const id = parseInt(req.params.id);
    response = await fileManager.getById(id);
    if(response === null){
      throw new Error('Id no existe')
    }
  } catch (e) {
    console.error(e);
    res.status(404)
  }
  res.json(response);
});

routerProfiles.post("/profileadd", async (req, res) => {
  let response;
  try {
    const add = req.body;
    response = await fileManager.save(add);
  } catch (e) {
    console.error(e);
  }

  res.json(response);
});

routerProfiles.put("/profiles/update/:id", async (req, res) => {
  let element;
  try {
    const id = parseInt(req.params.id);
    const update = req.body;
    const allElements = await fileManager.getAll();
    element = allElements.find((ele) => ele.id === id);
    if (element) {
      if (update.title && element.title != update.title)
        element["title"] = update.title;
      if (update.price && element.price != update.price)
        element["price"] = update.price;
      if (update.thumbnail && element.thumbnail != update.thumbnail)
        element["thumbnail"] = update.thumbnail;
    }

    fileManager.writeFile(JSON.stringify([...allElements]));
    res.json({
      update: "ok",
      id: req.params.id,
      newElement: element,
    });
  } catch (e) {
    console.error(e);
  }
  console.log(element);
});

routerProfiles.get("/profilesRandom", async (req, res) => {
  let response;
  try {
    let min = 1;
    let max = await fileManager.getLenghtProdArray();

    let id = Math.floor(Math.random() * (max - min + 1) + min);

    response = await fileManager.getById(id);
  } catch (e) {
    console.error(e);
  }
  res.json(response);
});

routerProfiles.delete("/profile/:id", async (req, res) => {
  let response;
  try {
    const id = parseInt(req.params.id);
    const allElements = await fileManager.getAll();
    const element = allElements.find((ele) => ele.id === id);
    const index = allElements.indexOf(element);
    if (index!=-1) {
      allElements.splice(index, 1);
      fileManager.writeFile(JSON.stringify([...allElements]));
      res.json({
        Delete: "ok",
        id: req.params.id,
        ElementDelete: element,
      });
    }else{
      res.json({
        Delete: `Error, ID: ${id} no existe`,
        id: req.params.id,
        ElementDelete: null,
      });
    }
  } catch (e) {
    console.error(e);
  }
});


routerProfiles.get('/download', function(req, res){
  const file = `./public/PRODUCTS - API REST.postman_collection.json`;
  res.download(file); // Set disposition and send it.
});


const listener = app.listen(PORT, () => {
  console.log(`Server escuchando ${listener.address().port}`);
});

listener.on("Error", (error) => console.error(error));
