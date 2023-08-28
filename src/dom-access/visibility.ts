import { MAXZALTPSW, traceAccess } from "../types";
import { guardInput } from "./types";

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
}
