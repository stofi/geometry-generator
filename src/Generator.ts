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

    addTriangle(
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3
    ): Triangle {
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

        let quad: Quad | null = null

        const edgeHasVertex = (vertex: Vertex) => {
            return sharedEdge.some((v) => Vertex.comparePosition(v, vertex))
        }

        /**
         * a4 a3
         * a1 a2
         */

        if (
            edgeHasVertex(a1) &&
            edgeHasVertex(a2) &&
            edgeHasVertex(b4) &&
            edgeHasVertex(b3)
        ) {
            /**
             * b4 (b3 a4) a3
             * b1 (b2 a1) a2
             */
            quad = this.addQuad(
                a2.position,
                a3.position,
                b4.position,
                b1.position,
                [
                    a2.uv.add(new THREE.Vector2(b2.uv.x, 0)),
                    a3.uv.add(new THREE.Vector2(b3.uv.x, 0)),
                    b4.uv,
                    b1.uv,
                ]
            )
        }

        if (
            edgeHasVertex(a2) &&
            edgeHasVertex(a3) &&
            edgeHasVertex(b1) &&
            edgeHasVertex(b4)
        ) {
            /**
             * a4 (a3 b4) b3
             * a1 (a2 b1) b2
             */
            quad = this.addQuad(
                a1.position,
                b2.position,
                b3.position,
                a4.position,
                [
                    a1.uv,
                    b2.uv.add(new THREE.Vector2(a2.uv.x, 0)),
                    b3.uv.add(new THREE.Vector2(a3.uv.x, 0)),
                    a4.uv,
                ]
            )
        }

        if (
            edgeHasVertex(a3) &&
            edgeHasVertex(a4) &&
            edgeHasVertex(b2) &&
            edgeHasVertex(b1)
        ) {
            /**
             *  b4 b3
             * (b1 b2)
             * (a4 a3)
             *  a1 a2
             */
            quad = this.addQuad(
                a1.position,
                a2.position,
                b3.position,
                b4.position,
                [
                    a1.uv,
                    a2.uv,
                    b3.uv.add(new THREE.Vector2(0, a3.uv.y)),
                    b4.uv.add(new THREE.Vector2(0, a4.uv.y)),
                ]
            )
        }

        if (
            edgeHasVertex(a1) &&
            edgeHasVertex(a2) &&
            edgeHasVertex(b4) &&
            edgeHasVertex(b3)
        ) {
            /**
             *  a4 a3
             * (a1 a2)
             * (b4 b3)
             *  b1 b2
             */
            quad = this.addQuad(
                b1.position,
                b2.position,
                a3.position,
                a4.position,
                [
                    b1.uv,
                    b2.uv,
                    a3.uv.add(new THREE.Vector2(0, b3.uv.y)),
                    a4.uv.add(new THREE.Vector2(0, b4.uv.y)),
                ]
            )
        }

        if (quad === null) {
            throw new Error('Could not join quads')
        }

        this.removeQuad(a)
        this.removeQuad(b)

        return quad
    }

    canJoin(a: Quad, b: Quad): boolean {
        if (!Quad.areInSamePlane(a, b)) return false

        const sharedEdge = Quad.sharedEdge(a, b)
        if (sharedEdge === null) return false

        const [a1, a2, a3, a4] = a.vertices
        const [b1, b2, b3, b4] = b.vertices

        const edgeHasVertex = (vertex: Vertex) => {
            return sharedEdge.some((v) => Vertex.comparePosition(v, vertex))
        }

        return (
            (edgeHasVertex(a1) &&
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
                edgeHasVertex(b3))
        )
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

    mergeAdjacentQuads() {
        const quadsGroupedByPlane = Object.values(this.quads).reduce(
            (acc, quad) => {
                if (!quad.isPlanar) return acc
                const normal = `${quad.normal.x} ${quad.normal.y} ${quad.normal.z}`
                const sD = quad.signedDistance.toString()
                const plane = `${normal} ${sD}`

                if (!acc[plane]) acc[plane] = []
                ;(acc[plane] as any).push(quad)
                return acc
            },
            {} as { [key: string]: Quad[] }
        )

        const toJoin: [Quad, Quad][] = []
        const toRemove: Quad[] = []
        Object.values(quadsGroupedByPlane).forEach((quads) => {
            // for each pair of quads, try to join them
            for (let i = 0; i < quads.length; i++) {
                const quad = quads[i]
                if (!quad) continue
                if (toRemove.includes(quad)) continue
                if (toJoin.some(([a, b]) => a === quad || b === quad)) continue

                for (let j = i + 1; j < quads.length; j++) {
                    const other = quads[j]
                    if (!other) continue
                    if (toRemove.includes(other)) continue
                    if (
                        toJoin.some(
                            ([a, b]) =>
                                a === quad ||
                                a === other ||
                                b === quad ||
                                b === other
                        )
                    )
                        continue

                    if (this.canJoin(quad, other)) {
                        toJoin.push([quad, other])
                        toRemove.push(other, quad)
                    }
                }
            }
        })

        toJoin.forEach(([a, b]) => {
            this.join(a, b)
        })
    }

    optimize(steps = 1) {
        for (let i = 0; i < steps; i++) {
            this.mergeAdjacentQuads()
        }
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
