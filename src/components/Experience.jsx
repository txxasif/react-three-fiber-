import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Text,
  CameraControls,
  MeshReflectorMaterial,
  RenderTexture,
  Float,
  useHelper,
  Grid,
} from "@react-three/drei";
import * as three from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import Camping from "./Camping";

// Define a color for the text and mesh
const boomColor = new three.Color("#fff");
boomColor.multiplyScalar(1.5); // Multiply the color's brightness

export const Experience = () => {
  // Create a reference for the CameraControls to programmatically control the camera
  const cameraRef = useRef();
  const meshFitCamera = useRef(); // Reference for the mesh that will help adjust the camera position

  // Function to handle an introductory camera animation
  const intro = async () => {
    // Move the camera backward by 22 units
    cameraRef.current.dolly(-22);
    cameraRef.current.smoothTime = 1; // Set smooth transition time
    // Fit the camera to the box geometry (used to set camera framing)
    fitCamera();
  };

  // Fit the camera to the size of a specific mesh
  const fitCamera = async () => {
    cameraRef.current.fitToBox(meshFitCamera.current, true); // Fit the camera to the bounding box of the mesh
  };

  // Use an effect to run the intro animation when the component mounts
  useEffect(() => {
    intro(); // Trigger the intro animation
  }, []); // Empty dependency array ensures this runs only on component mount

  // Adjust the camera on window resize to fit the box
  useEffect(() => {
    window.addEventListener("resize", fitCamera);
    return () => window.removeEventListener("resize", fitCamera); // Clean up event listener on unmount
  });

  // useFrame is called on every render frame (continuously)
  useFrame(() => {
    if (cameraRef.current) {
      const cameraPosition = cameraRef.current.camera.position;

      // Prevent the camera from moving below a certain y-coordinate (like a "floor" for the camera)
      if (cameraPosition.y < -0.2) {
        cameraPosition.y = -0.4; // Clamp the camera's y-position
      }
    }
  });

  return (
    <>
      {/* CameraControls component allows user interaction with the scene */}
      <CameraControls ref={cameraRef} />
      {/* Invisible mesh used for fitting the camera */}
      <mesh ref={meshFitCamera} position-z={2}>
        <boxGeometry args={[6, 2, 10]} /> {/* Defines the box size */}
        <meshBasicMaterial transparent opacity={0} /> {/* Invisible material */}
      </mesh>
      {/* Debugging helpers - Uncomment if needed for development */}
      {/* <Grid position={[0, -1, 0]} args={[10, 10]} /> */}
      {/* <axesHelper args={[5]} /> */}
      {/* 3D Text element that displays "MY LITTLE CAMPING" */}
      <Text
        font={"fonts/Poppins-Black.ttf"} // Custom font for the text
        position={[-2.6, -1, 1]} // Position the text in 3D space
        lineHeight={0.8} // Adjust line spacing
        textAlign="center" // Center-align the text
        rotation-y={degToRad(25)} // Rotate text 25 degrees around the Y-axis
        anchorY={"bottom"} // Anchor the text at the bottom
      >
        MY LITTLE{"\n"}CAMPING {/* Text content with a line break */}
        <meshBasicMaterial
          color={boomColor}
          side={three.DoubleSide} // Make the material visible from both sides
          toneMapped={false} // Disable tone mapping for the material
        >
          {/* RenderTexture renders dynamic 3D content as a texture */}
          <RenderTexture attach={"map"}>
            {/* Lighting and environment setup */}
            <Environment preset="sunset" />
            <color attach="background" args={["#ffff"]} />{" "}
            {/* Background color */}
            <Float floatIntensity={4} rotationIntensity={4}>
              {/* Apply floating animation to the Camping model */}
              <Camping scale={3} />{" "}
              {/* The camping model with a scale factor */}
            </Float>
          </RenderTexture>
        </meshBasicMaterial>
      </Text>
      {/* Main Camping model inside a group for better positioning */}
      <group rotation-y={degToRad(-25)} position-x={3}>
        <Camping />
      </group>
      {/* Reflective floor surface */}
      <mesh position-y={-1} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[50, 50]} /> {/* Large flat plane for the floor */}
        <MeshReflectorMaterial
          blur={[300, 100]} // Blur intensity for ground reflections
          resolution={2048} // Texture resolution for reflections
          mixBlur={1} // Mix blur with surface roughness
          mixStrength={80} // Strength of reflections
          roughness={1} // Roughness factor of the surface
          depthScale={1.2} // Depth scaling for reflections
          minDepthThreshold={0.4} // Minimum depth for reflections
          maxDepthThreshold={1.4} // Maximum depth for reflections
          color="#050505" // Base color for the ground plane
          metalness={0.5} // Metallic effect for reflections
        />
      </mesh>
      <Environment preset="sunset" /> {/* Add environment lighting */}
    </>
  );
};
