# Hackathon Attendee Hub

[![Build Status](https://travis-ci.org/hacksoc-manchester/Hackathon_Attendee_Hub.svg?branch=master)](https://travis-ci.org/hacksoc-manchester/Hackathon_Attendee_Hub/)
![GitHub](https://img.shields.io/github/license/hacksoc-manchester/GUH18-Hub.svg)

## Dependencies

 - Node.js
 - MySQL database (will probably be replaced with PostreSQL)

## Set up
 - `git clone https://github.com/hacksoc-manchester/Hackathon_Attendee_Hub.git`
 - `cd Hackathon_Attendee_Hub/back-end`
 - `cp .env.example .env`
 - Replace placeholders in .env

## Local environment deployment
 - Complete the set up (above)
 - `npm i`
 - `npm start` or `npm run start:watch` for automatic restarts after editing code
 
## Production environment deployment
 - Complete the set up (above)
 - `./launch_production.sh`

## Tests
 - Complete the set up (above)
 - `npm i`
 - `npm t` or `npm run test:watch` to run tests automatically everytime a change has been made to the tests