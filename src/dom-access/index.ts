import { traceAccess, MAXZALTPSW } from "../types";

//#region Utils

export interface IPoint {
    top?: string;
    left?: string;
}

export interface IPointNum {
    top: number;
    left: number;
}

export function px(value: number): string {
    // 0. to pixels.
    return value === 0 ? '0' : value + 'px';
}

export function di(value: string): number {
    // 0. to digit.
    return value !== '' ? parseInt(value, 10) : 0; // parseInt on '' gives NaN
}

export class utl {
    //not used: public static rnotwhite: RegExp = (/\S+/g);
    //not used: public static rclass: RegExp = /[\t\r\n\f]/g;

    static css(el: HTMLElement, cssPropName: string): string;       // get single value as string.
    static css(el: HTMLElement, cssPropName: string[]): Object;     // get multiple values.
    static css(el: HTMLElement, cssPropName: Object): void;         // set collection of strings from object keys: values.
    static css(el: HTMLElement, cssPropName: string, value: string): void; // set a single value as string.

    static css(el: HTMLElement, cssPropName: string | string[] | Object, value?: string): any/*: string | Object | void*/ {
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
    } //css()

    static cssArr(el: HTMLElement, cssPropNames: string[]): string[] {
        // 0. Get CSS properties as an array vs. css() that returns object.
        let computed = document.defaultView?.getComputedStyle(el) as CSSStyleDeclaration;
        return computed ? cssPropNames.map((prop: string) => computed.getPropertyValue(prop)) : [];
    }

    //#region REGION: visibility

    static show(el: HTMLElement) {
        return this.css(el, 'display', '');
    }

    static hide(el: HTMLElement) {
        return this.css(el, 'display', 'none');
    }

    //#endregion REGION: visibility

    //#region REGION: utils

    private static nodeName(elem: Element, name: string): boolean {
        return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    }

