/*
    // https://github.com/websanova/js-url <- has no npm deployment; 2.5.3; was released on Apr 5, 2018
    url();            // http://rob:abcd1234@www.example.co.uk/path/index.html?query1=test&silly=willy&field[0]=zero&field[2]=two#test=hash&chucky=cheese
    url('tld');       // co.uk
    url('domain');    // example.co.uk
    url('hostname');  // www.example.co.uk
    url('sub');       // www
    url('.0')         // undefined
    url('.1')         // www
    url('.2')         // example
    url('.-1')        // uk
    url('auth')       // rob:abcd1234
    url('user')       // rob
    url('pass')       // abcd1234
    url('port');      // 80
    url('protocol');  // http
    url('path');      // /path/index.html
    url('file');      // index.html
    url('filename');  // index
    url('fileext');   // html
    url('1');         // path
    url('2');         // index.html
    url('3');         // undefined
    url('-1');        // index.html
    url(1);           // path
    url(2);           // index.html
    url(-1);          // index.html
    url('query');     // query1=test&silly=willy
    url('?');         // {query1: 'test', silly: 'willy', field: ['zero', undefined, 'two']}
    url('?silly');    // willy
    url('?poo');      // undefined
    url('field[0]')   // zero
    url('field')      // ['zero', undefined, 'two']
    url('hash');      // test=hash&chucky=cheese
    url('#');         // {test: 'hash', chucky: 'cheese'}
    url('#chucky');   // cheese
    url('#poo');      // undefined
*/
/*
    Uniform Resource Identifier (Uri) http://tools.ietf.org/html/rfc3986.
    This class is a simple parser which creates the basic component parts
    (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
    and encoding.
    https://github.com/Microsoft/monaco-editor/blob/3acd0a1/monaco.d.ts#L83

        foo://example.com:8042/over/there?name=ferret#nose
        \_/   \______________/\_________/ \_________/ \__/
        |           |            |            |        |
        scheme     authority       path        query   fragment
        |   _____________________|__
        / \ /                        \
        urn:example:animal:ferret:nose
*/

export interface IUrlParts {
    protocol?: string;
    email?: string;
    hash?: string;
    query?: string;
    path?: string;
    //file?: string;
    //filename?: string;
    //fileext?: string;
    port?: string;
    auth?: string;
    user?: string;
    pass?: string;
    hostname?: string;
    tld?: string;
    domain?: string;
    sub?: string;
    domainhost?: string; // combination of domain or host name if domain is missing
    //queries
    //"tld?"?: string;
    //"?"?: string;
    //"#"?: string;
    //"."?: string;
    //"{}"?: string;
}

export type IUrlKeys = keyof IUrlParts;
