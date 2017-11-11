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
  let { conferences, yearRange } = $location.search();
  const $inputs = $("[name=conferences]").slice(0, -1);
  console.log($inputs);
  conferences = conferences || ["ArXiv"];
  conferences = Array.isArray(conferences) ? conferences : [conferences];
  conferences.forEach((venue, i) => {
    console.log(i, $inputs.length);
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
  const { conferences, yearRange } = getFormParams();

  const requests = [];
  conferences.forEach(conference => {
    requests.push(
      axios.get(
        `${API_HOST}/trends/publication?name=${conference}&minYear=${yearRange[0]}&maxYear=${yearRange[1]}`
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

      updateVisualization(parseData);
    })
  );
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
