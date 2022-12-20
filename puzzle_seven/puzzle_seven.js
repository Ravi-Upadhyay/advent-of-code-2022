import { readFile } from 'node:fs/promises';
import { open, rm } from 'node:fs/promises';
import { REGEX_MAP , STATEMENT_TYPES, COMMAND_TYPES, OUTPUT_TYPES, CD_TYPES, 
    getStatementType, getCommandType, getOutputType, getCdType, 
    isCommand, isFile, isDir} from './puzzle_seven_common.js';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

let PARSED_DATA = {};
PARSED_DATA.statements = []; // All processed statements
PARSED_DATA.directoryStructure = {}; // Directory structure (Tree)
PARSED_DATA.errors = []; // Errors during processing

function isEmpty(arr) {
    return !(arr?.length > 0);
}

function ifChangeToDirInPath(arr, dir) {

}

function getPath(dirs) {
    dirs.join('/').replace('//', '/');
}

(async function() {
    let file;
    let readHead = 1; // ReadHead, At line number
    let workingDirctoryStack = [];
    let outputStack = [];
    let commandQueue = [];

    try {
        file = await open(INPUT_FILE);
        for await (const line of file.readLines()) {  
            const statementType =  getStatementType(line);
            
            /* Language Processor [STARTS] */
            if (statementType === STATEMENT_TYPES.COMMAND) {
                /*
                * 0. PUSH to commandQueue
                * 1. Identify, commandType - CD/LS, as different actions needs to be done
                * 2. If CD, 
                *   2.A. Identify, changeDirectoryType
                *       2.A.1. CD to Directory
                *           2.A.1.a. PUSH to workingDirectoryStack, if the directory doesn't exist currently in working directory 
                *           2.A.1.b. If CD to rootDirectory (/), A special case. Will handle by POP everything out of WD.
                *           2.A.1.c. [OUT OF SCOPE, Checked Input] Infact, (2.A.1.b) reminds that CD can be done to any directory already Processeed and exists in workingDirectoryStack 
                *       2.A.2. CD .. (Out of Directory)
                *           2.A.2.a. POP from workingDirectoryStack
                *           2.A.2.b. Check before POP, if there is any directory in workingDirectoryStack
                *           2.A.2.c. Check before POP, if it is root directory (i.e. RootDirectory is root of tree, CD.. will lead no working Directory)
                *   2.B. Before Changing Directory, Identify if file/dir List is there to process? i.e. Before this command, LS was there or outputStack has data.
                * 3. If LS,
                *   3.A.  
                */

                const commandType = getCommandType(line);

                if (commandType === COMMAND_TYPES.CD) {                                           
                    const cdType = getCdType(line);
                    if (cdType === CD_TYPES.ROOT) {
                        console.log(`Info: "${line}" is CD COMMAND, ROOT`);
                    } else if (cdType === CD_TYPES.CHILD) {
                        console.log(`Info: "${line}" is CD COMMAND, CHILD Traverse`);
                    } else if (cdType === CD_TYPES.PARENT) {                                
                        console.log(`Info: "${line}" is CD COMMAND, PARENT Traverse`);
                    } else { // null, unidentified cdType
                        const customError = new Error('null, unidentified cdType');
                        PARSED_DATA.errors.push(customError);
                        throw customError;
                    }

                } else if (commandType === COMMAND_TYPES.LS) {
                    console.log(`Info: "${line}" is LS COMMAND`);
                } else { // null, unidentified commandType
                    const customError = new Error('null, unidentified commandType');
                    PARSED_DATA.errors.push(customError);
                    throw customError;
                }

            } else { // Output, Not Command
                /*
                * 0. PUSH to outputStack
                * 1. check if dir or file
                * */

                const outputType = getOutputType(line);

                if (outputType === OUTPUT_TYPES.DIR) {
                    console.log(`Info: "${line}" is OUTPUT, DIR`);
                } else if (outputType === OUTPUT_TYPES.FILE) {
                    console.log(`Info: "${line}" is OUTPUT, FILE`);
                } else { // null, unidentified outputType
                    const customError = new Error('null, unidentified outputType');
                    PARSED_DATA.errors.push(customError);
                    throw customError;
                }
            }
            /* Language Processor [ENDS] */

            /* Executed always */
            PARSED_DATA.statements.push(line);
            readHead++;
        }
    }
    catch (e) {
        console.log('ERROR', 'SECTION-1 - File Reading to extract data: ', e);
        PARSED_DATA.errors.push(e);
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
        console.log('ERROR', 'SECTION-2: Write parsed data to the file: ', e);
    }
    finally {
        console.log('Parsed data has been written to the file.');
        // file.close();
    }
}