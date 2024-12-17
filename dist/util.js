"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondWithError500 = void 0;
function respondWithError500(ex, res) {
    console.log(ex);
    res.status(500).json({ error: ex.toString() });
}
exports.respondWithError500 = respondWithError500;
