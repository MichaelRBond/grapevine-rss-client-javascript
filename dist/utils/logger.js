"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    static info(msg) {
        return Logger.log("info", msg);
    }
    static debug(msg) {
        return Logger.log("debug", msg);
    }
    static error(msg) {
        return Logger.log("error", msg);
    }
    static log(type, msg) {
        console.log(`${type.toUpperCase()}: ${msg}`); // eslint-disable-line no-console
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map