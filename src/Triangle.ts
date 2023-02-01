import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import Vertex from './Vertex'

export default class Triangle {
    public readonly uuid = uuidv4()
    constructor(
        public readonly A: Vertex,
        public readonly B: Vertex,
        public readonly C: Vertex
    ) {}

    setColor(color: THREE.Color) {
        this.A.setColor(color)
        this.B.setColor(color)
        this.C.setColor(color)
    }

    get normal() {
        const a = this.A.position
        const b = this.B.position
        const c = this.C.position
        const ab = b.clone().sub(a)
        const ac = c.clone().sub(a)
        const normal = ab.clone().cross(ac)
        normal.normalize()
        return normal
    }

    destroy() {
        this.A.destroy()
        this.B.destroy()
        this.C.destroy()
    }

    static compareNormals(a: Triangle, b: Triangle) {
        const aNormal = a.normal
        const bNormal = b.normal
        return aNormal.dot(bNormal)
    }
    
}