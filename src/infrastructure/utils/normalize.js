export function normalizeId(id) {
    console.log(normalizeId)
    if (!id || typeof id !== 'string') return '';
    
    // Quitar todo lo que venga después de “@”
    let base = id.split('@')[0];

    // Quitar todo lo que venga después de “:”
    base = base.split(':')[0];
    
    return base;
}