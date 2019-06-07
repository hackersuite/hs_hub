#!/bin/bash

npm run build
npm i --production
node ./dist/server.js