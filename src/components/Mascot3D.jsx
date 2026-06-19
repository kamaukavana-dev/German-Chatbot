import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A stylized owl mascot built entirely from primitive geometry — no external
// model needed. mood ∈ 'idle' | 'happy' | 'sad' drives the animation.
function Owl({ mood, talking }) {
  const root = useRef()
  const leftWing = useRef()
  const rightWing = useRef()
  const head = useRef()
  const beak = useRef()
  const tClock = useRef(0)

  const green = useMemo(() => new THREE.Color('#58cc02'), [])
  const greenDark = useMemo(() => new THREE.Color('#58a700'), [])

  useFrame((_, delta) => {
    tClock.current += delta
    const t = tClock.current
    if (!root.current) return

    if (mood === 'happy') {
      // Excited hop + spin-ish wobble
      root.current.position.y = Math.abs(Math.sin(t * 6)) * 0.25
      root.current.rotation.z = Math.sin(t * 12) * 0.08
      if (leftWing.current) leftWing.current.rotation.z = 0.6 + Math.sin(t * 16) * 0.5
      if (rightWing.current) rightWing.current.rotation.z = -0.6 - Math.sin(t * 16) * 0.5
      if (head.current) head.current.rotation.z = Math.sin(t * 8) * 0.15
    } else if (mood === 'sad') {
      // Slump down, droop head
      root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, -0.12, 0.1)
      root.current.rotation.z = Math.sin(t * 2) * 0.02
      if (head.current) head.current.rotation.x = 0.35
      if (leftWing.current) leftWing.current.rotation.z = 0.15
      if (rightWing.current) rightWing.current.rotation.z = -0.15
    } else {
      // Idle: gentle breathing bob + subtle sway
      root.current.position.y = Math.sin(t * 1.6) * 0.06
      root.current.rotation.z = Math.sin(t * 1.1) * 0.03
      if (head.current) {
        head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, 0, 0.1)
        head.current.rotation.y = Math.sin(t * 0.8) * 0.12
      }
      if (leftWing.current)
        leftWing.current.rotation.z = 0.25 + Math.sin(t * 1.6) * 0.05
      if (rightWing.current)
        rightWing.current.rotation.z = -0.25 - Math.sin(t * 1.6) * 0.05
    }

    // Talking: flap the beak open/closed + small head nods, layered on any mood.
    if (beak.current) {
      const open = talking ? 1 + Math.abs(Math.sin(t * 18)) * 1.6 : 1
      beak.current.scale.y = open
      beak.current.position.y = -0.18 - (open - 1) * 0.06
    }
    if (talking && head.current && mood !== 'sad') {
      head.current.rotation.x = Math.sin(t * 9) * 0.06
    }
  })

  return (
    <group ref={root} scale={1.1} position={[0, 0, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, -0.35, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={green} roughness={0.55} />
      </mesh>
      {/* Belly patch */}
      <mesh position={[0, -0.45, 0.7]}>
        <sphereGeometry args={[0.62, 24, 24]} />
        <meshStandardMaterial color={'#89e219'} roughness={0.6} />
      </mesh>

      {/* Head group */}
      <group ref={head} position={[0, 0.55, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshStandardMaterial color={green} roughness={0.55} />
        </mesh>
        {/* Ear tufts */}
        <mesh position={[-0.45, 0.7, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.18, 0.5, 16]} />
          <meshStandardMaterial color={greenDark} roughness={0.6} />
        </mesh>
        <mesh position={[0.45, 0.7, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.18, 0.5, 16]} />
          <meshStandardMaterial color={greenDark} roughness={0.6} />
        </mesh>

        {/* Eye whites */}
        <mesh position={[-0.32, 0.12, 0.62]}>
          <sphereGeometry args={[0.33, 24, 24]} />
          <meshStandardMaterial color={'#ffffff'} roughness={0.3} />
        </mesh>
        <mesh position={[0.32, 0.12, 0.62]}>
          <sphereGeometry args={[0.33, 24, 24]} />
          <meshStandardMaterial color={'#ffffff'} roughness={0.3} />
        </mesh>
        {/* Pupils — look down when sad */}
        <mesh position={[-0.32, mood === 'sad' ? 0.0 : 0.12, 0.9]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={'#3c3c3c'} />
        </mesh>
        <mesh position={[0.32, mood === 'sad' ? 0.0 : 0.12, 0.9]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={'#3c3c3c'} />
        </mesh>

        {/* Beak */}
        <mesh ref={beak} position={[0, -0.18, 0.82]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.16, 0.34, 4]} />
          <meshStandardMaterial color={'#ffc800'} roughness={0.5} />
        </mesh>
      </group>

      {/* Wings */}
      <mesh ref={leftWing} position={[-0.95, -0.35, 0.1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={greenDark} roughness={0.6} />
      </mesh>
      <mesh ref={rightWing} position={[0.95, -0.35, 0.1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={greenDark} roughness={0.6} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.35, -1.25, 0.4]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <meshStandardMaterial color={'#ffc800'} />
      </mesh>
      <mesh position={[0.35, -1.25, 0.4]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <meshStandardMaterial color={'#ffc800'} />
      </mesh>
    </group>
  )
}

export default function Mascot3D({ mood = 'idle', talking = false, className = '' }) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-4, 2, 2]} intensity={0.4} color={'#bbddff'} />
        <Suspense fallback={null}>
          <Owl mood={mood} talking={talking} />
        </Suspense>
      </Canvas>
    </div>
  )
}
