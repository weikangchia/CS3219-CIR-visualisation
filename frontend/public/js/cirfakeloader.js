class CirFakeLoader {
  /**
  * Initialise the fakeloader animation.
  */
  constructor(parentSelector, hide) {
    const $parent = $(parentSelector || "body");
    this.$fakeLoader = $("<div id='fakeLoader'></div>");
    $parent.append(this.$fakeLoader);
    const options = {
      zIndex: "999",
      spinner: "spinner1",
      bgColor: "#2ecc71"
    };
    if (hide) {
      this.$fakeLoader.hide();
    }
    this.$fakeLoader.fakeLoader(options);
  }

  /**
  * Hide the fakeloader animation.
  */
  hide(delay) {
    if (delay) {
      this.$fakeLoader.hide(delay);
    } else {
      this.$fakeLoader.hide();
    }
  }
  /**
  * Show the fakeloader animation.
  */
  show() {
    this.$fakeLoader.show();
  }
}
