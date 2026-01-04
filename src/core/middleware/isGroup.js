export async function isGroup({ msg,chatId,chat }) {
    if (chatId.endsWith("@g.us")) {
      const metadata = await client.sock.groupMetadata(chatId);
      console.log(`
        ######################################
        ## Es un grupo: ${metadata.subject} ##
        ######################################
        `)
              
      return true;
    }else{
      return false;
    }
}

// export function isGroupD(userRole){
//       return userRole === "group"
// }