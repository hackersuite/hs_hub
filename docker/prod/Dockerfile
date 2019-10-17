###############################################################################
# Step 1 : Builder image
###############################################################################
FROM node:9-alpine as builder

RUN npm i npm@latest -g

## Install build toolchain, install node deps and compile native add-ons
RUN apk add --no-cache --virtual python make g++

# Create app directory
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Before running install, switch to non-root user "node"
USER node


# Define working directory and copy source
WORKDIR /home/node/app
COPY . .

# Install dependencies and build the project
RUN npm install && npm run build

###############################################################################
# Step 2 : Run image
###############################################################################
FROM node:9-alpine

# Before we install dependencies, set the node env correctly
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm install && \
  npm cache clean --force

# Copy builded source from the upper builder stage
COPY --from=builder /home/node/app/dist ./dist

EXPOSE 5000
CMD [ "node", "./dist/server.js" ]