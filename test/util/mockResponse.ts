import { Response } from "express";

export class MockResponse implements Response {
    status(code: number): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }    sendStatus(code: number): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    links(links: any): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    send: import("express-serve-static-core").Send;
    json: import("express-serve-static-core").Send;
    jsonp: import("express-serve-static-core").Send;
    sendFile(path: string): void;
    sendFile(path: string, options: any): void;
    sendFile(path: string, fn: import("express-serve-static-core").Errback): void;
    sendFile(path: string, options: any, fn: import("express-serve-static-core").Errback): void;
    sendFile(path: any, options?: any, fn?: any) {
        throw new Error("Method not implemented.");
    }
    sendfile(path: string): void;
    sendfile(path: string, options: any): void;
    sendfile(path: string, fn: import("express-serve-static-core").Errback): void;
    sendfile(path: string, options: any, fn: import("express-serve-static-core").Errback): void;
    sendfile(path: any, options?: any, fn?: any) {
        throw new Error("Method not implemented.");
    }
    download(path: string): void;
    download(path: string, filename: string): void;
    download(path: string, fn: import("express-serve-static-core").Errback): void;
    download(path: string, filename: string, fn: import("express-serve-static-core").Errback): void;
    download(path: string, filename: string, options: any, fn: import("express-serve-static-core").Errback): void;
    download(path: any, filename?: any, options?: any, fn?: any) {
        throw new Error("Method not implemented.");
    }
    contentType(type: string): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    type(type: string): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    format(obj: any): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    attachment(filename?: string): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    set(field: any): import("express-serve-static-core").Response;
    set(field: string, value?: string): import("express-serve-static-core").Response;
    set(field: string, value?: string[]): import("express-serve-static-core").Response;
    set(field: any, value?: any): any {
        throw new Error("Method not implemented.");
    }
    header(field: any): import("express-serve-static-core").Response;
    header(field: string, value?: string): import("express-serve-static-core").Response;
    header(field: any, value?: any): any {
        throw new Error("Method not implemented.");
    }
    headersSent: boolean;
    get(field: string): string {
        throw new Error("Method not implemented.");
    }
    clearCookie(name: string, options?: any): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    cookie(name: string, val: string, options: import("express-serve-static-core").CookieOptions): import("express-serve-static-core").Response;
    cookie(name: string, val: any, options: import("express-serve-static-core").CookieOptions): import("express-serve-static-core").Response;
    cookie(name: string, val: any): import("express-serve-static-core").Response;
    cookie(name: any, val: any, options?: any): any {
        throw new Error("Method not implemented.");
    }
    location(url: string): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    redirect(url: string): void;
    redirect(status: number, url: string): void;
    redirect(url: string, status: number): void;
    redirect(url: any, status?: any) {
        throw new Error("Method not implemented.");
    }
    render(view: string, options?: Object, callback?: (err: Error, html: string) => void): void;
    render(view: string, callback?: (err: Error, html: string) => void): void;
    render(view: any, options?: any, callback?: any) {
        throw new Error("Method not implemented.");
    }
    locals: any;
    charset: string;
    vary(field: string): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    app: import("express-serve-static-core").Application;
    append(field: string, value?: string | string[]): import("express-serve-static-core").Response {
        throw new Error("Method not implemented.");
    }
    req?: import("express-serve-static-core").Request;
    statusCode: number;
    statusMessage: string;
    assignSocket(socket: import("net").Socket): void {
        throw new Error("Method not implemented.");
    }
    detachSocket(socket: import("net").Socket): void {
        throw new Error("Method not implemented.");
    }
    writeContinue(callback?: () => void): void {
        throw new Error("Method not implemented.");
    }
    writeHead(statusCode: number, reasonPhrase?: string, headers?: import("http").OutgoingHttpHeaders): void;
    writeHead(statusCode: number, headers?: import("http").OutgoingHttpHeaders): void;
    writeHead(statusCode: any, reasonPhrase?: any, headers?: any) {
        throw new Error("Method not implemented.");
    }
    upgrading: boolean;
    chunkedEncoding: boolean;
    shouldKeepAlive: boolean;
    useChunkedEncodingByDefault: boolean;
    sendDate: boolean;
    finished: boolean;
    connection: import("net").Socket;
    setTimeout(msecs: number, callback?: () => void): this {
        throw new Error("Method not implemented.");
    }
    setHeader(name: string, value: string | number | string[]): void {
        throw new Error("Method not implemented.");
    }
    getHeader(name: string): string | number | string[] {
        throw new Error("Method not implemented.");
    }
    getHeaders(): import("http").OutgoingHttpHeaders {
        throw new Error("Method not implemented.");
    }
    getHeaderNames(): string[] {
        throw new Error("Method not implemented.");
    }
    hasHeader(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    removeHeader(name: string): void {
        throw new Error("Method not implemented.");
    }
    addTrailers(headers: import("http").OutgoingHttpHeaders | [string, string][]): void {
        throw new Error("Method not implemented.");
    }
    flushHeaders(): void {
        throw new Error("Method not implemented.");
    }
    writable: boolean;
    writableHighWaterMark: number;
    writableLength: number;
    _write(chunk: any, encoding: string, callback: (error?: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    _writev?(chunks: { chunk: any; encoding: string; }[], callback: (error?: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    _destroy(error: Error, callback: (error: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    _final(callback: (error?: Error) => void): void {
        throw new Error("Method not implemented.");
    }
    write(chunk: any, cb?: (error: Error) => void): boolean;
    write(chunk: any, encoding?: string, cb?: (error: Error) => void): boolean;
    write(chunk: any, encoding?: any, cb?: any): any {
        throw new Error("Method not implemented.");
    }
    setDefaultEncoding(encoding: string): this {
        throw new Error("Method not implemented.");
    }
    end(cb?: () => void): void;
    end(chunk: any, cb?: () => void): void;
    end(chunk: any, encoding?: string, cb?: () => void): void;
    end(chunk?: any, encoding?: any, cb?: any) {
        throw new Error("Method not implemented.");
    }
    cork(): void {
        throw new Error("Method not implemented.");
    }
    uncork(): void {
        throw new Error("Method not implemented.");
    }
    destroy(error?: Error): void {
        throw new Error("Method not implemented.");
    }
    addListener(event: "close", listener: () => void): this;
    addListener(event: "drain", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "finish", listener: () => void): this;
    addListener(event: "pipe", listener: (src: import("stream").Readable) => void): this;
    addListener(event: "unpipe", listener: (src: import("stream").Readable) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    addListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    emit(event: "close"): boolean;
    emit(event: "drain"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "finish"): boolean;
    emit(event: "pipe", src: import("stream").Readable): boolean;
    emit(event: "unpipe", src: import("stream").Readable): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: any, src?: any, ...rest: any[]): any {
        throw new Error("Method not implemented.");
    }
    on(event: "close", listener: () => void): this;
    on(event: "drain", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "finish", listener: () => void): this;
    on(event: "pipe", listener: (src: import("stream").Readable) => void): this;
    on(event: "unpipe", listener: (src: import("stream").Readable) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    once(event: "close", listener: () => void): this;
    once(event: "drain", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "finish", listener: () => void): this;
    once(event: "pipe", listener: (src: import("stream").Readable) => void): this;
    once(event: "unpipe", listener: (src: import("stream").Readable) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "drain", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "finish", listener: () => void): this;
    prependListener(event: "pipe", listener: (src: import("stream").Readable) => void): this;
    prependListener(event: "unpipe", listener: (src: import("stream").Readable) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "drain", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "finish", listener: () => void): this;
    prependOnceListener(event: "pipe", listener: (src: import("stream").Readable) => void): this;
    prependOnceListener(event: "unpipe", listener: (src: import("stream").Readable) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: any, listener: any): any {
        throw new Error("Method not implemented.");
    }
    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "drain", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "finish", listener: () => void): this;
    removeListener(event: "pipe", listener: (src: import("stream").Readable) => void): this;
    removeListener(event: "unpipe", listener: (src: import("stream").Readable) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: any, listener: any): any {
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


}