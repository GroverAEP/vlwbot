// src/config/index.js

import { isClient } from "./isClient.js";
import { isAdminGroup } from "./isAdminGroup.js";
import { isBanned } from "./isBanned.js";
import { isGroup } from "./isGroup.js";
import { isUser, isUserD } from "./isUser.js"
import isOwner from "./isOwner.js";




// Exportar todo junto para usar fácil
export const middleware = {
    // ENV,
    isClient,
    isBanned,
    isGroup,
    isOwner,
    isAdminGroup,
    isUser,
    isUserD
};