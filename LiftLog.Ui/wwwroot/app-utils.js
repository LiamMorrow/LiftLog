var AppUtils = {};
AppUtils.getScrollTop = function (element) {
    return element.scrollTop
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

AppUtils.setSelected = function (element, selected) {
    element.selected = selected;
}

AppUtils.getSelected = function (element) {
    return element.selected;
}

AppUtils.selectAllText = function (element) {
    element?.setSelectionRange(0, element?.value.length)
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
        });
        event.value = element.value;
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
