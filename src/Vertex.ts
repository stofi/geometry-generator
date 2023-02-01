import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

export default class Vertex {
    public readonly uuid = uuidv4()

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

  

    static comparePosition(a: Vertex, b: Vertex) {
        return a.position.equals(b.position)
    }   

    static compareNormal(a: Vertex, b: Vertex) {
        return a.normal.equals(b.normal)
    }

    static compareUV(a: Vertex, b: Vertex) {
        return a.uv.equals(b.uv)
    }

    static compare(a: Vertex, b: Vertex) {
        return Vertex.comparePosition(a, b) && Vertex.compareNormal(a, b) && Vertex.compareUV(a, b)
    }

}