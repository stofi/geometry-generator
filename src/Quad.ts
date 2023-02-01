import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import Triangle from './Triangle'
import Vertex from './Vertex'

type Edge = [Vertex, Vertex]

export default class Quad {
    public readonly uuid = uuidv4()

    constructor(public readonly ABC: Triangle, public readonly DEF: Triangle) {}

    setColor(color: THREE.Color) {
        this.ABC.setColor(color)
        this.DEF.setColor(color)
    }

    destroy() {
        this.ABC.destroy()
        this.DEF.destroy()
    }

    get normal() {
        return this.ABC.normal
    }

    get signedDistance() {
        return this.ABC.signedDistance
    }

    get isPlanar() {
        return Triangle.compareNormals(this.ABC, this.DEF) === 1
    }

    get vertices(): [Vertex, Vertex, Vertex, Vertex] {
        return [this.ABC.A, this.ABC.B, this.ABC.C, this.DEF.C]
    }

    static compareNormals(a: Quad, b: Quad) {
        return Triangle.compareNormals(a.ABC, b.ABC)
    }

    static sharedVertices(a: Quad, b: Quad) {
        const aVertices = [a.ABC.A, a.ABC.B, a.ABC.C, a.DEF.A, a.DEF.B, a.DEF.C]
        const bVertices = [b.ABC.A, b.ABC.B, b.ABC.C, b.DEF.A, b.DEF.B, b.DEF.C]

        const sharedVertices = aVertices.filter((vertex) =>
            bVertices.includes(vertex)
        )
        return sharedVertices
    }

    static sharedEdges(a: Quad, b: Quad): Edge[] {
        const compare = (a: Edge, b: Edge) => {
            if (
                Vertex.comparePosition(a[0], b[0]) &&
                Vertex.comparePosition(a[1], b[1])
            ) {
                return true
            }

            if (
                Vertex.comparePosition(a[0], b[1]) &&
                Vertex.comparePosition(a[1], b[0])
            ) {
                return true
            }

            return false
        }

        const aEdges: Edge[] = [
            [a.ABC.A, a.ABC.B],
            [a.ABC.B, a.ABC.C],
            [a.ABC.C, a.ABC.A],
            [a.DEF.A, a.DEF.B],
            [a.DEF.B, a.DEF.C],
            [a.DEF.C, a.DEF.A],
        ]
        const bEdges: Edge[] = [
            [b.ABC.A, b.ABC.B],
            [b.ABC.B, b.ABC.C],
            [b.ABC.C, b.ABC.A],
            [b.DEF.A, b.DEF.B],
            [b.DEF.B, b.DEF.C],
            [b.DEF.C, b.DEF.A],
        ]

        const sharedEdges = aEdges.filter((edge) =>
            bEdges.some((bEdge) => compare(edge, bEdge))
        )
        return sharedEdges
    }

    static sharedEdge(a: Quad, b: Quad): Edge | null {
        const sharedEdges = Quad.sharedEdges(a, b)
        if (sharedEdges.length === 1 && sharedEdges[0] !== undefined) {
            return sharedEdges[0]
        }
        return null
    }

    static areNeighbors(a: Quad, b: Quad) {
        return Quad.sharedEdge(a, b) !== null
    }

    static areInSamePlane(a: Quad, b: Quad) {
        return (
            a.isPlanar &&
            b.isPlanar &&
            Quad.areNeighbors(a, b) &&
            Quad.compareNormals(a, b) === 1
        )
    }
}
