/*
* Error Handler Library to Handle Errors
*/

const STANDARD_ERROR_MAP = {
    DEFAULT: 'Something went wrong!',
    FILE_READ: 'Something went wrong while reading file.',
    FILE_WRITE: 'Something went wrong while writing to file.',
};

// const getErrorMessage = (ErrType, param) => {
//     return ()
// };

const getErrorObject = (ErrType) => {
     const customError = new Error(STANDARD_ERROR_MAP[ErrType]);
     return customError;
};

const throwCustomError = (ErrType, param = null) => {
    console.error(`${STANDARD_ERROR_MAP[ErrType]}: , ${(param) ? param : ''}`);
    throw getErrorObject(ErrType);
};

const getCustomErrorTypes = () => {
    return STANDARD_ERROR_MAP.keys();
};

export {
    STANDARD_ERROR_MAP,
    throwCustomError,
    getCustomErrorTypes,
};