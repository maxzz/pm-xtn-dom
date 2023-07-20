export function throttleByRAF(eventName: string, customEventName: string, obj?: any) { // from https://developer.mozilla.org/en-US/docs/Web/Events/resize
    obj = obj || window;
    let running = false;

    function func() {
        if (running) {
            return;
        }

        running = true;
        requestAnimationFrame(function () {
            obj.dispatchEvent(new CustomEvent(customEventName));
            running = false;
        });
    }

    obj.addEventListener(eventName, func);
}
