import { readFile } from 'node:fs/promises';
import { open, rm } from 'node:fs/promises';
import { throwCustomError, STANDARD_ERROR_MAP } from '../library/error_handler.js';
import { Tree } from './Element.js';
const INPUT_FILE = 'input_data.txt';
const OUTPUT_FILE = 'parsed_data.json';

const OFFSET_PACKET_MARKER = 4;
const OFFSET_MESSAGE_MARKER = 14;

let PARSED_DATA = {};

function getMatrixTransposed(matrix, nr, nc) {
    if (nr === nc) {
        let transposedMatrix = [];
        for (let i = 0; i < nr; i++) {
            for (let j = 0; j < nc; j++) {
                if (transposedMatrix[j] === undefined) transposedMatrix[j] = [];
                transposedMatrix[j][i] = matrix[i][j];
            }
        }
        return transposedMatrix;
    } else {
        throwCustomError(STANDARD_ERROR_MAP.DEFAULT, 'Not a square matrix, cannot be transposed');
    }
}

function checkIfTreeIsVisbleFromOutside(matrix, transposedMatrix, height, rI, cI) {
    //Let's first check the row, as it is most simple
    let row = matrix[rI].map((e) => parseInt(e));
    let column = transposedMatrix[cI].map((e) => parseInt(e));

    let visibleFromLeft = isVisibleFromSide(row.slice(0,cI) ,height);
    let visibleFromRight = isVisibleFromSide(row.slice((cI + 1)), height);
    let visibleFromTop = isVisibleFromSide(column.slice(0, rI), height);
    let visibleFromBottom = isVisibleFromSide(column.slice((rI + 1)), height);

    if (visibleFromLeft || visibleFromRight || visibleFromTop || visibleFromBottom) return true;
    return false;
}

/**
 * 
 * @param {INT} arr , Array of elements at one side
 * @param {INT} m , Height of tree
 * @returns {BOOLEAN} If tree will be visible from outside
 */
function isVisibleFromSide(arr, m) {
    let isVisible = arr.every((e) => e < m);
    return isVisible;
}

/**
 * 
 * @param {*} matrix Matrix of Trees [2D]
 * @param {*} transposedMatrix Transpose of Original Matrix [2D], rows <-> columns
 * @param {*} numberOfRows Number of Rows in the original Matrix
 * @param {*} numberOfColumns Number of the Columns in the original Matrix
 * @returns INT countOfVisible, Count of total trees visible from outside
 *          ARRAY visibleTrees, Array of all trees that are visible from outside
 */
function getTreesVisibleFromOutside(matrix, transposedMatrix, numberOfRows, numberOfColumns) {
    let countOfVisible = 0;
    let visibleTrees = [];

    // Trees at boundary/border are always visible - i.e first row, last row, first column, last column
    const rowIndexVisible = [0, (parseInt(numberOfRows) - 1)];
    const columnIndexVisible = [0, (parseInt(numberOfColumns) - 1)];

    for (let row = 0; row < numberOfRows; row++) {
        for (let column = 0; column < numberOfColumns; column++) {
            let visible = false;
            let location = `[${row}][${column}]`;
            let height = parseInt(matrix[row][column]);
            
            // Trees at boundary/border are always visible - i.e first row, last row, first column, last column
            if (rowIndexVisible.includes(row) || columnIndexVisible.includes(column)) {
                visible = true;
            } else { // For others check Visibility
                visible = checkIfTreeIsVisbleFromOutside(matrix, transposedMatrix, height, row, column);
            }
            
            if (visible) {
                ++countOfVisible;
                let tree = new Tree(height, location, visible);
                visibleTrees.push(tree);
            }
        }
    }
    return {countOfVisible, visibleTrees};
}

function getCountOfTreesVisibleInOneDirection(arr, m) {
    let count = 0;
    for (const e of arr) {
        count++;
        if (e >= m) break;
    }
    return count;
}

function getCountOfTreesAllDirection(matrix, transposedMatrix, height, rI, cI) {
    let countLeft = 0; 
    let countTop = 0; 
    let countRight = 0; 
    let countBottom = 0;

    let row = matrix[rI].map((e) => parseInt(e));
    let column = transposedMatrix[cI].map((e) => parseInt(e));

    countLeft = getCountOfTreesVisibleInOneDirection((row.slice(0,cI)).reverse(), height);
    countTop = getCountOfTreesVisibleInOneDirection((column.slice(0, rI)).reverse(), height);
    countRight = getCountOfTreesVisibleInOneDirection(row.slice((cI + 1)), height);
    countBottom = getCountOfTreesVisibleInOneDirection(column.slice((rI + 1)), height);

    return { countLeft, countTop, countRight, countBottom };
}

(async function() {
    let numberOfRows = 0;
    let numberOfColumns = 0;
    let matrix = [];
    let transposedMatrix = [];
    let file;
    try {
        file = await open(INPUT_FILE);
        for await (const line of file.readLines()) {
            let row = line.split('');
            if (numberOfColumns === 0) numberOfColumns = row.length;
            matrix.push(row);
            numberOfRows ++;
        }
        PARSED_DATA = {...PARSED_DATA, matrix, numberOfColumns, numberOfRows};
    
        /* PROBLEM-1 */
        transposedMatrix = getMatrixTransposed(matrix, numberOfRows, numberOfColumns); // Interchange Row And Columns
        // const { countOfVisible, visibleTrees } = getTreesVisibleFromOutside(matrix, transposedMatrix, numberOfRows, numberOfColumns);
        // PARSED_DATA = {...PARSED_DATA, countOfVisible, visibleTrees};

        /* PROBLEM-2 */
        const rowIndexEdge = [0, (parseInt(numberOfRows) - 1)];
        const columnIndexEdge = [0, (parseInt(numberOfColumns) - 1)];

        let highestScenicScore = 0;
    
        for (let row = 0; row < numberOfRows; row++) {
            for (let column = 0; column < numberOfColumns; column++) {
                
                if (rowIndexEdge.includes(row) || columnIndexEdge.includes(column)) continue;
                let height = parseInt(matrix[row][column]);
                let location = `[${row}][${column}]`;

                let { countLeft, countTop, countRight, countBottom } = getCountOfTreesAllDirection(matrix, transposedMatrix, height , row, column);
                let scenicScore = countLeft * countTop * countRight * countBottom;
                if (scenicScore > highestScenicScore) highestScenicScore = scenicScore;
                // console.log('Height, Location, left, top, right, bottom, scenicScore, highestScenicScore: ',
                //  height, location, countLeft, countTop, countRight, countBottom, scenicScore, highestScenicScore);
            }            
        }
        console.log(`The Highest Scenic Score is: ${highestScenicScore}`);
    }
    catch (e) {
        // throwCustomError(STANDARD_ERROR_MAP.FILE_READ, e);
        console.log('Error: ', e);
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
        if (file) file.close();
    }
}