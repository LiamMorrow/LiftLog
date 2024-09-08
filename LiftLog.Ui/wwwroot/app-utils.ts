var AppUtils: any = {};
type MDDialog = {
  show: () => void;
  close: () => void;
  open: boolean;
};

AppUtils.getScrollTop = function (element: HTMLElement) {
  return element?.scrollTop;
};

AppUtils.showMdPopup = function (element: MDDialog) {
  return element?.show();
};

AppUtils.vibrate = function (ms: number) {
  navigator.vibrate?.(ms);
  if (AppUtils.getOs() === "unknown") {
    console.log("Vibrating for " + ms + "ms");
  }
};

/**
 * Creates a new event for the dialog close event.
 * This new event has bubbles, which allows blazor components to intercept it
 * @param {HTMLElement} element
 */
AppUtils.onCloseMdPopup = function (element: HTMLElement, preventCancel: boolean | undefined) {
  element?.addEventListener("open", () => {
    if (element?.shadowRoot) {
      const scrim = element.shadowRoot.querySelector(".scrim") as HTMLElement | null;
      if (scrim) {
        scrim.style.zIndex = "99";
      }
    }
  });
  element?.addEventListener("close", () => {
    element?.dispatchEvent(
      new Event("dialog-close", {
        bubbles: true,
        cancelable: true,
      })
    );
  });
  element?.addEventListener("cancel", (event) => {
    if (preventCancel) {
      event.preventDefault();
      return;
    }
    element?.dispatchEvent(
      new Event("dialog-cancel", {
        bubbles: true,
        cancelable: true,
      })
    );
  });
};

AppUtils.onClosedMenu = function (element: HTMLElement) {
  element?.addEventListener("closed", () => {
    element?.dispatchEvent(
      new Event("dialog-close", {
        bubbles: true,
        cancelable: true,
      })
    );
  });
};

AppUtils.hideMdPopup = function (element: MDDialog) {
  return element?.close();
};

AppUtils.setValue = function (element: HTMLInputElement, value: string) {
  if (element) element.value = value;
};

AppUtils.setValueIfNotFocused = function (element: HTMLInputElement, value: string) {
  if (element && document.activeElement !== element) element.value = value;
};

AppUtils.getValue = function (element: HTMLInputElement) {
  return element.value;
};

AppUtils.getWidth = function (element: HTMLElement) {
  return element?.offsetWidth ?? 0;
};

AppUtils.isOpen = function (element: MDDialog) {
  return element.open;
};

AppUtils.getActiveTabControls = function (tabs: { activeTab: HTMLElement }) {
  const activeTab = tabs.activeTab;
  return activeTab.getAttribute("aria-controls");
};

AppUtils.setSelected = function (element: HTMLOptionElement, selected: boolean) {
  if (element) element.selected = selected;
};

AppUtils.getSelected = function (element: HTMLOptionElement) {
  return element?.selected;
};

AppUtils.selectAllText = function (element: HTMLInputElement) {
  try {
    element?.setSelectionRange(0, element?.value.length);
  } catch {
    // quick n dirty, not all inputs support selecting: e.g. date
  }
};

AppUtils.toggleOpen = function (element: MDDialog) {
  if (!element) return;
  element.open = !element.open;
};

/**
 * @param {HTMLElement} element
 */
AppUtils.scrollToTop = function (element: HTMLElement) {
  element?.scrollTo({
    top: 0,
    behavior: "instant",
  });
};

AppUtils.callOn = function (element: HTMLElement, funcName: keyof HTMLElement) {
  (element?.[funcName] as any)?.();
};

/**
 * Creates a new event for the slider changed event.
 * This new event just emits a number directly, as the value is incompatible with blazor ChangeEventArgs
 * @param {HTMLElement} element
 */
AppUtils.onSliderChange = function (element: HTMLElement) {
  element?.addEventListener("input", () => {
    const event = new Event("slider-change", {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    element?.dispatchEvent(event);
  });
};

/**
 *
 * @param {string} id
 */
AppUtils.scrollIntoViewById = function (id: string) {
  const element = document.getElementById(id);
  const scrollingElement = document.getElementById("scrollingElement");
  // scroll to center
  if (element && scrollingElement)
    scrollingElement.scroll({ top: element.offsetTop - scrollingElement.clientHeight / 2, behavior: "smooth" });
};

AppUtils.smoothScrollAndFocusLast = function (elementSelector: string) {
  const items = document.querySelectorAll(elementSelector) as NodeListOf<HTMLElement>;
  const lastItem = items[items.length - 1];
  lastItem?.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });

  // Hack for chrome
  setTimeout(() => {
    lastItem?.focus({ preventScroll: true });
  }, 500);
};

AppUtils.closeActiveDialog = function () {
  const dialog = document.querySelector("md-dialog[open]");
  (dialog as any)?.close();
  const fullscreenDialog = document.querySelector(".fullscreen-dialog[data-open]:not([data-closing])");
  fullscreenDialog?.dispatchEvent(
    new Event("close", {
      bubbles: true,
      cancelable: true,
    })
  );
  return !!dialog || !!fullscreenDialog;
};

declare var PullToRefresh: any;

AppUtils.setupPullToRefresh = function (elementSelector: string) {
  const pullToRefresh = PullToRefresh.init({
    mainElement: elementSelector,
    triggerElement: "#scrollingElement",
    shouldPullToRefresh() {
      return AppUtils.getScrollTop(document.querySelector("#scrollingElement")) <= 1;
    },
    getStyles() {
      return `.__PREFIX__ptr {
    pointer-events: none;
    top: 0;
    height: 0;
    transition: height 0.3s, min-height 0.3s;
    text-align: center;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    align-content: stretch;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }

  .__PREFIX__box {
    padding: 10px;
    flex-basis: 100%;
  }

  .__PREFIX__pull {
    transition: none;
  }

  .__PREFIX__text {
    margin-top: .33em;
    color: var(--md-sys-color-tertiary);
  }

  .__PREFIX__icon {
    color: var(--md-sys-color-tertiary);
    transition: transform .3s;
  }

  /*
  When at the top of the page, disable vertical overscroll so passive touch
  listeners can take over.
  */
  .__PREFIX__top {
    touch-action: pan-x pan-down pinch-zoom;
  }

  .__PREFIX__release .__PREFIX__icon {
    transform: rotate(180deg);
  }`;
    },
    async onRefresh() {
      document.querySelector(elementSelector)?.dispatchEvent(
        new Event("pull-to-refresh", {
          bubbles: true,
          cancelable: true,
        })
      );
    },
  });
};

AppUtils.destroyPullToRefresh = function () {
  PullToRefresh.destroyAll();
};

AppUtils.getOs = function () {
  // Look at user agent to determine OS
  //@ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) {
    return "Android";
  }
  // @ts-ignore
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }
  return "unknown";
};
