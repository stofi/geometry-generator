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
}