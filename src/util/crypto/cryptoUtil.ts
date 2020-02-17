import { ReservedHardwareService } from "../../services/hardware/reservedHardwareService";
import { token } from "morgan";

const fs = require('fs');
/**
 * Generates a uuid token for the hardware item reservation
 */

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

let adjectives = fs.readFileSync('adjectives.txt','utf8');
var listAdjectives = adjectives.split("\n")


let nouns = fs.readFileSync('nouns.txt','utf8');
var listNouns = nouns.split("\n")


let verbs = fs.readFileSync('verbs.txt','utf8');
var listVerbs = verbs.split("\n")


export const createToken = async(service: ReservedHardwareService): Promise<string> => {
  var token = "";
  do {
    var randomAdjective = listAdjectives[getRandomInt(listAdjectives.length)]
    var randomNoun = listNouns[getRandomInt(listNouns.length)]
    var randomVerb = listVerbs[getRandomInt(listVerbs.length)]
    token = randomAdjective + "-" + randomNoun + "-" + randomVerb
  } while (await (!service.isTokenTaken(token)));
  return token;
};