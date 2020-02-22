import { ReservedHardwareService } from "../../services/hardware/reservedHardwareService";
import { token } from "morgan";
import { create } from "domain";

const fs = require('fs');
/**
 * Generates a uuid token for the hardware item reservation
 */

/**
 * Number of adjectives: 159, number of nouns: 40, number of verbs 329
 */

function getRandomInt(length) {
    return Math.floor(Math.random() * Math.floor(length));
  }

let words = fs.readFileSync(__dirname + '/words.txt','utf8');
let listWords = words.split("\n")
let startAdj = 0
let startNoun = 160
let startVerbs = 200

export const createToken = (): string => {
  let token = "";
  let randomAdjective = listWords[getRandomInt(159)]
  let randomNoun = listWords[getRandomInt(40) + startNoun]
  let randomVerb = listWords[getRandomInt(329) + startVerbs]
  token = randomAdjective + "-" + randomNoun + "-" + randomVerb;
  return token;
};