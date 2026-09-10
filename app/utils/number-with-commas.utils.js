const numberWithCommas = (number) => {
  if (number === "undefined" || number === null) return "Not Available";
  let num = number;
  if (number?.toString()[0] === "-") {
    num = number.toString().substring(1);
  }

  if (num) {
    let no =
      num.toString().split(".")[0].length > 3
        ? `${num
            .toString()
            .substring(0, num.toString().split(".")[0].length - 3)
            .replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${num
            .toString()
            .substring(num.toString().split(".")[0].length - 3)}`
        : num.toString();

    if (number.toString()[0] === "-") {
      no = `-${no}`;
    }
    return no;
  }
  return 0;
};

module.exports = { numberWithCommas };
