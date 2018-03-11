const { parseBigInt, formatBigInt, parseToInt } = require('./ScoreUtil');


describe('Unit tests for ScoreUtil JS', () => {
    let predictionStr, prediction;

    let exactPredictionStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
    let exactPrediction = parseToInt(exactPredictionStr);

    let resultStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
    let result = parseToInt(resultStr);

    beforeEach(() => {
        // 10101101 first results
        predictionStr = "10 01 10 01"; // should score 2
        let prediction = parseInt(exactPredictionStr, 2);
    });

    it('Exact Prediction and Result should match', () => {
        console.log("exact Prediction", exactPrediction);

        console.log("results", result);
        console.log("results length", resultStr.length);

        assert.equal(result, exactPrediction);
    });

    it('Should convert prediction to String Binary', () => {
        const str = ScoreUtil.getBinaryString(result);

        console.log("results", str);

        assert.equal(str, resultStr.trim());
    });

    xit('Should calculate score of prediction', () => {
        const score = ScoreUtil.getScore(prediction, result, 4, 2);


        assert.equal(2, score);
    });
    
});