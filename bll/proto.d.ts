export class Defer {
    /**
     * @param {Number} timeout
     */
    constructor(timeout: number, originalPromise: any);
    set isDefered(arg: boolean);
    get isDefered(): boolean;
    _isDefered: any;
    set promise(arg: Promise<any>);
    get promise(): Promise<any>;
    _promise: Promise<any>;
    _resolve: (value: any) => void;
    _reject: (reason?: any) => void;
    then(fun: any): void;
    catch(fun: any): void;
    finally(fun: any): void;
    resolve(val1: any, val2: any, val3: any, val4: any): Promise<any>;
    reject(val1: any, val2: any, val3: any, val4: any): Promise<any>;
}
export function gzip(input: any, options: any): Promise<any>;
export function ungzip(input: any, options: any): Promise<any>;
