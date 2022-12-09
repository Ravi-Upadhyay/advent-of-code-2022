import { open, rm } from 'node:fs/promises';
import { createRequire } from "module";
import { getPriority } from './puzzle_three_common.js';

const require = createRequire(import.meta.url);
const data = require("./parsed_data.json");
const OUTPUT_FILE = './groups_data.json';

let FORMATTED_GROUP_DATA = [];
let FORMATTED_GROUP_BADGE = [];
let NUMBER_OF_GROUPS;
let PRIORITY_SUM_BADGES = 0;
const FORMATTED_ruckSACK_DATA = data.formattedData;
const NUMBER_OF_ruckSACKS = FORMATTED_ruckSACK_DATA.length;


/* SECTION-2: Write parsed data to the file */
async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            formattedData: FORMATTED_GROUP_BADGE,
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

function validateGroupCreation() {
    return (NUMBER_OF_ruckSACKS / 3) === NUMBER_OF_GROUPS;
}

function sortOnItemsCount(rs) {
    return rs.sort((a,b) => {
        return a.itemsCount - b.itemsCount;
    });
}

function pushGroupData(rs) {
    const group = {
        elvesAndRucksack: rs, //Sorting for effective looping
    }
    FORMATTED_GROUP_DATA.push(group);
}

// function isRepeting(k, str) {
//     return (str.indexOf(k) !== str.lastIndexOf(k));
// }

// function isValidBadge(i, rucksackOne, rucksackTwo, rucksackThree) {
//     const repeatRucksackOne = isRepeting(i, rucksackOne);
//     const repeatRucksackTwo = isRepeting(i, rucksackTwo);
//     const repeatRucksackThree = isRepeting(i, rucksackThree);
//     const isValid = !(repeatRucksackOne || repeatRucksackTwo || repeatRucksackThree);

//     console.log('isValidBadge: ', isValid, 'Other Values: ',repeatRucksackOne, repeatRucksackTwo, repeatRucksackThree);
//     return isValid;
// }

/*
{
    "elvesAndRucksack": [
        {
            "rucksackItems": "RCMRQjLLWGTjnlnZwwnZJRZH",
            "itemsCount": 24
        },
        {
            "rucksackItems": "BFpFzSSqSFFSvQsnWgCMjTLzng",
            "itemsCount": 26
        },
        {
            "rucksackItems": "qnvfhpSbvSppNddNdSqbbmmdPrwttJVrVPDVrJtHtwPZhrPJ",
            "itemsCount": 48
        }
    ]
},
*/
function findBadges(data = FORMATTED_GROUP_DATA) {
    FORMATTED_GROUP_BADGE = FORMATTED_GROUP_DATA.map((g) => {
        const groupElvesAndrucksack = g.elvesAndRucksack;
        const rucksackOne = groupElvesAndrucksack[0].rucksackItems;
        const rucksackTwo = groupElvesAndrucksack[1].rucksackItems;
        const rucksackThree = groupElvesAndrucksack[2].rucksackItems;
        
        let badgeItem;
        let priority;

        //Sorted on itemsCount so loop through smallest possible itemList
        for (const i of rucksackOne) {
            if(rucksackTwo.includes(i)) {
                if(rucksackThree.includes(i)) {
                    // let isValid = isValidBadge(i, rucksackOne, rucksackTwo, rucksackThree);
                    // if (isValid) {
                        badgeItem = i;
                        priority = getPriority(i);
                        PRIORITY_SUM_BADGES += priority;
                    // }
                }
            }
        }

        return {
            ...g,
            badgeItem,
            priority,
        };
    });
}

function getPrioritySumBadge() {
    let prioritySum = 0;
    for (const i of FORMATTED_GROUP_BADGE) {
        prioritySum = prioritySum + i.priority;
    }
    return prioritySum;
}

/* 
{
    "rucksackItems": "RCMRQjLLWGTjnlnZwwnZJRZH",
    "firstCompartment": "RCMRQjLLWGTj",
    "secondCompartment": "nlnZwwnZJRZH",
    "itemsCount": 24,
    "itemsCountHalf": 12,
    "hadError": true,
    "itemWithError": "R",
    "priorityItemError": 44
},
*/
(async function groupElvesAndrucksack(){
    let groupElvesAndrucksack = [];

    for (let i = 0; i < NUMBER_OF_ruckSACKS; i++) {
        const { rucksackItems, itemsCount } = FORMATTED_ruckSACK_DATA[i];
        const elfAndrucksack = { rucksackItems, itemsCount };
        groupElvesAndrucksack.push(elfAndrucksack);

        if (i % 3 === 2) {
            pushGroupData(sortOnItemsCount(groupElvesAndrucksack));
            groupElvesAndrucksack = [];
        }
    }
    NUMBER_OF_GROUPS = FORMATTED_GROUP_DATA.length;
    console.log('GroupData: ', FORMATTED_GROUP_DATA);
    console.log('Validation of Group Data: ', NUMBER_OF_ruckSACKS, NUMBER_OF_GROUPS ,validateGroupCreation());
    findBadges(FORMATTED_GROUP_DATA);
    console.log('Badges, Priority Sum: ', PRIORITY_SUM_BADGES);
    console.log('Priority Sum Of Badges', getPrioritySumBadge());
    await writeParsedDataToFile();
})();
