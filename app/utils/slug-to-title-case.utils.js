const toTitleCase = (str) => {
  return str
    .split("-")
    .map((word) => {
      if (word.toLowerCase() === "ul") return "UL"; // brand prefix edge case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
module.exports = { toTitleCase };
