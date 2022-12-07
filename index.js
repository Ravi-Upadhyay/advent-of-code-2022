const { open } = require('node:fs/promises');

(async () => {
  const file = await open('./input-data.txt');
  let elves = [];
  let itemCalorie = [];
  for await (const line of file.readLines()) {
    if (line) {
        itemCalorie.push(line);
    } else {
        elves.push(itemCalorie);
        itemCalorie = [];
    }
  }

  let caloriePerElve = elves.map((a) => {
    return a.reduce((acc,curr) => {
        return parseInt(acc, 10)+parseInt(curr, 10);
    });
  });
  
  let sortedByCaloriePerElve = caloriePerElve.sort((a,b) => {
    return b-a;
  });

  console.log(sortedByCaloriePerElve);
})();
