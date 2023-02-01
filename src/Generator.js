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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var Quad_1 = __importDefault(require("./Quad"));
var Triangle_1 = __importDefault(require("./Triangle"));
var Vertex_1 = __importDefault(require("./Vertex"));
var GeometryGenerator = /** @class */ (function () {
    function GeometryGenerator() {
        this.vertices = {};
        this.triangles = {};
        this.quads = {};
        this.faceCount = 0;
        this._data = null;
    }
    GeometryGenerator.prototype.addTriangle = function (a, b, c) {
        this._data = null;
        var normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
        var vertexA = new Vertex_1.default(a, normal);
        var vertexB = new Vertex_1.default(b, normal);
        var vertexC = new Vertex_1.default(c, normal);
        var triangle = new Triangle_1.default(vertexA, vertexB, vertexC);
        this.vertices[vertexA.uuid] = vertexA;
        this.vertices[vertexB.uuid] = vertexB;
        this.vertices[vertexC.uuid] = vertexC;
        this.triangles[triangle.uuid] = triangle;
        return triangle;
    };
    GeometryGenerator.prototype.addQuad = function (a, b, c, d, uvs) {
        this._data = null;
        var normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
        var vertexA = new Vertex_1.default(a, normal);
        var vertexB = new Vertex_1.default(b, normal);
        var vertexC = new Vertex_1.default(c, normal);
        var vertexD = new Vertex_1.default(a, normal);
        var vertexE = new Vertex_1.default(c, normal);
        var vertexF = new Vertex_1.default(d, normal);
        // set uv
        vertexA.uv = new THREE.Vector2(0, 0);
        vertexB.uv = new THREE.Vector2(1, 0);
        vertexC.uv = new THREE.Vector2(1, 1);
        vertexA.faceIndex = this.faceCount;
        vertexB.faceIndex = this.faceCount;
        vertexC.faceIndex = this.faceCount;
        vertexD.uv = new THREE.Vector2(0, 0);
        vertexE.uv = new THREE.Vector2(1, 1);
        vertexF.uv = new THREE.Vector2(0, 1);
        vertexD.faceIndex = this.faceCount;
        vertexE.faceIndex = this.faceCount;
        vertexF.faceIndex = this.faceCount;
        if (uvs) {
            vertexA.uv = uvs[0];
            vertexB.uv = uvs[1];
            vertexC.uv = uvs[2];
            vertexD.uv = uvs[0];
            vertexE.uv = uvs[2];
            vertexF.uv = uvs[3];
        }
        var triangleABC = new Triangle_1.default(vertexA, vertexB, vertexC);
        var triangleDEF = new Triangle_1.default(vertexD, vertexE, vertexF);
        var quad = new Quad_1.default(triangleABC, triangleDEF);
        this.vertices[vertexA.uuid] = vertexA;
        this.vertices[vertexB.uuid] = vertexB;
        this.vertices[vertexC.uuid] = vertexC;
        this.vertices[vertexD.uuid] = vertexD;
        this.vertices[vertexE.uuid] = vertexE;
        this.vertices[vertexF.uuid] = vertexF;
        this.triangles[triangleABC.uuid] = triangleABC;
        this.triangles[triangleDEF.uuid] = triangleDEF;
        this.quads[quad.uuid] = quad;
        this.faceCount += 1;
        return quad;
    };
    GeometryGenerator.prototype.join = function (a, b) {
        if (!Quad_1.default.areInSamePlane(a, b)) {
            throw new Error('Quads must be in the same plane to join them');
        }
        var sharedEdge = Quad_1.default.sharedEdge(a, b);
        if (sharedEdge === null) {
            throw new Error('Quads must share an edge to join them');
        }
        var _a = a.vertices, a1 = _a[0], a2 = _a[1], a3 = _a[2], a4 = _a[3];
        var _b = b.vertices, b1 = _b[0], b2 = _b[1], b3 = _b[2], b4 = _b[3];
        var quad = null;
        var edgeHasVertex = function (vertex) {
            return sharedEdge.some(function (v) { return Vertex_1.default.comparePosition(v, vertex); });
        };
        /**
         * a4 a3
         * a1 a2
         */
        if (edgeHasVertex(a1) &&
            edgeHasVertex(a2) &&
            edgeHasVertex(b4) &&
            edgeHasVertex(b3)) {
            /**
             * b4 (b3 a4) a3
             * b1 (b2 a1) a2
             */
            quad = this.addQuad(a2.position, a3.position, b4.position, b1.position, [
                a2.uv.add(new THREE.Vector2(b2.uv.x, 0)),
                a3.uv.add(new THREE.Vector2(b3.uv.x, 0)),
                b4.uv,
                b1.uv,
            ]);
        }
        if (edgeHasVertex(a2) &&
            edgeHasVertex(a3) &&
            edgeHasVertex(b1) &&
            edgeHasVertex(b4)) {
            /**
             * a4 (a3 b4) b3
             * a1 (a2 b1) b2
             */
            quad = this.addQuad(a1.position, b2.position, b3.position, a4.position, [
                a1.uv,
                b2.uv.add(new THREE.Vector2(a2.uv.x, 0)),
                b3.uv.add(new THREE.Vector2(a3.uv.x, 0)),
                a4.uv,
            ]);
        }
        if (edgeHasVertex(a3) &&
            edgeHasVertex(a4) &&
            edgeHasVertex(b2) &&
            edgeHasVertex(b1)) {
            /**
             *  b4 b3
             * (b1 b2)
             * (a4 a3)
             *  a1 a2
             */
            quad = this.addQuad(a1.position, a2.position, b3.position, b4.position, [
                a1.uv,
                a2.uv,
                b3.uv.add(new THREE.Vector2(0, a3.uv.y)),
                b4.uv.add(new THREE.Vector2(0, a4.uv.y)),
            ]);
        }
        if (edgeHasVertex(a1) &&
            edgeHasVertex(a2) &&
            edgeHasVertex(b4) &&
            edgeHasVertex(b3)) {
            /**
             *  a4 a3
             * (a1 a2)
             * (b4 b3)
             *  b1 b2
             */
            quad = this.addQuad(b1.position, b2.position, a3.position, a4.position, [
                b1.uv,
                b2.uv,
                a3.uv.add(new THREE.Vector2(0, b3.uv.y)),
                a4.uv.add(new THREE.Vector2(0, b4.uv.y)),
            ]);
        }
        if (quad === null) {
            throw new Error('Could not join quads');
        }
        this.removeQuad(a);
        this.removeQuad(b);
        return quad;
    };
    GeometryGenerator.prototype.canJoin = function (a, b) {
        if (!Quad_1.default.areInSamePlane(a, b))
            return false;
        var sharedEdge = Quad_1.default.sharedEdge(a, b);
        if (sharedEdge === null)
            return false;
        var _a = a.vertices, a1 = _a[0], a2 = _a[1], a3 = _a[2], a4 = _a[3];
        var _b = b.vertices, b1 = _b[0], b2 = _b[1], b3 = _b[2], b4 = _b[3];
        var edgeHasVertex = function (vertex) {
            return sharedEdge.some(function (v) { return Vertex_1.default.comparePosition(v, vertex); });
        };
        return ((edgeHasVertex(a1) &&
            edgeHasVertex(a2) &&
            edgeHasVertex(b4) &&
            edgeHasVertex(b3)) ||
            (edgeHasVertex(a2) &&
                edgeHasVertex(a3) &&
                edgeHasVertex(b1) &&
                edgeHasVertex(b4)) ||
            (edgeHasVertex(a3) &&
                edgeHasVertex(a4) &&
                edgeHasVertex(b2) &&
                edgeHasVertex(b1)) ||
            (edgeHasVertex(a1) &&
                edgeHasVertex(a2) &&
                edgeHasVertex(b4) &&
                edgeHasVertex(b3)));
    };
    GeometryGenerator.prototype.removeQuad = function (quad) {
        this._data = null;
        delete this.quads[quad.uuid];
        delete this.triangles[quad.ABC.uuid];
        delete this.triangles[quad.DEF.uuid];
        delete this.vertices[quad.ABC.A.uuid];
        delete this.vertices[quad.ABC.B.uuid];
        delete this.vertices[quad.ABC.C.uuid];
        delete this.vertices[quad.DEF.A.uuid];
        delete this.vertices[quad.DEF.B.uuid];
        delete this.vertices[quad.DEF.C.uuid];
    };
    GeometryGenerator.prototype.mergeAdjacentQuads = function () {
        var _this = this;
        var quadsGroupedByPlane = Object.values(this.quads).reduce(function (acc, quad) {
            if (!quad.isPlanar)
                return acc;
            var normal = "".concat(quad.normal.x, " ").concat(quad.normal.y, " ").concat(quad.normal.z);
            var sD = quad.signedDistance.toString();
            var plane = "".concat(normal, " ").concat(sD);
            if (!acc[plane])
                acc[plane] = [];
            acc[plane].push(quad);
            return acc;
        }, {});
        var toJoin = [];
        var toRemove = [];
        Object.values(quadsGroupedByPlane).forEach(function (quads) {
            var _loop_1 = function (i) {
                var quad = quads[i];
                if (!quad)
                    return "continue";
                if (toRemove.includes(quad))
                    return "continue";
                if (toJoin.some(function (_a) {
                    var a = _a[0], b = _a[1];
                    return a === quad || b === quad;
                }))
                    return "continue";
                var _loop_2 = function (j) {
                    var other = quads[j];
                    if (!other)
                        return "continue";
                    if (toRemove.includes(other))
                        return "continue";
                    if (toJoin.some(function (_a) {
                        var a = _a[0], b = _a[1];
                        return a === quad ||
                            a === other ||
                            b === quad ||
                            b === other;
                    }))
                        return "continue";
                    if (_this.canJoin(quad, other)) {
                        toJoin.push([quad, other]);
                        toRemove.push(other, quad);
                    }
                };
                for (var j = i + 1; j < quads.length; j++) {
                    _loop_2(j);
                }
            };
            // for each pair of quads, try to join them
            for (var i = 0; i < quads.length; i++) {
                _loop_1(i);
            }
        });
        toJoin.forEach(function (_a) {
            var a = _a[0], b = _a[1];
            _this.join(a, b);
        });
    };
    GeometryGenerator.prototype.optimize = function (steps) {
        if (steps === void 0) { steps = 1; }
        console.log("Optimizing geometry... ".concat(steps, " steps "));
        for (var i = 0; i < steps; i++) {
            this.mergeAdjacentQuads();
        }
    };
    GeometryGenerator.prototype.calculateData = function () {
        if (this._data)
            return this._data;
        this.optimize(1);
        var vertices = Object.values(this.vertices);
        var count = vertices.length;
        var colors = new Float32Array(count * 3);
        var positions = new Float32Array(count * 3);
        var normals = new Float32Array(count * 3);
        var indices = new Uint32Array(count);
        var faceIndices = new Uint32Array(count);
        var uvs = new Float32Array(count * 2);
        for (var i = 0; i < count; i++) {
            var vertex = vertices[i];
            if (!vertex)
                continue;
            positions[i * 3] = vertex.position.x;
            positions[i * 3 + 1] = vertex.position.y;
            positions[i * 3 + 2] = vertex.position.z;
            normals[i * 3] = vertex.normal.x;
            normals[i * 3 + 1] = vertex.normal.y;
            normals[i * 3 + 2] = vertex.normal.z;
            indices[i] = i;
            colors[i * 3] = vertex.color.r;
            colors[i * 3 + 1] = vertex.color.g;
            colors[i * 3 + 2] = vertex.color.b;
            uvs[i * 2] = vertex.uv.x;
            uvs[i * 2 + 1] = vertex.uv.y;
            faceIndices[i] = vertex.faceIndex;
        }
        this._data = {
            positions: positions,
            normals: normals,
            indices: indices,
            uvs: uvs,
            colors: colors,
            count: count,
            faceIndices: faceIndices,
        };
        return this._data;
    };
    Object.defineProperty(GeometryGenerator.prototype, "count", {
        get: function () {
            return this.calculateData().count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryGenerator.prototype, "positions", {
        get: function () {
            return this.calculateData().positions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryGenerator.prototype, "normals", {
        get: function () {
            return this.calculateData().normals;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryGenerator.prototype, "indices", {
        get: function () {
            return this.calculateData().indices;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryGenerator.prototype, "faceIndices", {
        get: function () {
            return this.calculateData().faceIndices;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryGenerator.prototype, "uvs", {
        get: function () {
            return this.calculateData().uvs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GeometryGenerator.prototype, "colors", {
        get: function () {
            return this.calculateData().colors;
        },
        enumerable: false,
        configurable: true
    });
    GeometryGenerator.prototype.destroy = function () {
        Object.values(this.vertices).forEach(function (v) { return v.destroy(); });
        Object.values(this.triangles).forEach(function (t) { return t.destroy(); });
        Object.values(this.quads).forEach(function (q) { return q.destroy(); });
        this.vertices = {};
        this.triangles = {};
        this.quads = {};
        this._data = null;
    };
    return GeometryGenerator;
}());
exports.default = GeometryGenerator;
