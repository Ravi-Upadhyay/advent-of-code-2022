import { open, rm } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';

let ELVES = [];
let ELVESWITHTOTALCALORIES = [];
let ELVESWITHTOTALCALORIES_SORTED_ASC = [];
let PUZZLE_1 = {};

const INPUT_FILE = './input_data.txt';
const OUTPUT_FILE = './parsed_data.txt';

/* SECTION-1: File Reading to extract Data */
(async () => {
    let file;
    try {
        file = await open(INPUT_FILE);
        
        let itemCalorie = [];
      
        for await (const line of file.readLines()) {
          if (line) {
              itemCalorie.push(parseInt(line));
          } else {
              ELVES.push(itemCalorie);
              itemCalorie = [];
          }
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        // console.log('Elves with items and calories: ', ELVES);
        file.close();
        sumUpCaloriesOfItems();
        sortAscendingOnCalories();
        outputPuzzleOneResults()
        await writeParsedDataToFile();
    }
})();

/* SECTION-1.A Sum Up all the calories an Elf is having */
function sumUpCaloriesOfItems(data = ELVES) {
    try {
        ELVESWITHTOTALCALORIES = data.map((a) => {
            return a.reduce((acc,curr) => {
                return parseInt(acc, 10)+parseInt(curr, 10);
            });
        });
    }
    catch(e) {
        console.log('ERROR', 'sumUpCaloriesOfItems()', e);
    }
}


/* SECTION-1.B Sort Ascending based on calories per elf */
function sortAscendingOnCalories(data = ELVESWITHTOTALCALORIES) {
    try {
        ELVESWITHTOTALCALORIES_SORTED_ASC = data.sort((a,b) => {
            return b-a;
        });
    }
    catch(e) {
        console.log('ERROR', 'sortAscendingOnCalories()', e);
    }
}

function sumOfCaloriesWithTopThreeElves(data = ELVESWITHTOTALCALORIES_SORTED_ASC) {
    const numberOfItems = data.length;
    let finalSum = 0;
    if (numberOfItems) {
        const sumTill = (numberOfItems < 3) ? (numberOfItems - 1) : 2;
        let i = 0;
        for (i; i <= sumTill; i++) {
            finalSum += data[i];
        }
    }
    return finalSum;
}

function outputPuzzleOneResults() {
    try{
        PUZZLE_1.MAX_CALORIES_WITH_AN_ELF = ELVESWITHTOTALCALORIES_SORTED_ASC.length ? ELVESWITHTOTALCALORIES_SORTED_ASC[0] : undefined;
        PUZZLE_1.SUM_OF_CALORIES_WITH_TOP_THREE_ELVES = sumOfCaloriesWithTopThreeElves(ELVESWITHTOTALCALORIES_SORTED_ASC);
        console.log('Output - Maximum Calories an Elf is having: ', PUZZLE_1.MAX_CALORIES_WITH_AN_ELF);
        console.log('Output - Sum of Calories with Top Three Elf: ', PUZZLE_1.SUM_OF_CALORIES_WITH_TOP_THREE_ELVES);
    }
    catch(e) {
        console.log('ERROR', 'outputPuzzleOneResults()', e);
    }
}

/* SECTION-2: Write parsed data to the file */
async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');

        // 2.A Append Raw Data
        file.appendFile('2.A RAW PARSED DATA: \n\n', 'utf8');
        for (const elf of ELVES) {
            file.appendFile(`[${elf.toString()}]\n`,'utf8');
        }

        // 2.B Append Total Calorie per Elf Sorted Ascending
        file.appendFile('.B TOTAL CALORIE PER ELF, SORTED ASCENDING: \n\n', 'utf8');
        for (const elf of ELVESWITHTOTALCALORIES_SORTED_ASC) {
            file.appendFile(`[${elf.toString()}]\n`,'utf8');
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-2: Write parsed data to the file: ', e);
    }
    finally {
        console.log('Parsed data has been written to the file.');
        file.close();
    }
}


