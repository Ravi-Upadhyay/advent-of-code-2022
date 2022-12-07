import { open, rm } from 'node:fs/promises';
// import * as readline from 'node:readline';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { Buffer } from 'node:buffer';

let ELVES = [];
let ELVESWITHTOTALCALORIES = [];
let ELVESWITHTOTALCALORIES_SORTED_ASC = [];

/* SECTION-1: File Reading to extract Data */
(async () => {
    let file;
    try {
        file = await open('./input-data.txt');
        
        let itemCalorie = [];
      
        for await (const line of file.readLines()) {
          if (line) {
              itemCalorie.push(parseInt(line));
          } else {
              ELVES.push(itemCalorie);
              itemCalorie = [];
          }
        }
      
        // let caloriePerElve = elves.map((a) => {
        //   return a.reduce((acc,curr) => {
        //       return parseInt(acc, 10)+parseInt(curr, 10);
        //   });
        // });
        
        // let sortedByCaloriePerElve = caloriePerElve.sort((a,b) => {
        //   return b-a;
        // });
      
        // console.log(sortedByCaloriePerElve);
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        console.log('Elves with items and calories: ', ELVES);
        file.close();
        sumUpCaloriesOfItems();
        sortAscendingOnCalories();
        await writeParsedDataToFile();
    }
})();

/* SECTION-1.A Sum Up all the calories an Elf is having */
function sumUpCaloriesOfItems(data = ELVES) {
    ELVESWITHTOTALCALORIES = data.map((a) => {
        return a.reduce((acc,curr) => {
            return parseInt(acc, 10)+parseInt(curr, 10);
        });
    });
}


/* SECTION-1.B Sort Ascending based on calories per elf */
function sortAscendingOnCalories(data = ELVESWITHTOTALCALORIES) {
    ELVESWITHTOTALCALORIES_SORTED_ASC = data.sort((a,b) => {
        return b-a;
    });
}

/* SECTION-2: Write parsed data to the file */
async function writeParsedDataToFile() {
    let file;
    try {
        await rm('./parsed-data.txt');
        file = await open('./parsed-data.txt', 'a+');

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


