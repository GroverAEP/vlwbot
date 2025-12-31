export class SuccessStickerMessage {
    async SuccessSticker(params) {
        
    }

}


export class SuccessPokemonMessage {
    static default({resPokemon}) {
        return `✨ *${resPokemon.name.toUpperCase()}*\nAltura: ${resPokemon.height}\nPeso: ${resPokemon.weight}`
    }
}
