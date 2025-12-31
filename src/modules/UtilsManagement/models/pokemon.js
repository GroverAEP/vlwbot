export class Pokemon {
    constructor({id, name, height, weight, types, sprites}) {
        this.id = id;
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.types = types.map(t => t.type.name); // solo nombres de tipos
        // Agregamos la imagen oficial del Pokémon
        this.imageUrl = sprites?.other?.['official-artwork']?.front_default || null;
    }

    getInfo(){
        return `
        ${this.name} (#${this.id})\n - Altura: ${this.height},\n  - Peso: ${this.weight}, \n - Tipos: ${this.types.join(", ")}`;
    }

    getImageUrl(){
        return this.imageUrl;
    }

    str(){
        return `Pokemon: ${this.name} \nDescription ${this.description}`
    }
}