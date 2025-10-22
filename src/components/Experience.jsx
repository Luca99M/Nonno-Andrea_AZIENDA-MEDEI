import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";

const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);
  if (!loading) return null;
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = () => {
  const cameraControls = useRef();
  const { cameraZoomed } = useChat();

  useEffect(() => {
    // 🎥 Camera iniziale - alzata per vedere meglio Nonno Andrea
    cameraControls.current.setLookAt(0, 2, 5, 0, 2, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      // 📸 Camera ZOOMATA - più vicina e alta
      cameraControls.current.setLookAt(0, 2, 5, 0, 2, 0, true);
    } else {
      // 📸 Camera NORMALE - più distante e alta
      cameraControls.current.setLookAt(0, 3, 4, 0, 2, 0, true);
    }
  }, [cameraZoomed]);
  
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      
      {/* 🎯 NONNO ANDREA - Scala 3x e posizionato più in alto */}
      <Avatar 
        scale={6}           
        position={[0, 0.0, 0]}  
      />
      
      <ContactShadows opacity={0.7} position-y={-0.05} scale={10}/>
    </>
  );
};