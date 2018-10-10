# GreatUniHack 2018 Attendee Hub Back-end

[![Build Status](https://travis-ci.org/hacksoc-manchester/GUH18-Hub.svg?branch=master)](https://travis-ci.org/hacksoc-manchester/GUH18-Hub)
![GitHub](https://img.shields.io/github/license/hacksoc-manchester/GUH18-Hub.svg)

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
