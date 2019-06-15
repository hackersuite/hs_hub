import { Request } from "express";

export class MockRequest implements Request {
    get(name: "set-cookie"): string[];
    get(name: string): string;
    get(name: any): any {
        throw new Error("Method not implemented.");
    }
    header(name: "set-cookie"): string[];
    header(name: string): string;
    header(name: any): any {
        throw new Error("Method not implemented.");
    }
    accepts(): string[];
    accepts(type: string): string | false;
    accepts(type: string[]): string | false;
    accepts(...type: string[]): string | false;
    accepts(type?: any, ...rest: any[]): any {
        throw new Error("Method not implemented.");
    }
    acceptsCharsets(): string[];
    acceptsCharsets(charset: string): string | false;
    acceptsCharsets(charset: string[]): string | false;
    acceptsCharsets(...charset: string[]): string | false;
    acceptsCharsets(charset?: any, ...rest: any[]): any {
        throw new Error("Method not implemented.");
    }
    acceptsEncodings(): string[];
    acceptsEncodings(encoding: string): string | false;
    acceptsEncodings(encoding: string[]): string | false;
    acceptsEncodings(...encoding: string[]): string | false;
    acceptsEncodings(encoding?: any, ...rest: any[]): any {
        throw new Error("Method not implemented.");
    }
    acceptsLanguages(): string[];
    acceptsLanguages(lang: string): string | false;
    acceptsLanguages(lang: string[]): string | false;
    acceptsLanguages(...lang: string[]): string | false;
    acceptsLanguages(lang?: any, ...rest: any[]): any {
        throw new Error("Method not implemented.");
    }
    range(size: number, options?: import("range-parser").Options): import("range-parser").Ranges | -1 | -2 {
        throw new Error("Method not implemented.");
    }
    accepted: import("express-serve-static-core").MediaType[];
    param(name: string, defaultValue?: any): string {
        throw new Error("Method not implemented.");
    }
    is(type: string): string | false {
        throw new Error("Method not implemented.");
    }
    protocol: string;
    secure: boolean;
    ip: string;
    ips: string[];
    subdomains: string[];
    path: string;
    hostname: string;
    host: string;
    fresh: boolean;
    stale: boolean;
    xhr: boolean;
    body: any;
    cookies: any;
    method: string;
    params: any;
    clearCookie(name: string, options?: any): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    query: any;
    route: any;
    signedCookies: any;
    originalUrl: string;
    url: string;
    baseUrl: string;
    app: import("express-serve-static-core").Application;
    res?: import("express-serve-static-core").Response;
    next?: import("express-serve-static-core").NextFunction;
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    connection: import("net").Socket;
    headers: import("http").IncomingHttpHeaders;
    rawHeaders: string[];
    trailers: { [key: string]: string; };
    rawTrailers: string[];
    setTimeout(msecs: number, callback: () => void): this {
        throw new Error("Method not implemented.");
    }
    statusCode?: number;
    statusMessage?: string;
    socket: import("net").Socket;
    destroy(error?: Error): void {
        throw new Error("Method not implemented.");
    }
    readable: boolean;
    readableHighWaterMark: number;
    readableLength: number;
    _read(size: number): void {
        throw new Error("Method not implemented.");
    }
    read(size?: number): any {
        throw new Error("Method not implemented.");
    }
    setEncoding(encoding: string): this {
        throw new Error("Method not implemented.");
    }
    pause(): this {
        throw new Error("Method not implemented.");
    }
    resume(): this {
        throw new Error("Method not implemented.");
    }
    isPaused(): boolean {
        throw new Error("Method not implemented.");
    }
    unpipe(destination?: NodeJS.WritableStream): this {
        throw new Error("Method not implemented.");
    }
    unshift(chunk: any): void {
        throw new Error("Method not implemented.");
    }
    wrap(oldStream: NodeJS.ReadableStream): this {
        throw new Error("Method not implemented.");
    }
    push(chunk: any, encoding?: string): boolean {
        throw new Error("Method not implemented.");
    }
    _destroy(error: Error, callback: (error: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    addListener(event: "close", listener: () => void): this;
    addListener(event: "data", listener: (chunk: any) => void): this;
    addListener(event: "end", listener: () => void): this;
    addListener(event: "readable", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    addListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    emit(event: "close"): boolean;
    emit(event: "data", chunk: any): boolean;
    emit(event: "end"): boolean;
    emit(event: "readable"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: any, err?: any, ...rest: any[]): any {
        throw new Error("Method not implemented.");
    }
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: any) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    once(event: "close", listener: () => void): this;
    once(event: "data", listener: (chunk: any) => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "readable", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "data", listener: (chunk: any) => void): this;
    prependListener(event: "end", listener: () => void): this;
    prependListener(event: "readable", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "data", listener: (chunk: any) => void): this;
    prependOnceListener(event: "end", listener: () => void): this;
    prependOnceListener(event: "readable", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "data", listener: (chunk: any) => void): this;
    removeListener(event: "end", listener: () => void): this;
    removeListener(event: "readable", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    [Symbol.asyncIterator](): AsyncIterableIterator<any> {
        throw new Error("Method not implemented.");
    }
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T {
        throw new Error("Method not implemented.");
    }
    off(event: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(event?: string | symbol): this {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    listeners(event: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    rawListeners(event: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    eventNames(): (string | symbol)[] {
        throw new Error("Method not implemented.");
    }
    listenerCount(type: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    authInfo?: any;
    user?: any;
    setUser(user: any) {
        this.user = user;
    }
    login(user: any, done: (err: any) => void): void;
    login(user: any, options: any, done: (err: any) => void): void;
    login(user: any, options: any, done?: any): any {
        throw new Error("Method not implemented.");
    }
    logIn(user: any, done: (err: any) => void): void;
    logIn(user: any, options: any, done: (err: any) => void): void;
    logIn(user: any, options: any, done?: any): any {
        throw new Error("Method not implemented.");
    }
    logout(): void {
        throw new Error("Method not implemented.");
    }
    logOut(): void {
        throw new Error("Method not implemented.");
    }
    isAuthenticated(): boolean {
        throw new Error("Method not implemented.");
    }
    isUnauthenticated(): boolean {
        throw new Error("Method not implemented.");
    }
    session?: Express.Session;
    sessionID?: string;
}