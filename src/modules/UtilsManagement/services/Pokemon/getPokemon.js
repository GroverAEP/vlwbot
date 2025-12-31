import axios from "axios";
import https from "https";
import { Pokemon } from "../../models/pokemon.js";

////////////////////////////////////////
/// Method: GetPokemon
/// Uso: Obtiene un pokemon por nombre
////////////////////////////////////////
export async function getPokemon(nameOrId) {
  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    // console.log(res.data);
    const pk = new Pokemon(res.data);
    
    console.log(`
      ############################################
      ## Objeto pokemon created:                ##
      ##        ${pk.getInfo()}                 ##
      ############################################\n
      `) 
    return pk;
  } catch (e) {
    console.error("❌ Error en getPokemon:", e);
    return null; // importante para manejar errores
  }
}