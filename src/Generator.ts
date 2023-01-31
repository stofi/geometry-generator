import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

export class Vertex {
    uuid = uuidv4()

    constructor(
        public readonly position: THREE.Vector3,
        public readonly normal: THREE.Vector3,
        public uv: THREE.Vector2 = new THREE.Vector2(0, 0),
        public color: THREE.Color = new THREE.Color(1, 1, 1),
        public faceIndex: number = 0
    ) {}

    setColor(color: THREE.Color) {
        this.color = color
    }

    destroy() {
        //
    }
}

export class Triangle {
    uuid = uuidv4()
    constructor(
        public readonly a: Vertex,
        public readonly b: Vertex,
        public readonly c: Vertex
    ) {}

    setColor(color: THREE.Color) {
        this.a.setColor(color)
        this.b.setColor(color)
        this.c.setColor(color)
    }

    destroy() {
        this.a.destroy()
        this.b.destroy()
        this.c.destroy()
    }
}

export class Quad {
    uuid = uuidv4()

    constructor(public readonly ABC: Triangle, public readonly DEF: Triangle) {}

    setColor(color: THREE.Color) {
        this.ABC.setColor(color)
        this.DEF.setColor(color)
    }

    destroy() {
        this.ABC.destroy()
        this.DEF.destroy()
    }
}

export default class GeometryGenerator {
    vertices: Record<string, Vertex> = {}
    triangles: Record<string, Triangle> = {}
    quads: Record<string, Quad> = {}
    dirty = false
    faceCount = 0
    _data: {
        positions: Float32Array
        normals: Float32Array
        indices: Uint32Array
        uvs: Float32Array
        colors: Float32Array
        count: number
        faceIndices: Uint32Array
    } | null = null

    addTriangle(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
        this.dirty = true
        const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize()

        const vertexA = new Vertex(a, normal)
        const vertexB = new Vertex(b, normal)
        const vertexC = new Vertex(c, normal)

        const triangle = new Triangle(vertexA, vertexB, vertexC)

        this.vertices[vertexA.uuid] = vertexA
        this.vertices[vertexB.uuid] = vertexB
        this.vertices[vertexC.uuid] = vertexC

        this.triangles[triangle.uuid] = triangle
    }

    addQuad(
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3,
        d: THREE.Vector3,
        uvs?: [THREE.Vector2, THREE.Vector2, THREE.Vector2, THREE.Vector2]
    ) {
        this.dirty = true

        const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize()

        const vertexA = new Vertex(a, normal)
        const vertexB = new Vertex(b, normal)
        const vertexC = new Vertex(c, normal)
        const vertexD = new Vertex(a, normal)
        const vertexE = new Vertex(c, normal)
        const vertexF = new Vertex(d, normal)

        // set uv
        vertexA.uv = new THREE.Vector2(0, 0)
        vertexB.uv = new THREE.Vector2(1, 0)
        vertexC.uv = new THREE.Vector2(1, 1)
        vertexA.faceIndex = this.faceCount
        vertexB.faceIndex = this.faceCount
        vertexC.faceIndex = this.faceCount

        vertexD.uv = new THREE.Vector2(0, 0)
        vertexE.uv = new THREE.Vector2(1, 1)
        vertexF.uv = new THREE.Vector2(0, 1)
        vertexD.faceIndex = this.faceCount
        vertexE.faceIndex = this.faceCount
        vertexF.faceIndex = this.faceCount

        if (uvs) {
            vertexA.uv = uvs[0]
            vertexB.uv = uvs[1]
            vertexC.uv = uvs[2]
            vertexD.uv = uvs[0]
            vertexE.uv = uvs[2]
            vertexF.uv = uvs[3]
        }

        const triangleABC = new Triangle(vertexA, vertexB, vertexC)
        const triangleDEF = new Triangle(vertexD, vertexE, vertexF)

        const quad = new Quad(triangleABC, triangleDEF)

        this.vertices[vertexA.uuid] = vertexA
        this.vertices[vertexB.uuid] = vertexB
        this.vertices[vertexC.uuid] = vertexC
        this.vertices[vertexD.uuid] = vertexD
        this.vertices[vertexE.uuid] = vertexE
        this.vertices[vertexF.uuid] = vertexF

        this.triangles[triangleABC.uuid] = triangleABC
        this.triangles[triangleDEF.uuid] = triangleDEF

        this.quads[quad.uuid] = quad
        this.faceCount += 1
        return quad
    }

    optimize() {
        //
    }

    calculateData() {
        if (!this.dirty) {
            return
        }
        this.optimize()
        const vertices = Object.values(this.vertices)
        const count = vertices.length
        const colors = new Float32Array(count * 3)
        const positions = new Float32Array(count * 3)
        const normals = new Float32Array(count * 3)
        const indices = new Uint32Array(count)
        const faceIndices = new Uint32Array(count)
        const uvs = new Float32Array(count * 2)

        for (let i = 0; i < count; i++) {
            const vertex = vertices[i]
            if (!vertex) continue

            positions[i * 3] = vertex.position.x
            positions[i * 3 + 1] = vertex.position.y
            positions[i * 3 + 2] = vertex.position.z
            normals[i * 3] = vertex.normal.x
            normals[i * 3 + 1] = vertex.normal.y
            normals[i * 3 + 2] = vertex.normal.z
            indices[i] = i
            colors[i * 3] = vertex.color.r
            colors[i * 3 + 1] = vertex.color.g
            colors[i * 3 + 2] = vertex.color.b
            uvs[i * 2] = vertex.uv.x
            uvs[i * 2 + 1] = vertex.uv.y
            faceIndices[i] = vertex.faceIndex
        }

        this._data = {
            positions,
            normals,
            indices,
            uvs,
            colors,
            count,
            faceIndices,
        }

        this.dirty = false
    }

    get count() {
        this.calculateData()

        return this._data!.count
    }

    get positions() {
        this.calculateData()

        return this._data!.positions
    }

    get normals() {
        this.calculateData()

        return this._data!.normals
    }

    get indices() {
        this.calculateData()

        return this._data!.indices
    }

    get faceIndices() {
        this.calculateData()

        return this._data!.faceIndices
    }

    get uvs() {
        this.calculateData()

        return this._data!.uvs
    }

    get colors() {
        this.calculateData()

        return this._data!.colors
    }

    destroy() {
        Object.values(this.vertices).forEach((v) => v.destroy())
        Object.values(this.triangles).forEach((t) => t.destroy())
        Object.values(this.quads).forEach((q) => q.destroy())
        this.vertices = {}
        this.triangles = {}
        this.quads = {}
        this._data = null
    }
}
