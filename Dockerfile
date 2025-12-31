# Imagen base de Node.js
FROM node:20

#Modulo para obtener los videos 
#python 
#pip install yt-dlp 

# Instalar dependencias de Python + yt-dlp desde apt
RUN apt update && apt install -y python3 python3-pip yt-dlp

# Crear directorio en el contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./



# Instalar dependencias
RUN npm install




# Copiar el resto del código
COPY . .

# Exponer puerto (si aplica, opcional)
# EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
