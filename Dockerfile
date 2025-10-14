# Node image with Alpine Linux
FROM node:lts-alpine

# Workdir required for tailwind to compile
WORKDIR /app

# Install git
RUN apk add --no-cache git

# Copies package.json and package-lock.json
COPY package*.json ./

# Installs dependencies
RUN npm install

# Copies the rest of the UI source code
COPY . .

# Starts the application
CMD ["npm", "start"]
