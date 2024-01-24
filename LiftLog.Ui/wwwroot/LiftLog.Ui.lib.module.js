function sliderChangeArgsCreator(event) {
    return {
        value: event.value
    };
}

export function afterStarted(blazor) {
    blazor.registerCustomEventType('slider-change', {
        createEventArgs: sliderChangeArgsCreator
    });
}
