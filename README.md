# Hacker Suite Hub

[![Build Status](https://travis-ci.org/unicsmcr/hs_hub.svg?branch=master)](https://travis-ci.org/unicsmcr/hs_hub)
![Lint](https://github.com/unicsmcr/hs_hub/workflows/Lint/badge.svg)
![GitHub](https://img.shields.io/github/license/unicsmcr/hs_hub.svg)

## Dependencies

 - Node (v8.10.0 or later)
 - MySQL database (v5.7 or later)

## Getting started
### Project set up
Run the following commands in the console:
```
$ git clone https://github.com/unicsmcr/hs_hub.git
$ cd hs_hub
$ cp .env.example .env
```

Finally, replace placeholders in .env for your own project

## Development deployment
First, complete the initial set up (above).

### Quick start with Docker
The fastest way of getting the project up and running is to use the provided `docker-compose.yml` file. Make sure you have [Docker CE](https://docs.docker.com/install/) installed on your system. Navigate to the root directory of the project and run the following:
```
$ docker-compose up -d
```
**Note**: *You can omit -d if you want to see the log output from the hub*

This will create two containers, one for the MySQL database and a NodeJS container. The first time you run the command, it will take a while since it will install the required services. Next time you run the command, it will be much faster since dependecies are cached.

If you want to shut down the hub & database containers, run the command:
```
$ docker-compose stop
```
**Note**: *Running the command above with the `-v` option will remove the database volume*

### Manually launching
Make sure you have completed the initial set up (above).

Run the following, which will install all the required dependencies for the project into a folder called `node_modules`
```
$ npm i
```
Next, you can run one of the following commands to start the application. Make sure you have the settings in `.env` set correctly, otherwise you may get an error.
```
$ npm start
```
or, the following, which allows automatic restarts when editing the source code.
```
$ npm run start:watch
```
 
## Production deployment
First, complete the intial set up (above). Then, run the following command which will build the project (creating the `dist` folder) and launch the hub.
```
$ ./launch_production.sh
```

## Running the tests
Assuming you have completed the intial set up and ran `npm i`, you can run the test suite using the either of the following commands:
```
$ npm test
```
To run tests automatically everytime a change has been made to the tests, use the command below. This command will also allow you to filter tests by name, or by filename.
```
$ npm run test:watch
```` 

 ## License
 The Hackathon Hub (i.e all the code in both `src` and `test`) is licensed under the MIT License.
