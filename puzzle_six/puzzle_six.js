import { readFile } from 'node:fs/promises';
import { open, rm } from 'node:fs/promises';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

const OFFSET_PACKET_MARKER = 4;
const OFFSET_MESSAGE_MARKER = 14;

let PARSED_DATA = {};

function checkIfAllUnique(arr) {
    let match = false;
    const len = arr.length;
    loop1:
    for (let i = (len - 1); i > 0; i--) {
        loop2:
        for (let j = (i - 1); j >= 0 ; j--) {
            if (arr[i] === arr[j]) {
                match = true; 
                break loop1; 
            }
        }
    }
    return !match;
}

function checkMarker(arr, offset, readHead) {
    const validEntries = true;
    if (readHead >= offset) {
        for (const a of arr) {
            if (a === undefined || a === null) validEntries = false;
        }
        if (validEntries) return checkIfAllUnique(arr);
    } 
    return false; 
}

function checkPacketMarker (arr, readHead) {
    return checkMarker(arr, OFFSET_PACKET_MARKER, readHead);
}

function checkMessageMarker (arr, readHead) {
    return checkMarker(arr, OFFSET_MESSAGE_MARKER, readHead);
}

/* PROBLEM 6.1 */
// function findFirstPacketMarker(data = PARSED_DATA) {
//     for (const r of data) {
//         if (r.isPacketMarker) {
//             console.log(`RESULT FOUND - The first packet Marker is at: ${r.index}`);
//             break;
//         }
//     }
// }

function findFirstMessageMarker(data = PARSED_DATA) {
    for (const r of data) {
        if (r.isMessageMarker) {
            console.log(`RESULT FOUND - The first packet Marker is at: ${r.index}`);
            break;
        }
    }
}

(async function() {
    let data;
    try {
        data = await readFile(INPUT_FILE, { encoding: 'utf8' });
        PARSED_DATA.rawData = data.trim();
        let i = 1;

        // let buffer = new Array(OFFSET_PACKET_MARKER);
        let buffer = new Array(OFFSET_MESSAGE_MARKER);
        
        PARSED_DATA.bufferStates = [];
        for (const c of PARSED_DATA.rawData) {
            buffer.push(c);
            buffer.shift();

            /* PROBLEM 6.1. */
            // const isPacketMarker = checkPacketMarker(buffer, i);
            // console.log(buffer, buffer.length, buffer[0], buffer[1], buffer[2], buffer[3], isPacketMarker);
            // PARSED_DATA.bufferStates.push({ buffer, isPacketMarker, index: i});
            
            const isMessageMarker = checkMessageMarker(buffer, i);
            console.log(buffer, buffer.length, buffer[0], buffer[1], buffer[2], buffer[3], isMessageMarker);
            PARSED_DATA.bufferStates.push({ buffer, isMessageMarker, index: i});
            i++;
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
    }
    finally {
        
        writeParsedDataToFile();
        // findFirstPacketMarker(PARSED_DATA.bufferStates);
        findFirstMessageMarker(PARSED_DATA.bufferStates);
    }
})();

async function writeParsedDataToFile() {
    let file;
    try {
        await rm(OUTPUT_FILE);
        file = await open(OUTPUT_FILE, 'a+');
        let data = {
            formattedData: PARSED_DATA,
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