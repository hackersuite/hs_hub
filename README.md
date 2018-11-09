# GreatUniHack 2018 Attendee Hub Back-end

[![Build Status](https://travis-ci.org/hacksoc-manchester/GUH18-Hub.svg?branch=master)](https://travis-ci.org/hacksoc-manchester/GUH18-Hub)
![GitHub (pre-)release](https://img.shields.io/github/release/hacksoc-manchester/GUH18-Hub/all.svg)
![GitHub](https://img.shields.io/github/license/hacksoc-manchester/GUH18-Hub.svg)
[![codebeat badge](https://codebeat.co/badges/5fb19431-268e-4629-9705-1811a8f45b9c)](https://codebeat.co/projects/github-com-hacksoc-manchester-guh18-hub-master)

## Dependencies

 - Node.js
 - MySQL database (will probably be replaced with PostreSQL)

## Set up
 - `git clone https://github.com/hacksoc-manchester/GUH18-Hub.git`
 - `cd GUH18-Hub/back-end`
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