/**
 * Fake loader
 */

const fakeLoader = new CirFakeLoader();

/**
 * Slider
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

slider.noUiSlider.on("update", function () {
  const yearSliderValue = slider.noUiSlider.get();
  $("#yearStart").text(yearSliderValue[0]);
  $("#yearEnd").text(yearSliderValue[1]);
});

/**
 * Keyphrase input
 */

const maxFields = 5;
let currentNumFields = 1;

const template = $("#optionTemplate");

function deleteSelf(keyphraseInputObj) {
  $(".addButton").removeAttr("disabled");
  $(keyphraseInputObj)
    .closest(".form-group.row")
    .remove();
  currentNumFields--;
}

function addKeyphraseInput(value) {
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
    keyphrases,
    yearRange
  } = $location.search();
  const $inputs = $("[name=keyphrases]").slice(0, -1);

  keyphrases = keyphrases || ["nlp"];
  keyphrases = Array.isArray(keyphrases) ? keyphrases : [keyphrases];
  keyphrases.forEach((keyphrase, i) => {
    if (i >= $inputs.length) {
      addKeyphraseInput(keyphrase);
    } else {
      $inputs.eq(i).val(keyphrase);
    }
  });

  $inputs.slice(keyphrases.length).each((_, input) => {
    input.value = "";
  });

  if (yearRange) {
    slider.noUiSlider.set(yearRange);
  }
}

function getFormParams() {
  return {
    keyphrases: $("#filterForm")
      .serializeArray()
      .map(kp => kp.value)
      .slice(0, -1)
      .filter(kp => kp !== ""),
    yearRange: slider.noUiSlider.get()
  };
}

function submitQuery() {
  const {
    keyphrases,
    yearRange
  } = getFormParams();

  const requests = [];
  keyphrases.forEach(keyphrase => {
    requests.push(
      axios.get(
        `${API_HOST}/trends/keyphrase?phrase=${keyphrase}&minYear=${yearRange[0]}&maxYear=${yearRange[1]}`
      )
    );
  });

  axios.all(requests).then(
    axios.spread((...allData) => {
      const parseData = [];

      allData.forEach((keyphrase, i) => {
        keyphrase.data.forEach(data => {
          parseData.push({
            keyphrase: keyphrases[i],
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
  .on("click", ".addButton", () => addKeyphraseInput())
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

/*
 *    D3 Visualisation
 */
function updateVisualization(data) {
  fakeLoader.hide();

  $("#graph").empty();
  var visualization = d3plus
    .viz()
    .container("#graph")
    .data(data)
    .type("line")
    .id("keyphrase")
    .text("keyphrase")
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
 * Auto complete
 */

function attachAutocomplete($dom) {
  $dom.autocomplete({
    source: function (req, updateList) {
      var searchParams = new URLSearchParams();
      searchParams.set("domain", "keyphrase");
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
