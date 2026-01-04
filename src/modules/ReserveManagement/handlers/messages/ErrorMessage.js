export  class ErrorStickerMessage {
    static respondMsg(){
        return '❌ Envía o responde a una imagen o video (mp4, mov, mkv, webm) con el comando *!sticker*'
    }

    static NotFoundFile(){
        return '❌ No se generó el archivo sticker.webp'
    }

    static Default(){
        return '⚠️ Error al crear el sticker.'
    };

    

}

export class ErrorPokemonMessage {
    static NotFoundNamed({detail}){
        return 'Debes escribir un Pokémon.\nEjemplo: `!pokemon pikachu'
    }

    static NotFoundPokemonOrBadApi(){
        return '❌ Pokémon no encontrado o error en la API.'
    }

    static NotFoundImage(){
        return '❌ No encontré imagen del Pokémon.'
    }

}