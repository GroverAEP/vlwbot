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
    static render({detail}){
        return '❌ Envía o responde a una imagen o video (mp4, mov, mkv, webm) con el comando *!sticker*'
    }

}