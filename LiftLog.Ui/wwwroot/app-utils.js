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


AppUtils.scrollElementToMiddle = function (elementSelector) {
    document.querySelector(elementSelector).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });
}
