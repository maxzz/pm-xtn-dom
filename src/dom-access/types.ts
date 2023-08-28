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

// guards

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
