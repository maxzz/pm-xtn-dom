import { IPoint, IPointNum, di, guardDocument, guardWindow, px } from "./types";
import { css } from "./dom-css";
export { css } from "./dom-css";

export function cssArr(el: HTMLElement, cssPropNames: string[]): string[] {
    // 0. Get CSS properties as an array vs. css() that returns object.
    let computed = document.defaultView?.getComputedStyle(el) as CSSStyleDeclaration;
    return computed ? cssPropNames.map((prop: string) => computed.getPropertyValue(prop)) : [];
}

//#region REGION: visibility

export function show(el: HTMLElement) {
    return css(el, 'display', '');
}

export function hide(el: HTMLElement) {
    return css(el, 'display', 'none');
}

//#endregion REGION: visibility

//#region REGION: utils

function nodeName(elem: Element, name: string): boolean {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
}

export function insertAfter(newNode: HTMLElement | Node, referenceNode: HTMLElement | Node): void {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function dir(el: Element | Node, dirName: string): HTMLElement[] {
    let matched: HTMLElement[] = [];
    if (el) {
        while ((el = (el as any)[dirName]) && el.nodeType !== 9) { // 9: DOCUMENT_NODE
            if (el.nodeType === 1) {                      // 1: ELEMENT_NODE
                matched.push(el as HTMLElement);
            }
        }
    }
    return matched;
}

//#endregion REGION: utils

//#region REGION: position, size

export function offset(el: HTMLElement, value?: IPointNum): IPointNum {
    // 0. Set or Get elements offset.
    if (arguments.length > 1) {
        private_setOffset(el, value); // set
    } else {
        return private_getOffset(el); // get
    }
}

export function private_setOffset(el: HTMLElement, value: IPointNum): void {
    // 0. Set element offset.

    // Set position first, in-case top/left are set even on static elem.
    let pos: string = css(el, "position");
    if (pos === 'static') {
        el.style.position = 'relative';
    }

    // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed.
    let curLeft, curTop;
    let curCSS: IPoint = css(el, ['top', 'left']);
    let calculatePosition = (pos === 'absolute' || pos === 'fixed') && (curCSS.top + curCSS.left).indexOf('auto') > -1;
    if (calculatePosition) {
        let curPosition: IPointNum = position(el);
        curTop = curPosition.top;
        curLeft = curPosition.left;
    } else {
        curTop = parseFloat(curCSS.top) || 0;
        curLeft = parseFloat(curCSS.left) || 0;
    }

    let newOffs: IPoint = {},
        curOffs: IPointNum = offset(el);

    if (value.top != null) {
        newOffs.top = px((value.top - curOffs.top) + curTop);
    }
    if (value.left != null) {
        newOffs.left = px((value.left - curOffs.left) + curLeft);
    }

    css(el, newOffs);
}

export function private_getOffset(el: HTMLElement): IPointNum | undefined {
    let doc: Document = el && el.ownerDocument;
    if (!doc) {
        return;
    }
    let win: Window = doc.defaultView,
        docElem: HTMLElement = doc.documentElement,
        box: ClientRect = el.getBoundingClientRect();
    return {
        top: box.top + win.pageYOffset - docElem.clientTop,
        left: box.left + win.pageXOffset - docElem.clientLeft
    };
}

function offsetParent(el: HTMLElement): HTMLElement {
    // 0. Get offset parent.
    let ofsParent: HTMLElement = el.offsetParent as HTMLElement || el.ownerDocument.documentElement;

    while (ofsParent && (!nodeName(ofsParent, "html") && css(ofsParent, "position") === "static")) {
        ofsParent = ofsParent.offsetParent as HTMLElement;
    }

    return ofsParent || el.ownerDocument.documentElement;
}

export function position(el: HTMLElement): IPointNum {
    // 0. Get element position.
    let offs: IPointNum,
        parentOffs: IPointNum = { top: 0, left: 0 };

    // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
    if (css(el, 'position') === 'fixed') {
        offs = el.getBoundingClientRect(); // Assume getBoundingClientRect is there when computed position is fixed.
    } else {
        let realOffsetParent: HTMLElement = offsetParent(el); // Get *real* offsetParent

        // Get correct offsets
        offs = offset(el);
        if (!nodeName(realOffsetParent, 'html')) {
            parentOffs = offset(realOffsetParent);
        }

        // Add offsetParent borders
        parentOffs.top += di(css(realOffsetParent, 'border-top-width'));
        parentOffs.left += di(css(realOffsetParent, 'border-left-width'));
    }

    // Subtract parent offsets and element margins
    return {
        top: offs.top - parentOffs.top - di(css(el, 'margin-top')),
        left: offs.left - parentOffs.left - di(css(el, 'margin-left'))
    };
}

function wORh(el: HTMLElement | any, name: 'Width' | 'Height'): number | undefined {
    // 0. Get for Window or Document width or hieght or return undefined for other elements.
    if (guardWindow(el)) {
        // As of 05.08.12 this will yield incorrect results for Mobile Safari, but there
        // isn't a whole lot we can do. See pull request at this URL for discussion:
        // https://github.com/jquery/jquery/pull/764
        return (el.document.documentElement as any)["client" + name];
    }
    // Get document width or height.
    if (guardDocument(el)) {
        let doc: HTMLElement = el.documentElement;
        // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest.
        return Math.max(
            (el as any).body["scroll" + name], (doc as any)["scroll" + name],
            (el as any).body["offset" + name], (doc as any)["offset" + name], (doc as any)["client" + name]
        );
    }
}

export function width(el: HTMLElement, margin: boolean, border: boolean, padding: boolean): number {
    let outer: number | undefined = wORh(el, 'Width');
    if (outer !== undefined) {
        return outer;
    }

    const computed: CSSStyleDeclaration = document.defaultView.getComputedStyle(el);
    const g = (cssPropName: string): number => di(computed.getPropertyValue(cssPropName)); // simple scoped getter

    let rv: number = el.clientWidth; // el.clientWidth + marginL+marginR + borderL+borderR - (paddingL+paddingR);

    if (margin) {
        rv += g('margin-left');
        rv += g('margin-right');
    }

    if (border) {
        rv += g('border-left');
        rv += g('border-right');
    }

    if (!padding) { // clientWidth is already client + padding.
        rv -= g('padding-left');
        rv -= g('padding-right');
    }

    return rv;
}

export function height(el: HTMLElement, margin: boolean, border: boolean, padding: boolean): number {
    let outer: number | undefined = wORh(el, 'Height');
    if (outer !== undefined) {
        return outer;
    }

    const computed: CSSStyleDeclaration = document.defaultView.getComputedStyle(el);
    const g = (cssPropName: string): number => di(computed.getPropertyValue(cssPropName)); // simple scoped getter

    let rv: number = el.clientHeight; // el.clientHeight + marginT+marginB + borderT+borderB - (paddingT+paddingB);

    if (margin) {
        rv += g('margin-top');
        rv += g('margin-bottom');
    }

    if (border) {
        rv += g('border-top');
        rv += g('border-bottom');
    }

    if (!padding) { // clientHeight is already client + padding.
        rv -= g('padding-top');
        rv -= g('padding-bottom');
    }

    return rv;
}

export function isContentBox(el: HTMLElement): boolean {
    // 0. box-sizing can be content-box or border-box. content-box is default, but border-box is easy to manage.
    // content-box: For example, .box {width: 350px; border: 10px solid black;} renders a box that is 370px wide.
    // border-box : For example, .box {width: 350px; border: 10px solid black;} renders a box that is 350px wide.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
    let boxSizing: string = css(el, 'box-sizing');
    return !boxSizing.length || boxSizing === 'content-box';
}

//#endregion REGION: position, size
