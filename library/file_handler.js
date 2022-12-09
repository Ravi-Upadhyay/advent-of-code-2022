// import { open, rm } from 'node:fs/promises';

// /* Opening And Reading Data From File */
// async function ReadFromFile(INPUT_FILE) {
//     let file;
//     try {
//         file = await open(INPUT_FILE);
//         return file;
//     }
//     catch (e) {
//         console.log('ERROR', 'LIBRARY OpenFile ', e);
//     }
//     finally {
//         file.close();
//     }
// }