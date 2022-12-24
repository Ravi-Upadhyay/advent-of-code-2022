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

function isVisibleFromSide(arr, m) {
    let isVisible = arr.every((e) => e < m);
    // console.log('I am inside - isVisibleFromSide: array, comparator, isVisible: ', arr, m, isVisible);
    return isVisible;
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
        
        /* Further Processing the data */
        // Trees at boundary/border are always visible - i.e first row, last row, first column, last column
        const rowIndexVisible = [0, (parseInt(numberOfRows) - 1)];
        const columnIndexVisible = [0, (parseInt(numberOfColumns) - 1)];
        transposedMatrix = getMatrixTransposed(matrix, numberOfRows, numberOfColumns); // Interchange Row And Columns
        let countOfVisible = 0;
        let visibleTrees = [];

        for (let row = 0; row < numberOfRows; row++) {
            for (let column = 0; column < numberOfColumns; column++) {
                let visible = false;
                let location = `[${row}][${column}]`;
                let height = parseInt(matrix[row][column]);
                
                if (rowIndexVisible.includes(row) || columnIndexVisible.includes(column)) {
                    visible = true;
                } else {
                    visible = checkIfTreeIsVisbleFromOutside(matrix, transposedMatrix, height, row, column);
                }
                
                if (visible) {
                    ++countOfVisible;
                    let tree = new Tree(height, location, visible);
                    visibleTrees.push(tree);
                }
            }
        }
        PARSED_DATA = {...PARSED_DATA, countOfVisible, visibleTrees};
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
        if (file) file.close();
    }
}