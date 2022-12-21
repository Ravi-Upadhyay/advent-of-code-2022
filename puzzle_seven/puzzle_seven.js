import { readFile } from 'node:fs/promises';
import { open, rm } from 'node:fs/promises';
import { REGEX_MAP , STATEMENT_TYPES, COMMAND_TYPES, OUTPUT_TYPES, CD_TYPES, 
    getStatementType, getCommandType, getOutputType, getCdType, 
    isCommand, isFile, isDir, treeMethods} from './puzzle_seven_common.js';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

let PARSED_DATA = {};
PARSED_DATA.statements = []; // All processed statements
PARSED_DATA.directoryStructure = {}; // Directory structure (Tree)
PARSED_DATA.errors = []; // Errors during processing

function isEmpty(arr) {
    return !(arr?.length > 0);
}

function getPath(dirs) {
    console.log('GET PATH function', dirs);
    return dirs.join('/').replace('//', '/');
}

function getParentDirName(dirs) {
    const dirsLen = dirs.length;
    return (dirsLen) ? dirs[(dirsLen - 1)] : null;
}

function isOutputProcessed (os) {
    return !isEmpty(os);
}

function getCDDirName (statement) {
    const splitArr = statement.split(' ');
    return splitArr.pop();
}

function getOutputDirDetails(statement) {
    const splitArr = statement.split(' ');
    return {
        name: splitArr.pop(),
    };
}

function getOutputFileDetails(statement) {
    const splitArr = statement.split(' ');
    return {
        name: splitArr.pop(),
        size: splitArr.pop(),
    };
}

function attachNodeToDirStructure(ds, pa, node) {
    // console.log('At Start, ds, pa, node', ds, pa, node);
    let location = pa.reduce((pds, d, i) => {

    } ,ds);
    console.log('At end:  location: ', location);
}

function getNodeToBeAttached(o) {
    let node;
    let nodeMetaData;
    if (o.outputTypeCode === OUTPUT_TYPES.DIR) {
        nodeMetaData = { ...treeMethods.node() };
    } else if (o.outputTypeCode === OUTPUT_TYPES.FILE) {
        nodeMetaData = { ...treeMethods.leafNode() }; 
    }
    nodeMetaData = {...nodeMetaData, ...o};
    node = { metaData: nodeMetaData };
    return node;
}

function processTerminalOutput(wd, os, ds) {
    const parentNode = getParentDirName(wd);
    const path = getPath(wd);

    if (parentNode === null) {
        const customError = new Error('processTerminalOutput(), parentNode is null, Unhandled  Exception');
        PARSED_DATA.errors.push(customError);
        throw customError;
    }

    for (const o of os) {
        let node = getNodeToBeAttached(o);
        let { metaData } = node;
        metaData = {...metaData, parentNode, path};
        node = {...node, metaData};
        // attachNodeToDirStructure(wd, path, ds);
        console.log('Node to be Added: ', node);
    }
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
                const workingDirectoryBefore = [...workingDirctoryStack];
                const pendingProcess = isOutputProcessed(outputStack);

                if(pendingProcess) {
                    processTerminalOutput(workingDirectoryBefore, outputStack, PARSED_DATA.directoryStructure);
                    outputStack = [];
                }

                if (commandType === COMMAND_TYPES.CD) {                                           
                    const cdType = getCdType(line);
                    if (cdType === CD_TYPES.ROOT) {
                        console.log(`Info: "${line}" is CD COMMAND, ROOT`);
                        const rootInWD = workingDirctoryStack.includes('/');
                        if (!rootInWD) { 
                            const name = getCDDirName(line);
                            workingDirctoryStack.push(name);
                            const path = getPath(workingDirctoryStack);
                            let node = {
                                ...treeMethods.rootNode(),
                                name,
                                path,
                            };
                            PARSED_DATA.directoryStructure = { ...PARSED_DATA.directoryStructure, [name]: node };
                            // console.log('treeMethods.rootNode, workingDirectoryStack ,name, path: ', treeMethods.rootNode(), workingDirctoryStack ,name, path);
                        } 
                        else  {
                            const customError = new Error('"/", Root directory already exists in workingDirectoryStack, Unhandled  Exception');
                            PARSED_DATA.errors.push(customError);
                            throw customError;
                        }

                    } else if (cdType === CD_TYPES.CHILD) {
                        console.log(`Info: "${line}" is CD COMMAND, CHILD Traverse`);
                        const name = getCDDirName(line);
                        const parentNode = getParentDirName(workingDirctoryStack);
                        workingDirctoryStack.push(name);
                        const path = getPath(workingDirctoryStack);
                    } else if (cdType === CD_TYPES.PARENT) {                                
                        console.log(`Info: "${line}" is CD COMMAND, PARENT Traverse`);
                        if(isEmpty(workingDirctoryStack)) {
                            const customError = new Error('Cd.. unsucessful, No directory in workingDirectoryStack');
                            PARSED_DATA.errors.push(customError);
                            throw customError;
                        }
                        workingDirctoryStack.pop();
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
                * 1. check if DIR or FILE
                * 2. If, DIR 
                *   2.A. 
                * */

                const outputType = getOutputType(line);

                if (outputType === OUTPUT_TYPES.DIR) {
                    console.log(`Info: "${line}" is OUTPUT, DIR`);
                    const { name } = getOutputDirDetails(line);
                    outputStack.push({
                        outputType: 'DIR',
                        outputTypeCode: OUTPUT_TYPES.DIR,
                        name ,
                        size: 0,
                    });

                } else if (outputType === OUTPUT_TYPES.FILE) {
                    console.log(`Info: "${line}" is OUTPUT, FILE`);
                    const { name, size } = getOutputFileDetails(line);
                    outputStack.push({
                        outputType: 'FILE',
                        outputTypeCode: OUTPUT_TYPES.FILE,
                        name,
                        size,
                    });
       
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