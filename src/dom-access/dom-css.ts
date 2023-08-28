//not used: public static rnotwhite: RegExp = (/\S+/g);
//not used: public static rclass: RegExp = /[\t\r\n\f]/g;

export function css(el: HTMLElement, cssPropName: string): string;       // get single value as string.
export function css(el: HTMLElement, cssPropName: string[]): Object;     // get multiple values.
export function css(el: HTMLElement, cssPropName: Object): void;         // set collection of strings from object keys: values.
export function css(el: HTMLElement, cssPropName: string, value: string): void; // set a single value as string.

export function css(el: HTMLElement, cssPropName: string | string[] | Object, value?: string): any/*: string | Object | void*/ {
    // set: cssPropName name as string; value string
    // set: cssPropName name as {}; value undefined
    // get: cssPropName name as string; value undefined; returns string
    // get: cssPropName names as []; value undefined; returns {}
    if (value === undefined) {
        // GET or SET (arguments.length === 2)
        let cssPropIsString: boolean = typeof cssPropName === 'string';
        if (cssPropIsString || Array.isArray(cssPropName)) {
            let cs = document.defaultView?.getComputedStyle(el) as CSSStyleDeclaration;
            if (!cs) {
                return 0;
            }
            if (cssPropIsString) {
                // GET: cssPropName is a string return a string
                return cs.getPropertyValue(cssPropName as string);
            } else {
                // GET: cssPropName is a string[] of prop names return object with keys matching prop names.
                let rv: any = {};
                (cssPropName as string[]).forEach((prop: string) => rv[prop] = cs.getPropertyValue(prop));
                return rv;
            }
        } else {
            // SET: cssPropName is an object, i.e. set inline styles: el, keys {}
            Object.keys(cssPropName).forEach((prop: string) => (el.style as any)[prop] = (cssPropName as any)[prop]);
        }
    } else {
        // SET inline style: el, key, val (arguments.length === 3)
        (el.style as any)[cssPropName as string] = value;
    }
}
