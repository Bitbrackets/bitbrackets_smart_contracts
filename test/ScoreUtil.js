const _ = require('lodash');

function parseBigInt(bigint, base) {
    //convert bigint string to array of digit values
    for (var values = [], i = 0; i < bigint.length; i++) {
      values[i] = parseInt(bigint.charAt(i), base);
    }
    return values;
  }
  
  function formatBigInt(values, base) {
    //convert array of digit values to bigint string
    for (var bigint = '', i = 0; i < values.length; i++) {
      bigint += values[i].toString(base);
    }
    return bigint;
  }
  
  function convertBase(bigint, inputBase, outputBase) {
    //takes a bigint string and converts to different base
    var inputValues = parseBigInt(bigint, inputBase),
      outputValues = [], //output array, little-endian/lsd order
      remainder,
      len = inputValues.length,
      pos = 0,
      i;
    while (pos < len) { //while digits left in input array
      remainder = 0; //set remainder to 0
      for (i = pos; i < len; i++) {
        //long integer division of input values divided by output base
        //remainder is added to output array
        remainder = inputValues[i] + remainder * inputBase;
        inputValues[i] = Math.floor(remainder / outputBase);
        remainder -= inputValues[i] * outputBase;
        if (inputValues[i] == 0 && i == pos) {
          pos++;
        }
      }
      outputValues.push(remainder);
    }
    outputValues.reverse(); //transform to big-endian/msd order
    return formatBigInt(outputValues, outputBase);
  }

function getBinaryString(n) {    
    return convertBase(n,10,2);
}

module.exports = {
    getScoreWithArray(prediction, result, games) {
      let i = 0;
      let score = 0;

      if (prediction.length !== result.length) {
        throw new Error("expected result and prediction to be the same length");
      }

      while (i < games) {
        if (prediction[i] === result[i]) {
          score++;
        }  
        i++;      
      }

      return score;
    },
    getScore(prediction, result, games, bits) {
      let binPrediction = getBinaryString(prediction);
      let binResult = getBinaryString(result);
      
      let i = 0;
      let score = 0;

      let gamePred, gameRes;
      while (i < games) {
        gamePred = _.take(binPrediction, bits);
        gameRes = _.take(binResult, bits);
        if (_.isEqual(gamePred,gameRes)) {
          score++;
        }
        binPrediction = _.slice(binPrediction, bits);
        binResult = _.slice(binResult, bits);

        i++;
      }

      return score;
    },
    parseToInt(n) {
        return convertBase(n.replace(/\s+/g, ''), 2, 10)
    },
    parseBigInt,
    formatBigInt,
    convertBase,
    getBinaryString

};