"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var Triangle = /** @class */ (function () {
    function Triangle(A, B, C) {
        this.A = A;
        this.B = B;
        this.C = C;
        this.uuid = (0, uuid_1.v4)();
    }
    Triangle.prototype.setColor = function (color) {
        this.A.setColor(color);
        this.B.setColor(color);
        this.C.setColor(color);
    };
    Object.defineProperty(Triangle.prototype, "normal", {
        get: function () {
            var a = this.A.position;
            var b = this.B.position;
            var c = this.C.position;
            var ab = b.clone().sub(a);
            var ac = c.clone().sub(a);
            var normal = ab.clone().cross(ac);
            normal.normalize();
            return normal;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Triangle.prototype, "signedDistance", {
        get: function () {
            var a = this.A.position;
            var b = this.B.position;
            var c = this.C.position;
            var normal = this.normal;
            var signedDistance = -normal.dot(a);
            return signedDistance;
        },
        enumerable: false,
        configurable: true
    });
    Triangle.prototype.destroy = function () {
        this.A.destroy();
        this.B.destroy();
        this.C.destroy();
    };
    Triangle.compareNormals = function (a, b) {
        var aNormal = a.normal;
        var bNormal = b.normal;
        return aNormal.dot(bNormal);
    };
    return Triangle;
}());
exports.default = Triangle;
