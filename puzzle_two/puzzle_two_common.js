const OUTCOMES = [
    { code: 'R', fullName: 'ROCK', weightage: 1, aliases: ['A', 'X'], opponent: 'A', yourself: 'X'},
    { code: 'P', fullName: 'PAPER', weightage: 2, aliases: ['B', 'Y'], opponent: 'B', yourself: 'Y'},
    { code: 'S', fullName: 'SCISSORS', weightage: 3, aliases: ['C', 'Z'], opponent: 'C', yourself: 'Z'},
];

const SCORES = {
    LOST: 0,
    DRAW: 3,
    WIN: 6,
};

const SECRET_TACTIC_CODES = {
    X: 'LOSE', 
    Y: 'DRAW',
    Z: 'WIN'  
}

function getWeightage(result) {
    const outcome = OUTCOMES.find((o) => {
        return o.aliases.includes(result);
    });
    return outcome ? outcome.weightage : 0;
}

function getOutcomeIndex(result) {
    return OUTCOMES.findIndex((o) => {
        return o.aliases.includes(result);
    });
}

function reCalculateYouGot(i) {
    return OUTCOMES[i].yourself;
}

function next(i, data = OUTCOMES) {
    const outcomesLength = data.length;
    const firstIndex = 0;
    const lastIndex = outcomesLength - 1;
    if (i === lastIndex) return firstIndex;
    return ++i; 
}

function previous(i, data = OUTCOMES) {
    const outcomesLength = data.length;
    const firstIndex = 0;
    const lastIndex = outcomesLength - 1;
    if (i === firstIndex) return lastIndex;
    return --i; 
}

export {
    OUTCOMES,
    SCORES,
    SECRET_TACTIC_CODES,
    getWeightage,
    getOutcomeIndex,
    reCalculateYouGot,
    next,
    previous,
};