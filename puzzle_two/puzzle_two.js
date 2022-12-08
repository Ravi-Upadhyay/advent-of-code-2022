import { open, rm } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';

let RESULTS = [];
let FORMATTED_DATA = [];
let SCORESPERGAME = [];
let TOTALPERSONALSCORE;

const INPUT_FILE = './input_data.txt';
const OUTPUT_FILE = './parsed_data.json';

let PUZZLE_2 = {};

const SCORES = {
    LOST: 0,
    DRAW: 3,
    WIN: 6,
};



function getWeightage(result) {
    const outcome = OUTCOMES.find((o) => {
        return o.aliases.includes(result);
    });
    return outcome ? outcome.weightage : 0;
}

const OUTCOMES = [
    { code: 'R', fullName: 'ROCK', weightage: 1, aliases: ['A', 'X'], opponent: 'A', yourself: 'X'},
    { code: 'P', fullName: 'PAPER', weightage: 2, aliases: ['B', 'Y'], opponent: 'B', yourself: 'Y'},
    { code: 'S', fullName: 'SCISSORS', weightage: 3, aliases: ['C', 'Z'], opponent: 'C', yourself: 'Z'},
];

function next(i) {
    const outcomesLength = OUTCOMES.length;
    const firstIndex = 0;
    const lastIndex = outcomesLength - 1;
    if (i === lastIndex) return firstIndex;
    return ++i; 
}

function getOutcomeIndex(result) {
    return OUTCOMES.findIndex((o) => {
        return o.aliases.includes(result);
    });
}

function getResultOfTheRound(opponent, yourself) {
    // P <- (S) <-R <- P (Circular Linked List)
    const outcomeIndexOpponent = getOutcomeIndex(opponent);
    const outcomeIndexYourself = getOutcomeIndex(yourself);
    const nextIndexToOpponent = next(outcomeIndexOpponent);
    
    if (outcomeIndexOpponent === outcomeIndexYourself) return 'DRAW';
    if (outcomeIndexYourself === nextIndexToOpponent) return 'WIN';
    return 'LOST'; 
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


