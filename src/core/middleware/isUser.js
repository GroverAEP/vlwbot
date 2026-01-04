export async function isUser({msg,userId}) {
    if (userId.endsWith('@s.whatsapp.net') 
        && userId.endsWith(`@lid`)) {
        
    console.log(`
        #############################
        ## Es un usuario ${userId} ##
        #############################
        `)
    return true;
    }
    return false;
}

// ¿Es cliente? (solo botones, NO comandos de texto)
export function isUserD(userRole) {
    return userRole === 'user';
}