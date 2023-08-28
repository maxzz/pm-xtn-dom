export namespace trimL { // trim label
    // 0. Clean up display name: remove verb 'Enter ' (like: 'Enter user name'), or any 'p&assword' ..., as we did in Pro (this more for Win32 only. Web not using &).
    const reStep1: RegExp = /[\t\r\n\u00A0]+/g; // Tab; Carriage Return; Line Feed; &nbsp; \e-esc; \a-bell; \f-form feed; \v-vert tab
    const reStep2: RegExp = /^\s+|\s+$/g; // Compiled: trim Start and End
    const reStep3: RegExp = /(?:[\:\?\*\s]){1,7}$/g; // 'name? :*        ' <- 2 steps if there are no space at the end and start; 7 times: 4 char + 3 spaces in worth case. https://e-oscar-web.net/EntryController?trigger=Login is using 'User name:*  '
    const reStep4 = /^(?:Enter )/; // 'Enter ' at start (we probably need to capitalize the 1st char, but I doubt that it is used often these days).

    export function run(s: string | undefined): string | undefined {
        // 0. Step1. Remove non-printable text characters. Make whitespace out of jusnk chars.
        // 0. Step2. Remove begining and ending whitespace.
        // 0. Step3. Remove extra butification characters: woot.com; amazon.com
        return s && s.replace(reStep1, ' ').replace(reStep2, '').replace(reStep3, '').replace(reStep4, '');
    }
}
