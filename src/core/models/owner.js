import fs from "fs-extra";

export class Owner {
    constructor(dbPath) {
        this.dbPath = `${dbPath}/owner.json`;  // singular
    }

    async load() {
        if (!fs.existsSync(this.dbPath)) {
            await fs.writeJson(this.dbPath, null, { spaces: 2 });
            return null;
        }
        return await fs.readJson(this.dbPath); // retorna el owner o null
    }

    async save(ownerData) {
        // Puedes validar aquí si quieres (opcional)
        if (!ownerData?.id) {
            throw new Error("Se requiere un owner con .id");
        }
        await fs.writeJson(this.dbPath, ownerData, { spaces: 2 });
    }

    async set(owner) {
        // Sobreescribe directamente (solo puede haber uno)
        await this.save(owner);
        return owner;
    }

    async clear() {
        // Borra el owner actual
        await fs.writeJson(this.dbPath, null, { spaces: 2 });
    }

    async exists() {
        const owner = await this.load();
        return !!owner;
    }

    // Versión más usada en bots: isOwner(id)
    async isOwner(rawId) {
        const current = await this.load();
        if (!current?.id) return false;

        const normalize = (id) => {
            if (!id || typeof id !== 'string') return '';
            let base = id.split('@')[0];
            base = base.split(':')[0];
            return base.trim();
        };

        return normalize(current.id) === normalize(rawId);
    }

    async get() {
        return await this.load(); // null o el objeto owner
    }
}