/**
 * Fake loader
 */

const fakeLoader = new CirFakeLoader();

/**
 * Year slider
 */

const slider = document.getElementById("slider");

noUiSlider.create(slider, {
  start: [1800, 2017],
  connect: true,
  padding: 0,
  range: {
    min: 1800,
    max: 2017
  },
  step: 1,
  format: wNumb({
    decimals: 0
  })
});

slider.noUiSlider.on("update", function() {
  const yearSliderValue = slider.noUiSlider.get();
  $("#yearStart").text(yearSliderValue[0]);
  $("#yearEnd").text(yearSliderValue[1]);
});

/**
 * Conference inputs
 **/

// url params
$(() => {
  let venues = $location.search()["venues"];
  if (!venues) {
    venues = "ArXiv";
  }
  venues.split(",").forEach((venue, i) => {
    if (i > 0) {
      addConferenceInput(venue);
    } else {
      $("[name=conferences]")
        .eq(0)
        .val(venue);
    }
  });
});

// inputs
const maxFields = 5;
let currentNumFields = 1;

const template = $("#optionTemplate");

function deleteSelf(conferenceInputObj) {
  $(".addButton").removeAttr("disabled");
  $(conferenceInputObj)
    .closest(".form-group.row")
    .remove();
  currentNumFields--;
}

function addConferenceInput(value) {
  if (currentNumFields < maxFields) {
    const clone = template
      .clone()
      .removeAttr("hidden")
      .removeAttr("id")
      .insertBefore(template);

    $input = $(clone).find("input");
    $input.val(value);
    attachAutocomplete($input);

    currentNumFields++;
  }

  if (currentNumFields === maxFields) {
    $(".addButton").attr("disabled", "disabled");
  }
}

$("#filterForm")
  .on("click", ".addButton", () => addConferenceInput())
  .submit(e => {
    fakeLoader.show();

    let conferences = new Array();
    conferences = $("#filterForm").serializeArray();
    conferences.pop();

    $location.search({
      venues: conferences.map(conference => conference.value).join(",")
    });

    const yearRange = slider.noUiSlider.get();

    const requests = [];
    conferences.forEach(conference => {
      requests.push(
        axios.get(
          `${API_HOST}/trends/publication?name=${conference.value}&minYear=${yearRange[0]}&maxYear=${yearRange[1]}`
        )
      );
    });

    axios.all(requests).then(
      axios.spread((...allData) => {
        const parseData = [];

        allData.forEach((conference, i) => {
          conference.data.forEach(data => {
            parseData.push({
              conference: conferences[i].value,
              year: data.year,
              count: data.count
            });
          });
        });

        updateVisualization(parseData);

        fakeLoader.hide(500);
      })
    );
  });

/**
  * D3 Visualisation
  */

function updateVisualization(data) {
  $("#graph").empty();
  var visualization = d3plus
    .viz()
    .container("#graph")
    .data(data)
    .type("line")
    .id("conference")
    .text("conference")
    .width({
      value: $("#graph").width()
    })
    .height({
      value: 300
    })
    .y({
      value: "count",
      label: "No. of Publications"
    }) // key to use for y-axis
    .x("year") // key to use for x-axis
    .format({
      text: (text, params) => {
        if (text === "count") {
          return "Number of Publications";
        } else {
          return d3plus.string.title(text, params);
        }
      }
    })
    .time("year")
    .timing({
      transitions: 1000
    })
    .draw();
}

/**
* Auto-complete
*/

function attachAutocomplete($dom) {
  $dom.autocomplete({
    source: function(req, updateList) {
      var searchParams = new URLSearchParams();
      searchParams.set("domain", "venue");
      searchParams.set("search", req.term);
      var url = API_HOST + "/autocomplete?" + searchParams.toString();
      $.ajax({
        url: url,
        success: updateList
      });
    }
  });
}
// attach to first input
$(function() {
  attachAutocomplete($("#inlineFormInputGroup"));
});
