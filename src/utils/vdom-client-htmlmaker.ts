export type IDomiArray = any;
export type IDomiString = string;

export function domi(jsonTemplate_: IDomiArray, doc_?: HTMLDocument, nodes_?: Object): HTMLElement {
    // 0. domi - Document Object Markup Language. Note that 'elemNameOrArray' is: either the full element name (eg. div) or an array of elements in JSON notation.
    doc_ = doc_ || document;

    type IJDElem = string | any[];

    interface IJDAttr {
        element: {};
    }

    function wrap(el: HTMLElement | string): HTMLElement | Text {
        return typeof el === 'string' ? doc_.createTextNode(el) : el;
    }

    const nsSVG: string = 'http://www.w3.org/2000/svg';
    let nsCurrent: string | null = null;

    function tag(elemNameOrArray_: IJDElem, elemAttr_: IJDAttr | string): DocumentFragment | HTMLElement | string {

        if (Array.isArray(elemNameOrArray_)) { // Array.isArray(null) <- false
            // 1. Array of elements?  Parse each one...
            let frag = doc_.createDocumentFragment();
            Array.prototype.forEach.call(arguments, (thisElem: any) => {
                //console.log(`ArrA: `, thisElem);
                //frag.appendChild(tag.apply(null, thisElem));
                //frag.appendChild(Array.isArray(thisElem) ? tag.apply(null, thisElem) : doc_.createTextNode(thisElem));
                frag.appendChild(typeof thisElem === 'string' ? doc_.createTextNode(thisElem) : wrap((tag.apply as any)(null, thisElem)));
            });
            return frag;
        } else {
            // 2. Single element? Create element.
            //console.log(`STR : `, elemNameOrArray_, ` ATTR `, elemAttr_);

            if (elemNameOrArray_ === '') {
                return elemAttr_ as string; // The next string in that case should be text for Node element.
            }

            let isSVG = elemNameOrArray_ === 'svg';
            if (isSVG) {
                nsCurrent = nsSVG;
            }

            let elem = nsCurrent ? doc_.createElementNS(nsCurrent, elemNameOrArray_) : doc_.createElement(elemNameOrArray_), shift: number = 1;

            // 2.1. Set element's attributes and/or callback functions (like onclick)
            if (!!elemAttr_ && typeof elemAttr_ === 'object' && !Array.isArray(elemAttr_)) {
                shift++;
                Object.keys(elemAttr_).forEach((key: string) => {
                    let val = (elemAttr_ as any)[key];

                    if (nodes_ && key === 'key') {
                        // Save ref to this elem into nodes_ with name defined by key.
                        (nodes_ as any)[val] = elem;
                    } else if (typeof val === 'function') {
                        // Special case for function attributes; don't just add them as 'on...' attributes, but as events, using addEventListener
                        elem.addEventListener(key.replace(/^on/, ''), val, false);
                    } else {
                        elem.setAttribute(key, val);
                    }
                });
            }

            // 2.2. Create and append this element's children.
            let restElems = Array.prototype.slice.call(arguments, shift); // make a copy wo/ fisrst 1 ('div') or 2 args ('div', { attributes }).
            restElems.forEach((el_: any) => {
                //console.log(`ArrB: `, el_);
                if (el_ != null) {
                    elem.appendChild(
                        el_ instanceof (doc_ as any).defaultView.Node ? el_ :
                            Array.isArray(el_) ? wrap((tag.apply as any)(null, el_)) :
                                doc_.createTextNode(el_));
                }
            });

            if (isSVG) {
                nsCurrent = null;
            }

            return elem as HTMLElement;
        }
    } //tag()

    return tag.apply(null, jsonTemplate_) as HTMLElement; // call tag with this=null and spread jsonTemplate_ (which is array) into args.
}
