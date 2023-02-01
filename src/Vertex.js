"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var uuid_1 = require("uuid");
var Vertex = /** @class */ (function () {
    function Vertex(position, normal, uv, color, faceIndex) {
        if (uv === void 0) { uv = new THREE.Vector2(0, 0); }
        if (color === void 0) { color = new THREE.Color(1, 1, 1); }
        if (faceIndex === void 0) { faceIndex = 0; }
        this.position = position;
        this.normal = normal;
        this.uv = uv;
        this.color = color;
        this.faceIndex = faceIndex;
        this.uuid = (0, uuid_1.v4)();
    }
    Vertex.prototype.setColor = function (color) {
        this.color = color;
    };
    Vertex.prototype.destroy = function () {
        //
    };
    Vertex.comparePosition = function (a, b) {
        return a.position.equals(b.position);
    };
    Vertex.compareNormal = function (a, b) {
        return a.normal.equals(b.normal);
    };
    Vertex.compareUV = function (a, b) {
        return a.uv.equals(b.uv);
    };
    Vertex.compare = function (a, b) {
        return (Vertex.comparePosition(a, b) &&
            Vertex.compareNormal(a, b) &&
            Vertex.compareUV(a, b));
    };
    return Vertex;
}());
exports.default = Vertex;
