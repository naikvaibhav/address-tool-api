"use srict";

let trim = (x) => {
  let value = String(x);
  return value.replace(/^\s+|\s+$/gm, "");
};
let isEmpty = (value) => {
    console.log(Object.keys(value).length === 0 && value.constructor === Object)
  if (
    value === null ||
    value === "undefined" ||
    trim(value) === "" ||
    value.length === 0 ||
   (Object.keys(value).length === 0 && value.constructor === Object)
  ) {
    return true;
  } else {
    return false;
  }
};

let isType = (type, val) => {
    // return !!(val.constructor && val.constructor.name.toLowerCase() === type.toLowerCase());
}

/**
 * exporting functions.
 */
module.exports = {
  isEmpty: isEmpty,
};