

import  fs from "fs";



export default class FileManager{
  constructor(pathFile){
    this.pathFile=pathFile;
  }

 async save(obj){
  try{
    const content = await this.readFile()
   const cont = await JSON.parse(content)
   cont.length ? obj.id = await this.lastId(): obj.id=1;
   obj.clavePrivada = this.makePrivatePass(8)
   cont.push(obj)
   await this.writeFile(JSON.stringify(cont))
   return "Creado! Guarde su SecretID: "+obj.clavePrivada
  }catch(e){
    
   console.error(e)
  }
 
}

 makePrivatePass(length){
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOP%$#QRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-'
  const numbers = '0123456789'
  for (let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))+numbers.charAt(Math.floor(Math.random() * numbers.length));
 }
 return result;
}


async lastId(){
  try{
   const content = await this.readFile()
   const cont = await JSON.parse(content)
   if(!cont.length){
    return 1
   }
   const ultReg = cont.pop()
    return ultReg.id+1 
  }catch(e){
    console.error(e)
  }
  
  }

  async getLenghtProdArray(){
    try{
     const content = await this.readFile()
     const cont = await JSON.parse(content) 
  return cont.length
    }catch(e){
      console.error(e)
    }
    
    }

  async showGetByID(id){
    try{
     if(await this.readFile()){
         console.log(await this.getById(id))
    } 
    }catch(e){
      console.log(e)
    }
    
 
  } 

  async getById(id){
    try{  
       const content = await this.readFile()
     const cont = await JSON.parse(content)

    const reg=  cont.filter(reg=>reg.id===id)
    return reg.length ? [ ...reg] : null; 
    }catch(e){
      if (e instanceof TypeError) {
        throw e
      }else{
        console.error(e)
      }

      }
 
    }

async getAll(){
  try{
      const content = await this.readFile()
   const cont = await JSON.parse(content)
   return cont
  }catch(e){
    console.error(e)
  }

}

async deleteAll(){
  try{
        if(await this.readFile()){
              await this.writeFile(JSON.stringify([]))
        }
     
  }catch(e){
   if(e.errno === -4058){
   console.log("Archivo no encontrado")
   }
   console.log(e)
  }

}


 async readFile(){
  return await fs.promises
    .readFile(this.pathFile, "utf-8")
    .catch((e) => {
      if (e.code === 'ENOENT') {
        throw "Archivo no encontrado"
      }
      if(e instanceof TypeError){
          throw "TypeError - Es posible que el archivo que intenta abrir no corresponda a la codificacion esperada";
          }else {
        throw "err";
      }
    });
}

async writeFile(obj){
  return await fs.promises
    .writeFile(this.pathFile, obj)
    .catch((e) => {
      if (e.code === 'ENOENT' ) {
        throw 'File not found!';
      }else{
        throw e;
      }
    });
}

async appendContentFile(content){
  await fs.promises
   .appendFile(this.pathFile, `${content}\n`)
   .then(() => {
     console.log("agregado");
   })
   .catch((e) => {
     console.error(e);
     console.log(`code error test:${e.code}`)
   });
}

}



const test= new FileManager("productos.txt");

const obj = { title: 'AddTitleTest', price: 63500, thumbnail: 'http://link4' }


//   test.getById(3)
//   test.showGetByID(1)
//  test.getAll()
// test.deleteAll()

