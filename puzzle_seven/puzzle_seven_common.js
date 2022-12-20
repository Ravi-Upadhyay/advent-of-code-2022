const REGEX_MAP = {
    isCommand: /^\$\s/,
    isFile: /\d+\s\w/,
    isDir: /dir\s\w/,
    commandCD: /^\$\scd/,
    commandCDRoot: /^\$\scd\s\//,
    commandCDChildDir: /^\$\scd\s\w+/,
    commandCDParentDir: /^\$\scd\s\.\./,
    commandLS: /^\$\sls/,
    sizeinLS: /^\d+/,
};

const STATEMENT_TYPES = {
    COMMAND: 1,
    OUTPUT: 2,
};

const COMMAND_TYPES = {
    CD: 1,
    LS: 2,
};

const OUTPUT_TYPES = {
    DIR: 1,
    FILE: 2,
};

const CD_TYPES = {
    ROOT: 1,
    PARENT: 2,
    CHILD: 3,
};

const getStatementType = (statement) => {
    return (isCommand(statement)) ? STATEMENT_TYPES.COMMAND : STATEMENT_TYPES.OUTPUT;
};

const getCommandType = (statement) => {
    let commandType;
    if (isCommandCD(statement)) commandType = COMMAND_TYPES.CD;
    else if (isCommandLS(statement)) commandType = COMMAND_TYPES.LS;
    else commandType = null;
    return commandType;
};

const getOutputType = (statement) => {
    let outputType;
    if (isDir(statement)) outputType = OUTPUT_TYPES.DIR;
    else if (isFile(statement)) outputType = OUTPUT_TYPES.FILE;
    else outputType = null;
    return outputType;
};

const getCdType = (statement) => {
    let cdType;
    if (isCommandCDRoot(statement)) cdType = CD_TYPES.ROOT; 
    else if (isCommandCDParentDir(statement)) cdType = CD_TYPES.PARENT;
    else if (isCommandCDChildDir(statement)) cdType = CD_TYPES.CHILD;
    else cdType = null;
    return cdType;
};

const isCommandLS = (statement) => {
    return REGEX_MAP.commandLS.test(statement);
};

const isCommandCD = (statement) => {
    return REGEX_MAP.commandCD.test(statement);
};

const isCommand = (statement) => {
    return REGEX_MAP.isCommand.test(statement);
};

const isDir = (statement) => {
    return REGEX_MAP.isDir.test(statement);
};

const isFile = (statement) => {
    return REGEX_MAP.isFile.test(statement);
};

const isCommandCDParentDir = (statement) => {
    return REGEX_MAP.commandCDParentDir.test(statement);
};

const isCommandCDChildDir = (statement) => {
    return REGEX_MAP.commandCDChildDir.test(statement);
};

const isCommandCDRoot = (statement) => {
    return REGEX_MAP.commandCDRoot.test(statement);
};

const node = () => {
    return {
        name: '',
        path: '',
        childNodes: [],
        parentNode: '',
        isRootNode: false,
        size: 0
     };
};

const rootNode = () => {
    return { ...node, isRootNode: true, parentNode: undefined };
};

const leafNode = () => {
    return { ...node, childNodes: undefined, isRootNode: undefined };
};

const treeMethods = () => {
    return {node, rootNode, leafNode};
};
export {
    REGEX_MAP,
    STATEMENT_TYPES,
    COMMAND_TYPES,
    OUTPUT_TYPES,
    CD_TYPES,
    getStatementType,
    getCommandType,
    getOutputType,
    getCdType,
    treeMethods,
    isCommand,
    isFile,
    isDir,
};