    static insertAfter(newNode: HTMLElement | Node, referenceNode: HTMLElement | Node): void {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    static dir(el: Element | Node, dirName: string): HTMLElement[] {
        let matched: HTMLElement[] = [];
        if (el) {
            while ((el = (el as any)[dirName]) && el.nodeType !== 9) { // 9: DOCUMENT_NODE
                if (el.nodeType === 1) {                      // 1: ELEMENT_NODE
                    matched.push(el as HTMLElement);
                }
            }
        }
        return matched;
    } //dir()

    //#endregion REGION: utils

    //#region REGION: position, size

    static offset(el: HTMLElement, value?: IPointNum): IPointNum {
        // 0. Set or Get elements offset.
        if (arguments.length > 1) {
            // set
            this.private_setOffset(el, value);
        }
        else {
            // get
            return this.private_getOffset(el);
        }
    } //offset()

    static private_setOffset(el: HTMLElement, value: IPointNum): void {
        // 0. Set element offset.

        // Set position first, in-case top/left are set even on static elem.
        let pos: string = this.css(el, "position");
        if (pos === 'static') {
            el.style.position = 'relative';
        }

        // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed.
        let curLeft, curTop;
        let curCSS: IPoint = this.css(el, ['top', 'left']);
        let calculatePosition = (pos === 'absolute' || pos === 'fixed') && (curCSS.top + curCSS.left).indexOf('auto') > -1;
        if (calculatePosition) {
            let curPosition: IPointNum = this.position(el);
            curTop = curPosition.top;
            curLeft = curPosition.left;
        } else {
            curTop = parseFloat(curCSS.top) || 0;
            curLeft = parseFloat(curCSS.left) || 0;
        }

        let newOffs: IPoint = {},
            curOffs: IPointNum = this.offset(el);

        if (value.top != null) {
            newOffs.top = px((value.top - curOffs.top) + curTop);
        }
        if (value.left != null) {
            newOffs.left = px((value.left - curOffs.left) + curLeft);
        }

        this.css(el, newOffs);
    }

    static private_getOffset(el: HTMLElement): IPointNum | undefined {
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

    private static offsetParent(el: HTMLElement): HTMLElement {
        // 0. Get offset parent.
        let ofsParent: HTMLElement = el.offsetParent as HTMLElement || el.ownerDocument.documentElement;

        while (ofsParent && (!this.nodeName(ofsParent, "html") && this.css(ofsParent, "position") === "static")) {
            ofsParent = ofsParent.offsetParent as HTMLElement;
        }

        return ofsParent || el.ownerDocument.documentElement;
    }

    static position(el: HTMLElement): IPointNum {
        // 0. Get element position.
        let offs: IPointNum,
            parentOffs: IPointNum = { top: 0, left: 0 };

        // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
        if (this.css(el, 'position') === 'fixed') {
            offs = el.getBoundingClientRect(); // Assume getBoundingClientRect is there when computed position is fixed.
        } else {
            let realOffsetParent: HTMLElement = this.offsetParent(el); // Get *real* offsetParent

            // Get correct offsets
            offs = this.offset(el);
            if (!this.nodeName(realOffsetParent, 'html')) {
                parentOffs = this.offset(realOffsetParent);
            }

            // Add offsetParent borders
            parentOffs.top += di(this.css(realOffsetParent, 'border-top-width'));
            parentOffs.left += di(this.css(realOffsetParent, 'border-left-width'));
        }

        // Subtract parent offsets and element margins
        return {
            top: offs.top - parentOffs.top - di(this.css(el, 'margin-top')),
            left: offs.left - parentOffs.left - di(this.css(el, 'margin-left'))
        };
    }

    private static wORh(el: HTMLElement | any, name: 'Width' | 'Height'): number | undefined {
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

    static width(el: HTMLElement, margin: boolean, border: boolean, padding: boolean): number {
        let outer: number | undefined = this.wORh(el, 'Width');
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

    static height(el: HTMLElement, margin: boolean, border: boolean, padding: boolean): number {
        let outer: number | undefined = this.wORh(el, 'Height');
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

    static isContentBox(el: HTMLElement): boolean {
        // 0. box-sizing can be content-box or border-box. content-box is default, but border-box is easy to manage.
        // content-box: For example, .box {width: 350px; border: 10px solid black;} renders a box that is 370px wide.
        // border-box : For example, .box {width: 350px; border: 10px solid black;} renders a box that is 350px wide.
        // https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
        let boxSizing: string = this.css(el, 'box-sizing');
        return !boxSizing.length || boxSizing === 'content-box';
    }

    //#endregion REGION: position, size
}//class utl

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
            utl.private_setOffset(this.elem, value);
        } else { // get
            return utl.private_getOffset(this.elem);
        }
    }

    width(): number {
        return utl.width(this.elem, false, false, false);
    }

    height(): number {
        return utl.height(this.elem, false, false, false);
    }

    outerWidth(): number {
        return utl.width(this.elem, false, true, true);
    }

    outerHeight(): number {
        return utl.height(this.elem, false, true, true);
    }

    //#endregion REGION: position, size

    css(cssPropName: string): string;               // get single value as string.
    css(cssPropName: string[]): Object;             // get multiple values.
    css(cssPropName: Object): void;                 // set collection of strings from object keys: values.
    css(cssPropName: string, value: string): void;  // set a single value as string.
    css(cssPropName: any/*string | string[] | Object*/, value?: string): any/*: string | Object | void*/ {
        return utl.css(this.elem, cssPropName, value);
    }

    cssArr(cssPropNames: string[]): string[] {
        return utl.cssArr(this.elem, cssPropNames);
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
        return utl.dir(this.elem, 'parentNode');
    }

} //class jElement

export var jElem = (selector: string | HTMLElement | HTMLDocument, root?: Node) => new jElement(selector, root);

//#endregion Utils

export function guardWindow(a: any): a is Window {
    return a && a === a.window;
}
export function guardDocument(a: Node): a is Document {
    return a && a.nodeType === 9; //9: DOCUMENT_NODE
}
export function guardElement(a: Node): a is Element {
    return a && a.nodeType === 1; //1: Node.ELEMENT_NODE
}
export function guardInput(a: Element): a is HTMLInputElement {
    return a && a.tagName === 'INPUT';
}
export function guardSelect(a: Element): a is HTMLSelectElement {
    return a && a.tagName === 'SELECT';
}
export function guardSelectOption(a: Element): a is HTMLSelectElement {
    return a && a.tagName === 'OPTION';
}
export function guardStyle(a: Element): a is HTMLStyleElement {
    return a && a.tagName === 'STYLE';
}
export function hasShadowRoot(a: Element): boolean {
    return !!a?.shadowRoot;
}
export function guardCustomElement(a: Node): a is HTMLElement {
    return isCustomElement(a);
}
export function isCustomElement(a: Node): boolean {
    return !!(a as Element)?.tagName && (a as Element).tagName.indexOf('-') !== -1; //console.log(is(null), is(undefined), is(''), is('11'), is('a-c'));
}
export function inputTypeHidden(a: HTMLInputElement): boolean {
    return a && a.type === 'hidden';
}

export interface IVisibilityCache {
    visible: Set<HTMLElement>;
    invisible: Set<HTMLElement>;
}

export class IsVisibleState {
    private maybeElms: HTMLElement[] = []; // so far possibly visible elements until we'll meet invisible parent
    private cache?: IVisibilityCache;

    constructor(cache?: IVisibilityCache) {
        this.cache = cache;
    }

    addToMaybe(possiblyVisible: HTMLElement) {
        this.cache && this.maybeElms.push(possiblyVisible);
    }

    moveMaybesTo(to: Set<HTMLElement> | undefined): void {
        to && this.maybeElms.forEach((el) => to.add(el));
    }

    retResInvisible(el: HTMLElement): boolean {
        this.cache && (this.cache.invisible.add(el), this.moveMaybesTo(this.cache.invisible));
        return false;
    }

    retResVisible(el: HTMLElement): boolean {
        this.cache && (this.cache.visible.add(el), this.moveMaybesTo(this.cache.visible));
        return true;
    }

} //class IsVisibleState

export function isVisible(el: HTMLElement | null, cache?: IVisibilityCache): boolean {
    // 0. isVisible() returns true if element is visible to the top.
    if (!el) {
        return false; // element is detached from DOM.
    }

    let org: HTMLElement = el;
    let vs = new IsVisibleState(cache);

    while (el && el.tagName !== "BODY") {
        /*[visibilityLoop]{}*/traceAccess.visibilityLoop && console.log(`do el: ${el.className}::${el.id}`);

        // 2. first check the cache if we have already checked this element during this tree iteration
        if (cache?.visible.has(el)) {
            /*[visibilityLoop]{}*/traceAccess.visibilityLoop && console.log(`  from cache: ${el.className}::${el.id}`);

            vs.moveMaybesTo(cache?.visible);
            return true; // if already from cache then we are done.
        } else if (cache?.invisible.has(el)) {
            vs.moveMaybesTo(cache?.invisible);
            return false;
        }

        // 2.1. check aria visibility
        if (el.getAttribute('aria-hidden') === 'true') {
            return vs.retResInvisible(el); // yahoo.com sets to parent div hieght 1px and area-role hidden
        }

        // 2.2. check inline regular visibility
        if (el.style && (el.style.visibility == "hidden" || el.style.display == "none")) {
            return vs.retResInvisible(el);
        }

        // 3. check computed styles. //TODO: Do we need to check first that the whole chain up is inside document? Optional (We can bild path and then check the rest).
        try {
            const computedCSS: CSSStyleDeclaration = el.ownerDocument?.defaultView.getComputedStyle(el);
            if (!computedCSS) {
                return vs.retResInvisible(el);
            }

            // 3.1. check our mark for custom password elements (like experimental -webkit custom font)
            const isInput = guardInput(el) && (el.type === 'text' || el.type === 'email'); // it can be type 'number' but it is very rare case
            if (isInput) {
                if (!el.dataset[MAXZALTPSW]) {                                    // i.e. we didn't set it before
                    let isPsw = (computedCSS as any)["webkitTextSecurity"] === 'disc';               // -moz- prefix is ignored by Mozilla, so it is only -webkit-
                    !isPsw && (isPsw = !!(computedCSS.fontFamily || '').match(/dotsfont/)); // Firefox ignores 'text-secury' and only fonts applied.
                    el.dataset[MAXZALTPSW] = `${isPsw ? 1 : 0}`;                  // Set it always to skip futther checks for non-dotsfont cases.
                }
            }

            // 3.2. check computed regular visibility
            if (computedCSS.visibility == "hidden" || computedCSS.display == "none") {
                return vs.retResInvisible(el);
            }

            // 3.3. check moved away from screen
            let left = parseFloat(computedCSS.left) || 0; // login.live.com moves element off screen with .moveOffScreen class
            if (left < -998) {
                return vs.retResInvisible(el);
            }

            // 3.4. check zero dimensions
            if ((!parseFloat(computedCSS.width) || !parseFloat(computedCSS.height)) && computedCSS.overflow === 'hidden') {
                return vs.retResInvisible(el); // parseFloat in case 0px: apps.availity.com/availity/web/public.elegant.login
            }
        } catch (e) {
        }

        const next = el.parentElement || (el.parentNode as ShadowRoot)?.host as HTMLElement; // or break shadow DOM boundaries

        // 2.3. check if element is detached from DOM
        if (!next) {
            return vs.retResInvisible(el);
        }

        vs.addToMaybe(el);
        el = next;
    } //while.toTop

    return vs.retResVisible(org);
} //isVisible()

export function nodeInDocument(node: Node): boolean {
    // Check if node is still attached to the document. node can be initially null.
    if (node === document) {
        return true;
    }
    return node ? nodeInDocument((node.parentNode as ShadowRoot)?.host || node.parentNode) : false; // first check shadow DOM host and then parentNode.
}

export function nodeName(el: Node, tagWithColor: boolean = false): string {
    // The mimic of Google's devtools logic for node names.
    if (!el) {
        return '';
    }
    let c: string = (el as HTMLElement).className && (el as HTMLElement).className.length ? '.' + (el as HTMLElement).className.trim().replace(/\s+/g, '.') : '';
    let i: string = (el as HTMLElement).id && (el as HTMLElement).id.length ? '#' + (el as HTMLElement).id : '';
    let t: string = (el as HTMLElement).tagName;

    if (t) {
        t = t.toLowerCase();
        let ty: string = (el as HTMLInputElement).type;
        if (ty) {
            t = `${t}[type='${ty}']`;
        }
    } else {
        if (el.nodeType === 3) { //text
            t = 'text';
        } else if (el.nodeType === 8) { //comment
            t = 'comment';
        } else {
            t = 'NODETYPE_' + el.nodeType; // or we can use Node.nodeName
        }
    }

    return tagWithColor ? `%c${t}%c${i}${c}` : `${t}${i}${c}`;
}

export function nodeNames(nodes: NodeList, tagWithColor: boolean = false): string {
    // In most cases with mutation observer it is just a single element, tagWithColor will work only with the first element.
    return Array.prototype.map.call(nodes, (node: HTMLElement, index: number) => `'${nodeName(node, index === 0 && tagWithColor ? true : false)}'`).join(', ');
}

export function nodeNamesArray(nodes: NodeList, tagWithColor: boolean = false): string[] {
    // In most cases with mutation observer it is just a single element, tagWithColor will work only with the first element.
    return Array.prototype.map.call(nodes, (node: HTMLElement, index: number) => `${nodeName(node, tagWithColor)}`) as string[];
}
