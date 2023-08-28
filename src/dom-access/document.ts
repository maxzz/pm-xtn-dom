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
