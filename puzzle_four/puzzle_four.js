import { open, rm } from 'node:fs/promises';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';
const PAIRS_DATA = [];

function checkIfFullyContained(first, second) {
    const firstLowBound = parseInt(first[0]);
    const firstHighBound = parseInt(first[1]);
    const secondLowBound = parseInt(second[0]);
    const secondHighBound = parseInt(second[1]);

if (firstLowBound > secondLowBound) {
        return (secondHighBound >= firstLowBound && secondHighBound >= firstHighBound);
    } else if (firstLowBound < secondLowBound) {
        return (firstHighBound >= secondLowBound && firstHighBound >= secondHighBound)
    } else { // (firstLowBound == secondLowBound)
        return true; 
    }
}

function checkOverlap(first, second) {
    const firstLowBound = parseInt(first[0]);
    const firstHighBound = parseInt(first[1]);
    const secondLowBound = parseInt(second[0]);
    const secondHighBound = parseInt(second[1]);

    if (firstLowBound > secondLowBound) {
        return (secondHighBound >= firstLowBound);
    } else if (firstLowBound < secondLowBound) {
        return (firstHighBound >= secondLowBound);
    } else { //(firstLowBound == secondLowBound) 
        return true; 
    }
}

function countOfFullyContained(data = PAIRS_DATA) {
    let counter = 0;
    for(const p of data) {
        if(p.fullOverlap) counter += 1;
    }
    return counter; 
}

function countOfPartialOverlap(data = PAIRS_DATA) {
    let counter = 0;
    for(const p of data) {
        if(p.partialOverlap) counter += 1;
    }
    return counter; 
}

async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            formattedData: PAIRS_DATA,
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

(async function() {
    let file;
    try {
        file = await open(INPUT_FILE);
        for await (const line of file.readLines()) {
            const data = {};
            const pair = line.split(',');
            const elfOne = pair[0];
            const elfTwo = pair[1];
            const elfOneSections = elfOne.split('-');
            const elfTwoSections = elfTwo.split('-');

            const fullOverlap = checkIfFullyContained(elfOneSections, elfTwoSections);
            const partialOverlap = checkOverlap(elfOneSections, elfTwoSections);

            PAIRS_DATA.push({
                pair,
                elfOneSections,
                elfTwoSections,
                fullOverlap,
                partialOverlap,
            });
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        console.log('Console of Pairs Data: ', PAIRS_DATA);
        const countFullOverlap = countOfFullyContained(PAIRS_DATA);
        const countPartialOverlap = countOfPartialOverlap(PAIRS_DATA);
        console.log('Count of Fully Contained: ', countFullOverlap);
        console.log('Count of Partial Contained: ', countPartialOverlap);
        writeParsedDataToFile();
    }
})();