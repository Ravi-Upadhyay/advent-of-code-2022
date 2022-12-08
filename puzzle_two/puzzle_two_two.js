import { open, rm } from 'node:fs/promises';
import { createRequire } from "module";
import { OUTCOMES, SCORES , SECRET_TACTIC_CODES, getWeightage, getOutcomeIndex, reCalculateYouGot, next, previous } from './puzzle_two_common.js';

const require = createRequire(import.meta.url);
const data = require("./parsed_data.json");
const OUTPUT_FILE = './data_after_secret_tactic.json';

let NEW_TOTAL_SCORE = 0;
let FORMATTED_DATA_SECRET_TACTIC = [];
// console.log(data);

/* SAMPLE OBJECT 
    {
        "outcome": [
            "C",
            "X"
        ],
        "opponentGot": "C",
        "youGot": "X",
        "result": "WIN",
        "scoreFromResult": 6,
        "scoreFromPlaying": 1,
        "totalScore": 7
    },
*/
FORMATTED_DATA_SECRET_TACTIC = data.formattedData.map((r) => {
    const prediction = SECRET_TACTIC_CODES[r.youGot];
    let updatedData = {};
    let outcomeUpdated = false;
    if (prediction !== r.result) {
        const outcomeIndexOpponent = getOutcomeIndex(r.opponentGot);
        let outcomeIndexYourselfAsPredicted;
        let result;
        outcomeUpdated = true;
        switch(prediction) {
            case 'LOSE': 
                outcomeIndexYourselfAsPredicted  = previous(outcomeIndexOpponent);
                result = 'LOSE';
                break;
            case 'WIN': 
                outcomeIndexYourselfAsPredicted  = next(outcomeIndexOpponent);
                result = 'WIN';
                break;
            default: // 'DRAW'
                outcomeIndexYourselfAsPredicted = outcomeIndexOpponent;
                result = 'DRAW';
        }
        const previousValues = { previousData: {...r} };
        const opponentGot = r.opponentGot;
        const youGot = reCalculateYouGot(outcomeIndexYourselfAsPredicted);
        const scoreFromResult = parseInt(SCORES[result]) || 0;
        const scoreFromPlaying = parseInt(getWeightage(youGot));
        const totalScore = scoreFromResult + scoreFromPlaying;
        updatedData = { ...previousValues, prediction, outcomeUpdated, opponentGot ,youGot, result, scoreFromResult, scoreFromPlaying, totalScore };

    } else {
        updatedData = { ...r, prediction, outcomeUpdated };
    }
    NEW_TOTAL_SCORE += updatedData.totalScore;
    return updatedData;
});

/* SECTION-2: Write parsed data to the file */
(async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            formattedDataSecretTactic: FORMATTED_DATA_SECRET_TACTIC,
        };
        file.appendFile(JSON.stringify(data));
    }
    catch (e) {
        console.log('ERROR', 'SECTION-2: Write parsed data to the file: ', e);
    }
    finally {
        console.log('Parsed data has been written to the file.');
        console.log('Total Score New: ', NEW_TOTAL_SCORE);
        // file.close();
    }
})();