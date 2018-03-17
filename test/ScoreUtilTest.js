const _ = require('lodash');
const { 
    parseBigInt, 
    formatBigInt, 
    parseToInt, 
    getBinaryString, 
    getScore,
    getScoreWithArray
} = require('./ScoreUtil');


describe('Unit tests for ScoreUtil JS', () => {
    let predictionStr, prediction, 
        exactPredictionStr, exactPrediction, result, 
        resultStr, resultLength;


    beforeEach(() => {
        // should score 2
        prediction = [8,2,1,3,5,6,111,17,32,111,9,7,31,28,22,14,111,7,11,30]; 

        exactPrediction = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30];;

        result = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30];
        resultLength = result.length;
    });

    it('Exact Prediction and Result should match', () => {
        console.log("exact Prediction", exactPrediction);

        console.log("results", result);
        console.log("results length", resultLength);

        assert(_.isEqual(result, exactPrediction));
    });

    it('Should calculate score of exact prediction', () => {
        const score = getScoreWithArray(exactPrediction, result, 20);

        assert.equal(20, score);
    });

    it('Should calculate score of prediction', () => {
        const score = getScoreWithArray(prediction, result, 20);

        assert.equal(13, score);
    });
    
});