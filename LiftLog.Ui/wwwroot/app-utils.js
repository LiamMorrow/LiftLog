var AppUtils = {};
AppUtils.getScrollTop = function (element) {
    return element?.scrollTop
};
/**
 *
 * @param {HTMLElement} element
 */
AppUtils.getMiddleElementAttribute = function (element, attribute) {
    const absolutePositionOfElement = element.getBoundingClientRect();
    const middle = absolutePositionOfElement.top + (absolutePositionOfElement.height / 2);
    const middleX = absolutePositionOfElement.left + (absolutePositionOfElement.width / 2);
    const elementAtMiddle = document.elementFromPoint(middleX, middle);
    return elementAtMiddle?.getAttribute(attribute);
}/**
 *
 * @param {HTMLElement} element
 */
AppUtils.setMiddleElementAttribute = function (element, attribute, value) {
    const absolutePositionOfElement = element.getBoundingClientRect();
    const middle = absolutePositionOfElement.top + (absolutePositionOfElement.height / 2);
    const middleX = absolutePositionOfElement.left + (absolutePositionOfElement.width / 2);
    const elementAtMiddle = document.elementFromPoint(middleX, middle);
    elementAtMiddle?.setAttribute(attribute, value);
}

AppUtils.showMdPopup = function (element) {
    return element?.show();
};

/**
 * Creates a new event for the dialog close event.
 * This new event has bubbles, which allows blazor components to intercept it
 * @param {HTMLElement} element
 */
AppUtils.onCloseMdPopup = function (element) {
    element?.addEventListener('close', () => {
        element?.dispatchEvent(new Event('dialog-close', {
            bubbles: true,
            cancelable: true,
        }))
    });
};


AppUtils.hideMdPopup = function (element) {
    return element?.close();
};

AppUtils.setValue = function (element, value) {
    element.value = value;
}

AppUtils.getValue = function (element) {
    return element.value;
}


AppUtils.getActiveTabControls = function (tabs) {
    /** @type {HTMLElement }*/
    const activeTab = tabs.activeTab;
    return activeTab.getAttribute('aria-controls');
}

AppUtils.setSelected = function (element, selected) {
    element.selected = selected;
}

AppUtils.getSelected = function (element) {
    return element.selected;
}

AppUtils.selectAllText = function (element) {
    try {
        element?.setSelectionRange(0, element?.value.length)
    } catch {
        // quick n dirty, not all inputs support selecting: e.g. date
    }
}

/**
* @param {HTMLElement} element
*/
AppUtils.scrollToTop = function (element) {
    element?.scrollTo({
        top: 0,
        behavior: 'instant'
    });
}

AppUtils.callOn = function (element, funcName) {
    element[funcName]();
}

/**
 * Creates a new event for the list item clicked event.
 * This new event has bubbles, which allows blazor components to intercept it
 * @param {HTMLElement} element
 */
AppUtils.onClickedListItem = function (element) {
    element?.addEventListener('click', () => {
        element?.dispatchEvent(new Event('list-item-click', {
            bubbles: true,
            cancelable: true,
        }))
    });
}
/**
 * Creates a new event for the slider changed event.
 * This new event just emits a number directly, as the value is incompatible with blazor ChangeEventArgs
 * @param {HTMLElement} element
 */
AppUtils.onSliderChange = function (element) {
    element?.addEventListener('input', () => {
        const event = new Event('slider-change', {
            bubbles: true,
            cancelable: true,
            composed: true
        });
        element?.dispatchEvent(event);
    });
}

AppUtils.scrollElementToMiddle = function (elementSelector) {
    document.querySelector(elementSelector).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });
}


AppUtils.setupPullToRefresh = function (elementSelector) {
    const pullToRefresh = PullToRefresh.init({
        mainElement: elementSelector,
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
            document.querySelector(elementSelector)?.dispatchEvent(new Event('pull-to-refresh', {
                bubbles: true,
                cancelable: true,
            }));
        }
    });
}

AppUtils.destroyPullToRefresh = function () {
    PullToRefresh.destroyAll();
}
