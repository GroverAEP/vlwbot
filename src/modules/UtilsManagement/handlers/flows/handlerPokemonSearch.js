import { getPokemon } from "../../../../infrastructure/services/PokemonServices/getPokemon.js";


export const handlerPokemonApi= {
    name: "pokemonApi",
    role: "all",
    run: PokemonApi,
};
export async function PokemonApi({msg,text,client}){
 try{
     if (text.startsWith("!pokemon") ) {
        const args = text.split(" ");
        const pokemonName = args[1]; // nombre del Pokémon
        const sender = msg.key.participant || msg.key.remoteJid;
    
        if (!pokemonName) {
            await client.send.reply(msg, "Debes escribir un Pokémon.\nEjemplo: `!pokemon pikachu`");
            return;
        }
    
        // Si mandó el nombre, responder
        await client.send.reply(msg, `Buscando información de *${pokemonName}*...`);
        
        const resPokemon = await getPokemon(pokemonName)
    
        if (!resPokemon) {
            await client.send.reply(msg, "❌ Pokémon no encontrado o error en la API.");
            return;
        }

        
        // Validación segura
        const imageUrl = resPokemon?.sprites?.other?.['official-artwork']?.front_default;

        if (!imageUrl) {
            await client.send.reply(sender,"❌ No encontré imagen del Pokémon.");
            return;
        }
        console.log(resPokemon.sprites.other['official-artwork']['front_default'])
        console.log(resPokemon.name.toUpperCase())
        console.log(resPokemon.height)
    
    
        await client.send.image(msg, imageUrl , 
            { 
                caption: `✨ *${resPokemon.name.toUpperCase()}*\nAltura: ${resPokemon.height}\nPeso: ${resPokemon.weight}`,
                quoted: msg
                });
        return;
    }
 } catch(e){
    console.log(e);
 }


 try{
     if (text.startsWith("!prd")) {
        const args = text.split(" ");
        const pokemonArg = args[1]; // nombre del Pokémon
        const sender = msg.key.participant || msg.key.remoteJid;
    
        if (!pokemonArg) {
            pokemonArg = Math.floor(Math.random() * 898) + 1; 
            // 898 = última Pokédex de Galar (puedes subirla si quieres)
            await client.send.reply(msg, `🎲 Generando Pokémon aleatorio... ID: *${pokemonArg}*`);
        }
    
        // Si mandó el nombre, responder
        await client.send.reply(msg, `Buscando información de *${pokemonName}*...`);
        
        const resPokemon = await getPokemon(pokemonArg)
    
        if (!resPokemon) {
            await client.send.reply(msg, "❌ Pokémon no encontrado o error en la API.");
            return;
        }

        
        // Validación segura
        const imageUrl = resPokemon?.sprites?.other?.['official-artwork']?.front_default;

        if (!imageUrl) {
            await client.send.reply(sender,"❌ No encontré imagen del Pokémon.");
            return;
        }
        console.log(resPokemon.sprites.other['official-artwork']['front_default'])
        console.log(resPokemon.name.toUpperCase())
        console.log(resPokemon.height)
    
    
        await client.send.image(msg, imageUrl , 
            { 
                caption: `✨ *${resPokemon.name.toUpperCase()}*\nAltura: ${resPokemon.height}\nPeso: ${resPokemon.weight}`,
                quoted: msg
                });
        return;
    }
 } catch(e){
    console.log(e);
 }
}
