import { getPokemon } from "../../services/Pokemon/getPokemon.js";
import { ErrorPokemonMessage } from "../messages/ErrorMessage.js";
import { SuccessPokemonMessage } from "../messages/SuccessMessage.js";


export const handlerSearchPokemon= {
    name: "pokemonApi",
    role: "all",
    run: SearchPokemon,
};

export async function SearchPokemon({msg,client,pokemonName}){
 try{
        if (!pokemonName) {
            await client.send.reply(msg, ErrorPokemonMessage.NotFoundNamed());
            return;
        }
    
        // Si mandó el nombre, responder
        await client.send.reply(msg, `Buscando información de *${pokemonName}*...`);
        
        const resPokemon = await getPokemon(pokemonName)

        if (!resPokemon) {
            await client.send.reply(msg, ErrorPokemonMessage.NotFoundPokemonOrBadApi());
            return;
        }

        
        // Validación segura

        if (!resPokemon.getImageUrl()) {
            await client.send.reply(msg,ErrorPokemonMessage.NotFoundImage());
            return;
        }
        console.log(resPokemon.imageUrl)
        console.log(resPokemon.name.toUpperCase())
        console.log(resPokemon.height)
    
    
        await client.send.image(msg, resPokemon.getImageUrl() , 
            { 
            caption: SuccessPokemonMessage.default({resPokemon}),
            quoted: msg
            });
        return;
    
 } catch(e){
    console.log(e);
 }
}
