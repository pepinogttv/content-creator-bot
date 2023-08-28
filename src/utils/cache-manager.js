/**
 * Cache manager
 * @file cache-manager.js
 */
const fs = require('fs');
const path = require('path');

/**
 * @name Cache manager
 * @description Used to manage the cache of transcriptions (reduce the usage of API calls)
 */
class CacheManager {

  /**
   * 
   * @param {string} dir Dir relative to the project root to save the cache (default: cache)
   * @param {"base64" | "txt"} method How to save and read the cache, default: base64
   */
  constructor(method="base64", dir = "cache") {
    this.dir = dir;
    this.method = method;
  }

  /**
   * 
   * @param {string} videoId 
   * @returns {string} transcript data
   */
  get(videoId){
    try{
      // throw new Error("Not implemented yet");
      const dir = path.join(process.cwd(), this.dir);

      if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        throw new Error("No hay datos en cache");
      }

      if(!this.search(videoId)){
        throw new Error("No se ha encontrado el archivo cache");
      }

      const data = fs.readFileSync(path.join(dir, `${videoId}.cbcc`));
      // Decode from base64 to string if method is base64
      return this.method === "base64" ? Buffer.from(data).toString("utf8") : data;
    } catch(err){
      throw err;
    }
  }

  /**
   * @description Save data in cache
   * @param {string} videoId 
   * @param {string | [{_attributes: { start: string, dur: string }, _text: string}]} input 
   * @returns {[boolean, string]} [success, videoId]
   */
  save(videoId, input){
    try{

      const dir = path.join(process.cwd(), this.dir);
  
      if(!fs.existsSync(dir)){
        console.log("[CACHE MANAGER] Creando directorio de cache..."); // Debug, can be removed
        fs.mkdirSync(dir);
      }

      if(this.search(videoId)){
        throw new Error("Ya hay datos de este video en cache");
      }

      let data = "";
      if(typeof input === "string"){
        data = input;
      } else {
        input.map(item => {
          data = `${data} ${item._text}`;
        })
      }

      fs.writeFileSync(path.join(dir, `${videoId}.cbcc`), data);
      return [true, videoId];
    } catch(err){
      throw err;
    }
  }

  /**
   * 
   * @param {string} videoId 
   * @returns {boolean} if the file was found
   */
  search(videoId){
    try{
      const dir = path.join(process.cwd(), this.dir);

      if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        return false;
      }

      return fs.existsSync(path.join(dir, `${videoId}.cbcc`));
    } catch(err){
      throw err;
    }
  }

  async reset(){
    throw new Error("Not implemented yet");
  }

  async clear(){
    throw new Error("Not implemented yet");
  }
}

module.exports = CacheManager;