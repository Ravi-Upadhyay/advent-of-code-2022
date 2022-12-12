import { truncate } from 'node:fs';
import { open, rm } from 'node:fs/promises';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

const INITIAL_STATE = {
    "1": ["F", "C", "J", "P", "H", "T", "W"],
    "2": ["G", "R", "V", "F", "Z", "J", "B", "H"],
    "3": ["H", "P", "T", "R"],
    "4": ["Z", "S", "N", "P", "H", "T"],
    "5": ["N", "V", "F", "Z", "H", "J", "C", "D"],
    "6": ["P", "M", "G", "F", "W", "D", "Z"],
    "7": ["M", "V", "Z", "W", "S", "J", "D", "P"],
    "8": ["N", "D", "S"],
    "9": ["D", "Z", "S", "F", "M"]
};

const EXECUTED_STATES = [];


async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            formattedData: EXECUTED_STATES,
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

function getMoves(statement, keywords = { before: 'move', after: 'from' }) {
    const lenBefore = (keywords.before !== null) ? keywords.before.length : 0;
    const start = (keywords.before) ? statement.indexOf(keywords.before) : 0;
    const end = (keywords.after) ? statement.indexOf(keywords.after) : null;

    return (statement.substring(start+lenBefore, end)).trim();
}

function getMoveFrom(statement, keywords = { before: 'from', after: 'to' }) {
    const lenBefore = (keywords.before !== null) ? keywords.before.length : 0;
    const start = (keywords.before) ? statement.indexOf(keywords.before) : 0;
    const end = (keywords.after) ? statement.indexOf(keywords.after) : null;

    return (statement.substring(start+lenBefore, end)).trim();
}

function getMoveTo(statement, keywords = { before: 'to', after: null }) {
    const lenBefore = (keywords.before !== null) ? keywords.before.length : 0;
    const start = (keywords.before) ? statement.indexOf(keywords.before) : 0;

    return (statement.substring(start+lenBefore)).trim();
}

/* move 1 from 1 to 6 */
function languageProcessor(line) {
    const moves = getMoves(line);
    const from = getMoveFrom(line);
    const to = getMoveTo(line);
    return {
        moves,
        from, 
        to,
    }
}

/* moves: 13, from: 6, to: 3 */
function executeSteps(state, steps) {
    let returnState = {...state};
    const { moves, from, to } = steps;
    // console.log('state: ', state, `moves: ${moves}, from: ${from}, to: ${to}`);
    const moveFrom = [...returnState[from]];
    const moveTo = [...returnState[to]];
    for (let i = 1; i <= moves; i++) {
        console.log('Inside Loop: ', 'moves: ', moves, 'from: ', from, 'to: ', to, 'iteration: ', i, 'state: ', state);
        const poppedItem = moveFrom.pop();
        moveTo.push(poppedItem);
        console.log('AfterOperation: ', 'moveFrom: ', moveFrom, 'moveTo: ', moveTo, 'state: ', state, 'returnState: ', returnState);
    }
    // console.log('moveFrom/to after execution: ', moveFrom, moveTo);
    returnState = {...state, [from]: moveFrom, [to]: moveTo};
    // console.log('complete returnState: ', returnState);
    return returnState;
}

/* moves: 13, from: 6, to: 3 */
function executeStepsAtOnce(state, steps) {
    let returnState = {...state};
    const { moves, from, to } = steps;
    // console.log('state: ', state, `moves: ${moves}, from: ${from}, to: ${to}`);
    const moveFrom = [...returnState[from]];
    const moveTo = [...returnState[to]];
    const lastIndexMoveTo = (moveTo.length);

    const movedItems = moveFrom.splice(-(moves), moves);
    moveTo.splice(lastIndexMoveTo, 0, ...movedItems);
    
    // console.log('moveFrom/to after execution: ', moveFrom, moveTo);
    returnState = {...state, [from]: moveFrom, [to]: moveTo};
    // console.log('complete returnState: ', returnState);
    return returnState;
}

(async function() {
    let file;
    EXECUTED_STATES.push({state: INITIAL_STATE});
    try {
        file = await open(INPUT_FILE);
        for await (const line of file.readLines()) {
            const lastState = Object.assign({}, EXECUTED_STATES[((EXECUTED_STATES.length) - 1)].state);
            const steps = languageProcessor(line);
            const executedState = Object.assign({}, executeStepsAtOnce(lastState, steps));
            
            const executedStateData = {
                state: Object.assign({}, executedState),
                steps,
            }
            EXECUTED_STATES.push(executedStateData);
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        writeParsedDataToFile();
    }
})();