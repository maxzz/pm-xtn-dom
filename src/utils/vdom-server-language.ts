// from: E:/Y/W/2-web/0-dp/dp-pm-grabbing-2019-webcomp/src/utils/dom-language.ts

//TODO: upgrade parse5 from v5 to v7 // 07.13.23

import * as parse5 from 'parse5';

export type ASTNode = parse5.DefaultTreeNode;
export type ASTElement = parse5.DefaultTreeElement;
export type ASTAttribute = parse5.Attribute;
export type ASTParentNode = parse5.DefaultTreeParentNode;
export type ASTTextNode = parse5.DefaultTreeTextNode;
export type ASTDocument = parse5.DefaultTreeDocument;
export type ASTDocumentFragment = parse5.DefaultTreeDocumentFragment;

export function isHTMLElement(el: ASTNode): el is ASTElement {
    return (el as ASTElement).tagName !== undefined;
}

export function isParentNode(el: any): el is ASTParentNode {
    return (el as ASTParentNode).childNodes !== undefined;
}

export function isTextNode(el: ASTNode): el is ASTTextNode {
    return (el as ASTElement).tagName === undefined && el.nodeName === '#text';
}

export function isDocument(el: ASTNode): el is ASTDocument {
    return (el as ASTElement).tagName === undefined && el.nodeName === '#document';
}

export function isDocumentFragment(el: ASTNode): el is ASTDocumentFragment {
    return (el as ASTElement).tagName === undefined && el.nodeName === '#document-fragment';
}

export function nonEmptyValue(el: ASTTextNode): boolean {
    return el.value.trim().length !== 0;
}

export interface IHatElement {  // HTML Abstruct tree
    tagName: string;
    childNodes?: IHatElement[];
    attr?: {
        [n: string]: string;
    };
    text?: string;
}

export type IHatNode = IHatElement | string;
export type IHatNodes = IHatNode | IHatNode[];

class DomUtils {

    static reduce(node: ASTNode, out: IHatNode[]): void {
        if (!node) {
            return;
        }
        if (isHTMLElement(node)) {
            let a: IHatElement = { tagName: node.tagName };

            node.attrs.forEach((attr: ASTAttribute) => {
                a.attr = a.attr || {};
                a.attr[attr.name] = attr.value;
            });

            a.childNodes = [];

            node.childNodes.forEach((child) => {
                this.reduce(child, a.childNodes);
            });

            if (a.childNodes.length === 0) {
                a.childNodes = undefined;
            }

            out.push(a);
        } else if (isTextNode(node)) {
            let s = node.value.trim();
            if (s.length) {
                out.push(s);
            }
        }
    } //reduce()

    static nodeByAttr(astRoot: IHatNode, attr: string, value: string): IHatNode | undefined {

        function walker(ast: IHatElement): IHatNode | undefined {
            if (ast.attr && ast.attr[attr] === value) {
                return ast;
            }
            if (ast.childNodes) {
                for (let i = 0; i < ast.childNodes.length; i++) {
                    let res = walker(ast.childNodes[i]);
                    if (res) {
                        return res;
                    }
                }
            }
        } //walker()

        return walker(astRoot as IHatElement);
    } //nodeByAttr()

    static nodeByTag(astRoot: ASTDocument | ASTElement | ASTNode | IHatNode, tagName: string): ASTElement | ASTNode | IHatNode | undefined {

        function walker(ast: ASTElement): ASTElement | undefined {
            if (ast.tagName === tagName) {
                return ast;
            }
            if (ast.childNodes) {
                for (let i = 0; i < ast.childNodes.length; i++) {
                    let res = walker(ast.childNodes[i] as ASTElement);
                    if (res) {
                        return res;
                    }
                }
            }
        } //walker()

        return walker(astRoot as ASTElement);
    } //nodeByTag()

    static produce(node: IHatNode, out: any): void {
        if (typeof node === 'string') {
            out.push(node);
            return;
        }

        let a: any[] = [];
        a.push(node.tagName);

        if (node.attr) {
            let at: any = {}; 
            let isSVG: boolean = node.tagName.toLowerCase() === 'svg';
            Object.keys(node.attr).forEach((key) => {
                if (!isSVG || key !== 'xmlns') {
                    at[key] = node.attr[key];
                }
            });
            a.push(at);
        }

        out.push(a);

        if (node.childNodes && node.childNodes.length) {
            if (node.childNodes.length === 1 && typeof node.childNodes[0] === 'string') {
                a.push(node.childNodes[0]);
            } else {
                let cArr: any[] = [];
                node.childNodes.forEach((child, index) => {
                    if (index === 0 && typeof node.childNodes[0] === 'string') {
                        cArr.push(['', node.childNodes[0]]); // special case to make text node instead of element
                    } else {
                        this.produce(child, cArr);
                    }
                });
                if (cArr.length === 1 && Array.isArray(cArr[0])) { // to avoid [[]]
                    cArr = cArr[0];
                }
                a.push(cArr);
            }
        }
    } //produce()

} //class DomUtils

