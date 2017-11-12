/**
 * Fake loader
 */

const fakeLoader = new CirFakeLoader();

/**
 * Year slider
 */

const slider = document.getElementById("slider");

noUiSlider.create(slider, {
  start: [1920, 2017],
  connect: true,
  padding: 0,
  range: {
    min: 1920,
    max: 2017
  },
  step: 1,
  format: wNumb({
    decimals: 0
  })
});

slider.noUiSlider.on("update", function () {
  const yearSliderValue = slider.noUiSlider.get();
  $("#yearStart").text(yearSliderValue[0]);
  $("#yearEnd").text(yearSliderValue[1]);
});

/**
 * Conference inputs
 */

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

function renderFormFromSearch() {
  let {
    conferences,
    yearRange
  } = $location.search();
  const $inputs = $("[name=conferences]").slice(0, -1);

  conferences = conferences || ["ArXiv"];
  conferences = Array.isArray(conferences) ? conferences : [conferences];
  conferences.forEach((venue, i) => {
    if (i >= $inputs.length) {
      addConferenceInput(venue);
    } else {
      $inputs.eq(i).val(venue);
    }
  });

  $inputs.slice(conferences.length).each((_, input) => {
    input.value = "";
  });

  if (yearRange) {
    slider.noUiSlider.set(yearRange);
  }
}

function getFormParams() {
  return {
    conferences: $("#filterForm")
      .serializeArray()
      .map(kp => kp.value)
      .slice(0, -1)
      .filter(kp => kp !== ""),
    yearRange: slider.noUiSlider.get()
  };
}

function submitQuery() {
  const {
    conferences,
    yearRange
  } = getFormParams();

  const requests = [];
  conferences.forEach(conference => {
    requests.push(
      axios.get(
        `${API_HOST}/trends/conference?name=${conference}&minYear=${yearRange[0]}&maxYear=${yearRange[1]}`
      )
    );
  });

  axios.all(requests).then(
    axios.spread((...allData) => {
      const parseData = [];

      allData.forEach((conference, i) => {
        conference.data.forEach(data => {
          parseData.push({
            conference: conferences[i],
            year: data.year,
            count: data.count
          });
        });
      });

      updateVisualization(parseData, `Number of Publications for ${conferences.length} Conference${conferences.length > 1 ? 's' : ''} from ${yearRange[0]} to ${yearRange[1]}`);
    })
  );
}

/**
 * No data
 */

function removeNoDataMessage() {
  $("div.noDataDiv").remove();
}

function addNoDataMessage() {
  const $noDataDiv = $("<div>")
    .addClass("noDataDiv")
    .css({
      position: "absolute",
      top: "20%",
      left: "0",
      width: "100%",
      height: "100%",
      color: "red",
      'text-align' : 'center'
    })
    .html("No Data Available");
  $("#graph-container").append($noDataDiv);
}

/**
 * UI Behaviors (Controller)
 */

// on submit
$("#filterForm")
  .on("click", ".addButton", () => addConferenceInput())
  .submit(() => {
    $location.search(getFormParams());
  });

function pageLoad() {
  renderFormFromSearch();
  submitQuery();
}

// on search change
cir.run([
  "$rootScope",
  $rootScope => {
    $rootScope.$on("$locationChangeStart", () => pageLoad());
  }
]);

// on page load
$(() => () => pageLoad());

/**
 * D3 Visualisation
 */

function updateVisualization(data, title) {
  removeNoDataMessage();

  $("#graph").empty();

  if(data.length == 0 || data.every(d => d.count == 0)){
    return addNoDataMessage();
  }

  var visualization = d3plus
    .viz()
    .container("#graph")
    .data(data)
    .type("line")
    .id("conference")
    .text("conference")
    .title(title)
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
    source: function (req, updateList) {
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
$(function () {
  attachAutocomplete($("#inlineFormInputGroup"));
});
