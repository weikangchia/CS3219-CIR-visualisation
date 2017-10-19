const API_HOST = "http://localhost:3000";

function googleSearchUrl(searchTerm) {
  return `https://google.com/search?q=${searchTerm}`;
}

function truncate(str, max) {
  max = max || 20;
  return str.length > max ? `${str.substr(0, max - 1)}…` : str;
}

/**
 * Wrap Y axis function adapted from https://stackoverflow.com/a/43535941/1005162
 */
function wrapYText(text, width) {
  text.each(function () {
    let text = d3.select(this),
      textContent = text.text(),
      tempWord = addBreakSpace(textContent).split(/\s+/),
      x = text.attr("x"),
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy") || 0),
      tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");
    for (let i = 0; i < tempWord.length; i++) {
      tempWord[i] = calHyphen(tempWord[i]);
    }
    textContent = tempWord.join(" ");
    let words = textContent.split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      spanContent,
      breakChars = ["/", "&", "-"];
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        spanContent = line.join(" ");
        breakChars.forEach(char => {
          // remove spaces trailing breakChars that were added above
          spanContent = spanContent.replace(char + " ", char);
        });
        tspan.text(spanContent);
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
    const emToPxRatio = parseInt(
      window.getComputedStyle(text._groups[0][0]).fontSize.slice(0, -2)
    );
    text.attr(
      "transform",
      "translate(-" +
      (margin.left - padding + 10) +
      ", -" +
      lineNumber / 2 * lineHeight * emToPxRatio +
      ")"
    );

    function calHyphen(word) {
      tspan.text(word);
      if (tspan.node().getComputedTextLength() > width) {
        const chars = word.split("");
        let asword = "";
        for (let i = 0; i < chars.length; i++) {
          asword += chars[i];
          tspan.text(asword);
          if (tspan.node().getComputedTextLength() > width) {
            if (chars[i - 1] !== "-") {
              word = word.slice(0, i - 1) + "- " + calHyphen(word.slice(i - 1));
            }
            i = chars.length;
          }
        }
      }
      return word;
    }
  });

  function addBreakSpace(inputString) {
    const breakChars = ["/", "&", "-"];
    breakChars.forEach((char) => {
      // add a space after each break char for the function to use to determine line breaks
      inputString = inputString.replace(char, `${char} `);
    });
    return inputString;
  }
}

/**
 * Wrap X axis function adapted from https://bl.ocks.org/mbostock/7555321
 */
function wrapXText(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
