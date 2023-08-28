import { css } from "./dom-css";
import { cssArr, dir, height, private_getOffset, private_setOffset, width } from "./dom-utils";
import { IPointNum } from "./types";

export class jElement {
    elem: HTMLElement = null;

    constructor(selector: string | HTMLElement | HTMLDocument, root?: Node) {
        root = root || document;
        if (typeof selector === 'string') {
            this.elem = (root as HTMLElement).querySelector(selector);
        }
        else {
            this.elem = selector as HTMLElement;
        }
    }

    appendChild(el: Node | HTMLElement | string): void {
        if (typeof el === 'string') {
            el = document.createTextNode(el);
        }
        this.elem.appendChild(el);
    }

    //#region REGION: position, size

    offset(value?: IPointNum): IPointNum | undefined {
        if (value) { // set
            private_setOffset(this.elem, value);
        } else { // get
            return private_getOffset(this.elem);
        }
    }

    width(): number {
        return width(this.elem, false, false, false);
    }

    height(): number {
        return height(this.elem, false, false, false);
    }

    outerWidth(): number {
        return width(this.elem, false, true, true);
    }

    outerHeight(): number {
        return height(this.elem, false, true, true);
    }

    //#endregion REGION: position, size

    css(cssPropName: string): string;               // get single value as string.
    css(cssPropName: string[]): Object;             // get multiple values.
    css(cssPropName: Object): void;                 // set collection of strings from object keys: values.
    css(cssPropName: string, value: string): void;  // set a single value as string.
    css(cssPropName: any/*string | string[] | Object*/, value?: string): any/*: string | Object | void*/ {
        return css(this.elem, cssPropName, value);
    }

    cssArr(cssPropNames: string[]): string[] {
        return cssArr(this.elem, cssPropNames);
    }

    parents(): HTMLElement[] {
        // For login.iis.net it is:
        //     0: div  <- parent of FBI i.e. this_.m_fbiholder
        //     1: form.form-horizontal
        //     2: div#loginform
        //     3: div.content
        //     4: div.allcontent
        //     5: body
        //     6: html
        return dir(this.elem, 'parentNode');
    }
}

export var jElem = (selector: string | HTMLElement | HTMLDocument, root?: Node) => new jElement(selector, root);
