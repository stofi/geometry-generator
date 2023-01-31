import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import Quad from './Quad'
import Triangle from './Triangle'
import Vertex from './Vertex'


interface GeometryGeneratorData {
    positions: Float32Array
    normals: Float32Array
    indices: Uint32Array
    uvs: Float32Array
    colors: Float32Array
    count: number
    faceIndices: Uint32Array
}

export default class GeometryGenerator {
    vertices: Record<string, Vertex> = {}
    triangles: Record<string, Triangle> = {}
    quads: Record<string, Quad> = {}
    dirty = false
    faceCount = 0
    _data: GeometryGeneratorData | null = null

    addTriangle(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): Triangle {
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

        return triangle
    }

    addQuad(
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3,
        d: THREE.Vector3,
        uvs?: [THREE.Vector2, THREE.Vector2, THREE.Vector2, THREE.Vector2]
    ): Quad {
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

    join(a: Quad, b: Quad) {
        if (!Quad.areInSamePlane(a, b)) {
            throw new Error('Quads must be in the same plane to join them')
        }

        const sharedEdge = Quad.sharedEdge(a, b)
        if (sharedEdge === null) {
            throw new Error('Quads must share an edge to join them')
        }

        const [a1, a2, a3, a4] = a.vertices
        const [b1, b2, b3, b4] = b.vertices

        const allVertices = [a1, a2, a3, a4, b1, b2, b3, b4]

        const [v1, v2] = sharedEdge

        const otherVertices = allVertices.filter((v) => v !== v1 && v !== v2)


        // there should be 4 other vertices
        if (otherVertices.length !== 4) {
            throw new Error('Quads must share an edge to join them')
        }

        const [v3, v4, v5, v6] = otherVertices as [Vertex, Vertex, Vertex, Vertex]

        const newVertexA = v3
        const newVertexB = v4
        const newVertexC = v5
        const newVertexD = v3
        const newVertexE = v5
        const newVertexF = v6


        this.removeQuad(a)
        this.removeQuad(b)

        this.addQuad(newVertexA.position, newVertexB.position, newVertexC.position, newVertexF.position)
    }

    removeQuad(quad: Quad) {
        this.dirty = true
        delete this.quads[quad.uuid]
        delete this.triangles[quad.ABC.uuid]
        delete this.triangles[quad.DEF.uuid]
        delete this.vertices[quad.ABC.A.uuid]
        delete this.vertices[quad.ABC.B.uuid]
        delete this.vertices[quad.ABC.C.uuid]
        delete this.vertices[quad.DEF.A.uuid]
        delete this.vertices[quad.DEF.B.uuid]
        delete this.vertices[quad.DEF.C.uuid]
    }

    optimize() {
        //
    }

    calculateData(): GeometryGeneratorData {
        if (!this.dirty && this._data) return this._data
        
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

        return this._data
    }

    get count() {
        return this.calculateData().count
    }

    get positions() {
        return this.calculateData().positions
    }

    get normals() {
        return this.calculateData().normals
    }

    get indices() {
        return this.calculateData().indices
    }

    get faceIndices() {
        return this.calculateData().faceIndices
    }

    get uvs() {
        return this.calculateData().uvs
    }

    get colors() {
        return this.calculateData().colors
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
