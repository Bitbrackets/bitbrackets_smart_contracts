const _ = require('lodash');
const { 
    parseBigInt, 
    formatBigInt, 
    parseToInt, 
    getBinaryString, 
    getScore
} = require('./ScoreUtil');


describe('Unit tests for ScoreUtil JS', () => {
    let predictionStr, prediction, 
        exactPredictionStr, exactPrediction, result, 
        resultStr, resultLength;


    beforeEach(() => {
        // 10101101 first results
        predictionStr = "10 01 10 01"; // should score 2
        prediction = parseToInt(predictionStr);

        exactPredictionStr = "01010101 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
        exactPrediction = parseToInt(exactPredictionStr);

        resultStr = "01010101 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
        result = parseToInt(resultStr);
        resultLength = resultStr.replace(/\s+/g, '').length;
    });

    it('Exact Prediction and Result should match', () => {
        console.log("exact Prediction", exactPrediction);

        console.log("results", result);
        console.log("results length", resultLength);

        assert.equal(result, exactPrediction);
    });

    it('Should convert prediction to String Binary', () => {
        const str = _.padStart(getBinaryString(result),resultLength, '0');

        assert.equal(str, resultStr.replace(/\s+/g, ''));
    });

    it('Should calculate score of prediction', () => {
        const score = getScore(prediction, result, 4, 2);

        assert.equal(2, score);
    });
    
});