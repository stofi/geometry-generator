"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var Triangle_1 = __importDefault(require("./Triangle"));
var Vertex_1 = __importDefault(require("./Vertex"));
var Quad = /** @class */ (function () {
    function Quad(ABC, DEF) {
        this.ABC = ABC;
        this.DEF = DEF;
        this.uuid = (0, uuid_1.v4)();
    }
    Quad.prototype.setColor = function (color) {
        this.ABC.setColor(color);
        this.DEF.setColor(color);
    };
    Quad.prototype.destroy = function () {
        this.ABC.destroy();
        this.DEF.destroy();
    };
    Object.defineProperty(Quad.prototype, "normal", {
        get: function () {
            return this.ABC.normal;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Quad.prototype, "signedDistance", {
        get: function () {
            return this.ABC.signedDistance;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Quad.prototype, "isPlanar", {
        get: function () {
            return Triangle_1.default.compareNormals(this.ABC, this.DEF) === 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Quad.prototype, "vertices", {
        get: function () {
            return [this.ABC.A, this.ABC.B, this.ABC.C, this.DEF.C];
        },
        enumerable: false,
        configurable: true
    });
    Quad.compareNormals = function (a, b) {
        return Triangle_1.default.compareNormals(a.ABC, b.ABC);
    };
    Quad.sharedVertices = function (a, b) {
        var aVertices = [a.ABC.A, a.ABC.B, a.ABC.C, a.DEF.A, a.DEF.B, a.DEF.C];
        var bVertices = [b.ABC.A, b.ABC.B, b.ABC.C, b.DEF.A, b.DEF.B, b.DEF.C];
        var sharedVertices = aVertices.filter(function (vertex) {
            return bVertices.includes(vertex);
        });
        return sharedVertices;
    };
    Quad.sharedEdges = function (a, b) {
        var compare = function (a, b) {
            if (Vertex_1.default.comparePosition(a[0], b[0]) &&
                Vertex_1.default.comparePosition(a[1], b[1])) {
                return true;
            }
            if (Vertex_1.default.comparePosition(a[0], b[1]) &&
                Vertex_1.default.comparePosition(a[1], b[0])) {
                return true;
            }
            return false;
        };
        var aEdges = [
            [a.ABC.A, a.ABC.B],
            [a.ABC.B, a.ABC.C],
            [a.ABC.C, a.ABC.A],
            [a.DEF.A, a.DEF.B],
            [a.DEF.B, a.DEF.C],
            [a.DEF.C, a.DEF.A],
        ];
        var bEdges = [
            [b.ABC.A, b.ABC.B],
            [b.ABC.B, b.ABC.C],
            [b.ABC.C, b.ABC.A],
            [b.DEF.A, b.DEF.B],
            [b.DEF.B, b.DEF.C],
            [b.DEF.C, b.DEF.A],
        ];
        var sharedEdges = aEdges.filter(function (edge) {
            return bEdges.some(function (bEdge) { return compare(edge, bEdge); });
        });
        return sharedEdges;
    };
    Quad.sharedEdge = function (a, b) {
        var sharedEdges = Quad.sharedEdges(a, b);
        if (sharedEdges.length === 1 && sharedEdges[0] !== undefined) {
            return sharedEdges[0];
        }
        return null;
    };
    Quad.areNeighbors = function (a, b) {
        return Quad.sharedEdge(a, b) !== null;
    };
    Quad.areInSamePlane = function (a, b) {
        return (a.isPlanar &&
            b.isPlanar &&
            Quad.areNeighbors(a, b) &&
            Quad.compareNormals(a, b) === 1);
    };
    return Quad;
}());
exports.default = Quad;
