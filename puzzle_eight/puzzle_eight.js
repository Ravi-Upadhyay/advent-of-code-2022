import { readFile } from 'node:fs/promises';
import { open, rm } from 'node:fs/promises';
import { throwCustomError, STANDARD_ERROR_MAP } from '../library/error_handler.js';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

const OFFSET_PACKET_MARKER = 4;
const OFFSET_MESSAGE_MARKER = 14;

let PARSED_DATA = {};

(async function() {
    let file;
    try {
        file = await open(INPUT_FILE);
        for await (const line of file.readLines()) {

        }
    }
    catch (e) {
        throwCustomError(STANDARD_ERROR_MAP.FILE_READ, e);
    }
    finally {
        writeParsedDataToFile();
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
        throwCustomError(STANDARD_ERROR_MAP.FILE_WRITE, e);
    }
    finally {
        console.log('Parsed data has been written to the file.');
        // file.close();
    }
}