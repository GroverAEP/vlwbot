import { getPokemon } from "../../services/Pokemon/getPokemon.js";
import { ErrorPokemonMessage } from "../messages/ErrorMessage.js";
import { SuccessPokemonMessage } from "../messages/SuccessMessage.js";


export const handlerGeneratedPokemon= {
    name: "pokemonApi",
    role: "all",
    run: GeneratedPokemon,
};
export async function GeneratedPokemon({msg,client}){
 try{
     
        pokemonArg = Math.floor(Math.random() * 898) + 1; 
        await client.send.reply(msg, `🎲 Generando Pokémon aleatorio... ID: *${pokemonArg}*`);
        // if (!pokemonArg) {
        //     // 898 = última Pokédex de Galar (puedes subirla si quieres)
        // }
    
        // Si mandó el nombre, responder
        // await client.send.reply(msg, `Buscando información de *${pokemonName}*...`);
        
        const resPokemon = await getPokemon(pokemonArg)
    
        if (!resPokemon) {
            await client.send.reply(msg, ErrorPokemonMessage.NotFoundPokemonOrBadApi());
            return;
        }

        
        // Validación segura

        if (!resPokemon.getImageUrl()) {
            await client.send.reply(sender,ErrorPokemonMessage.NotFoundPokemonOrBadApi);
            return;
        }
        console.log(resPokemon.sprites.other['official-artwork']['front_default'])
        console.log(resPokemon.name.toUpperCase())
        console.log(resPokemon.height)
    
    
        await client.send.image(msg,resPokemon.getImageUrl() , 
            { 
                caption: SuccessPokemonMessage.default({resPokemon}),
                quoted: msg
                });
        return;
 } catch(e){
    console.log(e);
 }
}
