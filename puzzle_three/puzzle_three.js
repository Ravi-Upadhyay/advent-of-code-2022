import { open, rm } from 'node:fs/promises';
import { getPriority } from './puzzle_three_common.js';

const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

let FORMATTED_ruckSACK_DATA = [];

function compareItemsInCompartments(fc, sc) {
    let hadError = false;
    let itemWithError;
    let priorityItemError;
    for (const i of fc) {
        hadError = sc.includes(i);
        if (hadError) {
            itemWithError = i;
            priorityItemError = getPriority(i);
            break;
        }
    }
    return {
        hadError,
        itemWithError,
        priorityItemError,
    };
}

function getSumOfPrioritiesOfErrors(data = FORMATTED_ruckSACK_DATA) {
    let prioritySum = 0;
    for (const item of data) {
        const priority = (item.hadError) ? item.priorityItemError : 0;
        prioritySum += priority;
    }
    return prioritySum;
}

/* SECTION-2: Write parsed data to the file */
async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            formattedData: FORMATTED_ruckSACK_DATA,
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

(async () => {
    let file;
    try {
        file = await open(INPUT_FILE);
        for await (const line of file.readLines()) {
            const rucksackItems = line;

            const itemsCount = rucksackItems.length;
            const itemsCountHalf = itemsCount / 2;
            /* TODO: Know that problem says that each compartment can have exactly equal number of items'
               which is why fractions not handled. */
            const firstCompartment = rucksackItems.substring(0, itemsCountHalf);
            const secondCompartment = rucksackItems.substring(itemsCountHalf);
            const sortingError = compareItemsInCompartments(firstCompartment, secondCompartment);

            FORMATTED_ruckSACK_DATA.push({ rucksackItems, firstCompartment, secondCompartment, itemsCount, itemsCountHalf, ...sortingError });
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        console.log('rucksack Items, Data: ', FORMATTED_ruckSACK_DATA);
        console.log('Result - Total of Priorities of all Errors', getSumOfPrioritiesOfErrors(FORMATTED_ruckSACK_DATA));
        await writeParsedDataToFile();
        // file.close();
    }
})();

