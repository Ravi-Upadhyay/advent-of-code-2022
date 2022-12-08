import { open, rm } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';
import { OUTCOMES, SCORES, getWeightage, getOutcomeIndex, next, previous } from './puzzle_two_common.js';

let RESULTS = [];
let FORMATTED_DATA = [];
let SCORESPERGAME = [];
let TOTALPERSONALSCORE;

const INPUT_FILE = './input_data.txt';
const OUTPUT_FILE = './parsed_data.json';

let PUZZLE_2 = {};

function getResultOfTheRound(opponent, yourself) {
    // P <- (S) <-R <- P (Circular Linked List)
    const outcomeIndexOpponent = getOutcomeIndex(opponent);
    const outcomeIndexYourself = getOutcomeIndex(yourself);
    const nextIndexToOpponent = next(outcomeIndexOpponent);
    
    if (outcomeIndexOpponent === outcomeIndexYourself) return 'DRAW';
    if (outcomeIndexYourself === nextIndexToOpponent) return 'WIN';
    return 'LOSE'; 
};

function calculateYourScore(data = RESULTS) {
    SCORESPERGAME = data.map((m) => {
        const [ opponent, yourself ] = m;
        const weightage = parseInt(getWeightage(yourself));
        const result = getResultOfTheRound(opponent, yourself);
        const score = parseInt(SCORES[result]) || 0;
        const totalScore = weightage + score
        FORMATTED_DATA.push({
            outcome: m,
            opponentGot: opponent,
            youGot: yourself,
            result,
            scoreFromResult: score,
            scoreFromPlaying: weightage,
            totalScore
        });
        return totalScore;
    });
}

function calculateTotalScoreFromAllRounds(data = SCORESPERGAME) {
    try {
        TOTALPERSONALSCORE = data.reduce((acc, curr) => {
            return parseInt(acc) + parseInt(curr);
        });
    }
    catch (e) {
        console.log('ERROR', 'calculateTotalScoreFromAllRounds()', e);
    }
}

/* SECTION-2: Write parsed data to the file */
async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            rawParsedData: RESULTS,
            formattedData: FORMATTED_DATA,
        };
        file.appendFile(JSON.stringify(data));
    }
    catch (e) {
        console.log('ERROR', 'SECTION-2: Write parsed data to the file: ', e);
    }
    finally {
        console.log('Parsed data has been written to the file.');
        // file.close();
    }
}

function outputPuzzleTwoResults() {
    try{
        PUZZLE_2.YOUR_HIGHEST_SCORE = TOTALPERSONALSCORE;
    }
    catch(e) {
        console.log('ERROR', 'outputPuzzleTwoResults()', e);
    }
}

/* SECTION-1: File Reading to extract Data */
(async () => {
    let file;
    RESULTS = [];
    try {
        file = await open(INPUT_FILE);
      
        for await (const line of file.readLines()) {
            const resultOfTheRound = line.split(' ');
            RESULTS.push(resultOfTheRound);
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        console.log('Results of the competition: ', RESULTS);
        // file.close();
        calculateYourScore();
        calculateTotalScoreFromAllRounds();
        outputPuzzleTwoResults();
        await writeParsedDataToFile();
        console.log('Total Personal Score: ', TOTALPERSONALSCORE);
    }
})();


