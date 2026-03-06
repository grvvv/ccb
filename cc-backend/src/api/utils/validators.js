exports.getCleanNumber = (input) => {
  const regex = /^(?:\+91[\-\s]?)?[0]?(?:91)?([6-9]\d{9})$/;
  const match = input.trim().match(regex);
  
  // Return the first captured group (the 10 digits) or null
  return match ? match[1] : null;
};