export function findHtmlTag(astRoot: ASTDocument | ASTDocumentFragment | ASTElement | ASTNode | IHatNode, tagName: string): ASTElement | ASTNode | IHatNode | undefined {
    // 0. Seacrh on HTML AST tree, not ours tree.
    if (!astRoot) {
        return;
    }
    return DomUtils.nodeByTag(astRoot, tagName);
} //findHtmlTag()

export function findAttr(ast: IHatNodes, attr: string, value: string): IHatNode | undefined {
    if (!ast) {
        return;
    }
    if (Array.isArray(ast)) {
        for (let i = 0; i < ast.length; ++i) {
            let res = DomUtils.nodeByAttr(ast[i], attr, value);
            if (res) {
                return res;
            }
        }
    } else {
        return DomUtils.nodeByAttr(ast, attr, value);
    }
} //findAttr()

export function getChildren(node: IHatNode | undefined): IHatNodes | undefined {
    if (node && (node as IHatElement).childNodes) {
        return (node as IHatElement).childNodes;
    }
} //getChildren()

export function transpileAstToHat(elem: ASTNode | ASTDocumentFragment): IHatNodes | undefined {
    if (!elem) {
        return;
    }
    if (isDocumentFragment(elem) || isDocument(elem)) {
        let out: IHatNode[] = [];
        elem.childNodes.forEach((el) => {
            let outSingle: any[] = [];
            DomUtils.reduce(el, outSingle);
            if (outSingle.length) {
                out.push(outSingle[0]);
            }
        });
        return out;
    } else {
        let out: IHatNode[] = [];
        DomUtils.reduce(elem, out);
        return out[0];
    }
} //transpileAstToHat()

export function makeDomArray(ast: IHatNodes): any[] {
    if (!ast) {
        return [];
    }
    let out: any[] = [];
    if (Array.isArray(ast)) {
        ast.forEach((el, index) => {
            if (typeof el === 'string') {
                out.push(['', el]); // special case to make text node instead of element
            } else {
                let outSingle: any[] = [];
                DomUtils.produce(el, outSingle);
                if (outSingle.length) {
                    if (outSingle.length === 1) {
                        outSingle = outSingle[0]; // to avoid [[]]
                    }
                    out.push(outSingle);
                }
            }
        });
        /*
        if (out.length === 1) {
            out = out[0]; // to avoid [[]]
        }
        */
    } else {
        DomUtils.produce(ast, out);
    }
    return out;
} //makeDomArray()

export function stringifyDomArray(res: any): string {
    // JSON will create sorrounding [] if source is array.
    if (!res) {
        return '';
    }
    let s = JSON.stringify(res);
    if (s.length > 1 && Array.isArray(res) && res.length === 1) {
        s = s.substr(1, s.length - 2); // i.e. transform [[...]] to [...]
    }
    return s;
} //stringifyDomArray()

export function makeDomi(html: string, htmlIdOrTag?: string): string {
    // 0. Optional paramter specifies htmlId of element to get children of.
    const doc: ASTDocument = parse5.parse(html) as ASTDocument;

    let hat: IHatNodes = transpileAstToHat(doc);
    if (htmlIdOrTag) {
        if (htmlIdOrTag.charAt(0) === '#') {
            hat = findAttr(hat, 'id', htmlIdOrTag.slice(1));
            hat = getChildren(hat);
        } else if (htmlIdOrTag === 'body') {
            // special case to get any first children from the document body.
            let body = findHtmlTag((hat as IHatNode[])[0], htmlIdOrTag) as IHatElement;
            if (!body) {
                throw new Error('tm: makeDomi: Parsed AST (HTML Abstruct Tree (HAT)) does not have BODY tag');
            }
            if (!body.childNodes || !body.childNodes.length) {
                throw new Error('tm: makeDomi: Parsed AST (HTML Abstruct Tree (HAT)) BODY does not have children');
            }
            hat = body.childNodes[0];
        } else {
            hat = findHtmlTag((hat as IHatNode[])[0], htmlIdOrTag) as IHatNode; // return tag itself (for example svg document)
        }
    }
    if (!hat) {
        throw new Error('tm: makeDomi: Parsed AST (HTML Abstruct Tree (HAT)) is empty');
    }

    let domJson: any[] = makeDomArray(hat);
    return stringifyDomArray(domJson);
} //makeDomi()
