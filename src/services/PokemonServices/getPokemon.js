import axios from "axios";
import https from "https";

////////////////////////////////////////
/// Method: GetPokemon
/// Uso: Obtiene un pokemon por nombre
////////////////////////////////////////
export async function getPokemon(nameOrId) {
  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    return res.data;
  } catch (e) {
    console.error("❌ Error en getPokemon:", e?.response?.status);
    return null; // importante para manejar errores
  }
}