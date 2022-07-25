import FileManager from "./FileManager.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { profileEnd } from "console";

const fileManager = new FileManager("src/profiles.json");

const __dirname = fileURLToPath(import.meta.url);
const app = express();
app.use(express.json());
const routerProfiles = express.Router();
app.use(routerProfiles);
const PORT = process.env.PORT || 8080;

routerProfiles.use(express.urlencoded({ extended: true }));
routerProfiles.use("/", express.static("public"));

routerProfiles.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

routerProfiles.get("/profiles", async (req, res) => {
  let response;
  let profiles = [];
  try {
    response = await fileManager.getAll();
    profiles = await response.map((profile) => {
      const {
        linkedin,
        señority,
        areaBuscada,
        posicionBuscada,
        empresaActual,
      } = profile;
      let prof = {
        areaBuscada,
        posicionBuscada,
        señority,
        empresaActual,
        linkedin,
      };
      return prof;
    });
  } catch (e) {
    console.error(e);
    res.status(404);
  }

  res.status(200);
  res.json(profiles);
});

routerProfiles.get("/searchProfiles", async (req, res) => {
  const params = req.query;
  let response;
  let profiles = [];
  try {
    response = await fileManager.getAll();

    profiles = await response.map((profile) => {
      let {
        linkedin,
        señorityActual,
        señorityBuscada,
        areaBuscada,
        posicionBuscada,
        empresaActual,
        busquedaActiva,
        posicionActual,
      } = profile;

      const profileClone = Object.create(profile);

      if (Object.keys(params).length) {
        if (!params.posicionBuscada) profileClone.posicionBuscada = undefined;
        if (!params.areaBuscada) profileClone.areaBuscada = undefined;
        if (!params.señorityActual) profileClone.señorityActual = undefined;
        if (!params.señorityBuscada) profileClone.señorityBuscada = undefined;
        if (!params.busquedaActiva) profileClone.busquedaActiva = undefined;
        if (!params.posicionActual) profileClone.posicionActual = undefined;
        if (
          params.posicionBuscada === profileClone.posicionBuscada &&
          params.areaBuscada === profileClone.areaBuscada &&
          params.señorityActual === profileClone.señorityActual &&
          params.señorityBuscada === profileClone.señorityBuscada &&
          params.busquedaActiva === profileClone.busquedaActiva &&
          params.posicionActual === profileClone.posicionActual
        ) {
          let prof = {
            areaBuscada,
            posicionBuscada,
            señorityBuscada,
            empresaActual,
            posicionActual,
            señorityActual,
            linkedin,
          };
          return prof;
        }
      } else {
        let prof = {
          areaBuscada,
          posicionBuscada,
          señorityBuscada,
          empresaActual,
          posicionActual,
          señorityActual,
          linkedin,
        };
        return prof;
      }
    });
    res.status(200);
    res.json(profiles.filter(Boolean));
  } catch (e) {
    console.error(e);
    res.status(404);
  }
});

routerProfiles.get("/profiles/:id", async (req, res) => {
  let response;
  try {
    const id = parseInt(req.params.id);
    response = await fileManager.getById(id);
    if (response === null) {
      throw new Error("Id no existe");
    }
  } catch (e) {
    console.error(e);
    res.status(404);
  }
  res.json(response);
});

routerProfiles.post("/profileadd", async (req, res) => {
  let response;
  try {
    const {
      linkedin,
      empresaActual,
      posicionActual,
      señorityActual,
      areaBuscada,
      posicionBuscada,
      señorityBuscada,
      busquedaActiva,
    } = req.body;

    const add = {
      linkedin,
      empresaActual,
      posicionActual,
      señorityActual,
      areaBuscada,
      posicionBuscada,
      señorityBuscada,
      busquedaActiva,
    };

    add.enable === "true" ? (add.enable = true) : (add.enable = false);
    add.busquedaActiva === "true"
      ? (add.busquedaActiva = true)
      : (add.busquedaActiva = false);
    response = await fileManager.save(add);
  } catch (e) {
    console.error(e);
  }

  res.json(response);
});

routerProfiles.post("/profiles/update", async (req, res) => {
  let element;
  try {
    let {
      linkedin,
      empresaActual,
      posicionActual,
      señorityActual,
      areaBuscada,
      posicionBuscada,
      señorityBuscada,
      busquedaActiva,
      clavePrivada,
    } = req.body;

    if (linkedin && clavePrivada) {
      const allElements = await fileManager.getAll();
      element = allElements.find(
        (ele) => ele.linkedin === linkedin && ele.clavePrivada === clavePrivada
      );
      busquedaActiva === "true"
        ? (busquedaActiva = true)
        : (busquedaActiva = false);
      if (element) {
        if (empresaActual != undefined) element.empresaActual = empresaActual;
        if (posicionActual != undefined)
          element.posicionActual = posicionActual;
        if (señorityActual != undefined)
          element.señorityActual = señorityActual;
        if (areaBuscada != undefined) element.areaBuscada = areaBuscada;
        if (posicionBuscada != undefined)
          element.posicionBuscada = posicionBuscada;
        if (señorityBuscada != undefined)
          element.señorityBuscada = señorityBuscada;
        if (busquedaActiva != undefined)
          element.busquedaActiva = busquedaActiva;

        fileManager.writeFile(JSON.stringify([...allElements]));
        res.status(200).json({
          update: "ok",
          id: req.params.id,
          newElement: element,
        });
      } else {
        res.status(404).json({
          update: "Error",
          message: "Linkedin y/o clave incorrecta",
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
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
    if (index != -1) {
      allElements.splice(index, 1);
      fileManager.writeFile(JSON.stringify([...allElements]));
      res.json({
        Delete: "ok",
        id: req.params.id,
        ElementDelete: element,
      });
    } else {
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

routerProfiles.get("/download", function (req, res) {
  const file = `./public/Recruit -API REST.postman_collection.json`;
  res.download(file); // Set disposition and send it.
});

const listener = app.listen(PORT, () => {
  console.log(`Server escuchando ${listener.address().port}`);
});

listener.on("Error", (error) => console.error(error));
