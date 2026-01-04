function getRoleLevel(role) {
    const levels = {
        user: 1,
        client: 2,
        admin: 3,
        owner: 4
    };
    return levels[role] || 0; // Si no existe, nivel 0
}

// ¿Puede usar comandos básicos?
function canUseBasicCommands(userRole) {
    return ['user', 'admin', 'owner'].includes(userRole);
}

// ¿Puede usar comandos avanzados?
function canUseAdminCommands(userRole) {
    return ['admin', 'owner'].includes(userRole);
}

// ¿Es owner? (comandos peligrosos)
function isOwner(userRole) {
    return userRole === 'owner';
}

// ¿Es cliente? (solo botones, NO comandos de texto)
function isClient(userRole) {
    return userRole === 'client';
}

// ¿Es cliente? (solo botones, NO comandos de texto)
function isUser(userRole) {
    return userRole === 'user';
}