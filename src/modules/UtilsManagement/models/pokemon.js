class Pokemon {
    constructor(name,description,imageUrl) {
     this.name = name,
     this.description = description,
     this.imageUrl
    }

    str(){
        return `Pokemon: ${this.name} \nDescription ${this.description}`
    }
}