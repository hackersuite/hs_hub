FROM node:9-alpine

RUN npm i npm@latest -g

## Install build toolchain, install node deps and compile native add-ons
RUN apk add --no-cache --virtual python make g++

# Create app directory
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Set the working directory for the application
WORKDIR /home/node/app

# Before running install, switch to non-root user "node"
USER node

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

WORKDIR /home/node/app
COPY . .

EXPOSE 5000
CMD [ "npm", "run", "start:watch" ]