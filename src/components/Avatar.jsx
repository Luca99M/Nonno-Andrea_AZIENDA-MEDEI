import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { useChat } from "../hooks/useChat";

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

// 🗣️ MAPPATURA PERSONALIZZATA PER BLEND SHAPES
// Ogni fonema (A-X) viene mappato a combinazioni di jawOpen, mouthWide, mouthPucker
const blendShapeMapping = {
  A: { jawOpen: 0.2, mouthWide: 0, mouthPucker: 0.8 },    // P, B, M - bocca chiusa/arrotondata
  B: { jawOpen: 0.3, mouthWide: 0.2, mouthPucker: 0 },    // K, G - bocca semiaperta
  C: { jawOpen: 0.2, mouthWide: 0.9, mouthPucker: 0 },    // I, Y - bocca larga (sorriso)
  D: { jawOpen: 0.9, mouthWide: 0.5, mouthPucker: 0 },    // A - bocca molto aperta
  E: { jawOpen: 0.4, mouthWide: 0, mouthPucker: 0.7 },    // O - bocca rotonda media
  F: { jawOpen: 0.1, mouthWide: 0, mouthPucker: 0.9 },    // U - bocca molto stretta
  G: { jawOpen: 0.2, mouthWide: 0.4, mouthPucker: 0 },    // F, V - labbra sui denti
  H: { jawOpen: 0.5, mouthWide: 0.3, mouthPucker: 0 },    // TH - lingua tra denti
  X: { jawOpen: 0, mouthWide: 0, mouthPucker: 0 },        // Silenzio - bocca chiusa
};

let setupMode = false;

export function Avatar(props) {
  // ✅ CARICA PRIMA IL MODELLO
  const { scene } = useGLTF("/models/NonnoAndrea.glb");

  const { message, onMessagePlayed, chat } = useChat();
  const [lipsync, setLipsync] = useState();

  // ✅ CARICA LE ANIMAZIONI (PRIMA DI USARLE!)
  const { animations } = useGLTF("/models/Animazioni.glb");

  const group = useRef();
  const { actions, mixer } = useAnimations(animations, group);
  
  // ✅ ORA POSSIAMO USARE 'animations' perché è già stato dichiarato sopra
  const [animation, setAnimation] = useState("Standing Idle");

  // DEBUG: Mostra animazioni disponibili + FIX TRASPARENZA
  useEffect(() => {
    console.log("=== 🔍 NONNO ANDREA - DEBUG ===");
    
    const meshes = [];
    
    // LOG DI TUTTI I MESH PER TROVARE OCCHIALI E BAFFI
    console.log("\n📦 TUTTI I MESH NEL MODELLO:");
    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        console.log(`  - ${child.name} (tipo: ${child.type})`);
      }
    });
    console.log("\n");
    
    scene.traverse((child) => {
      // FIX TRASPARENZA E MATERIALI
      if (child.isMesh || child.isSkinnedMesh) {
        // Forza materiali opachi e double-sided
        if (child.material) {
          child.material.transparent = false;
          child.material.opacity = 1;
          child.material.alphaTest = 0;
          child.material.side = THREE.DoubleSide; // Renderizza entrambi i lati
          child.material.depthWrite = true;
          child.material.depthTest = true;
          child.material.needsUpdate = true;
        }
        
        // Casting ombre
        child.castShadow = true;
        child.receiveShadow = true;
      }
      
      // Raccolta morph targets
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        meshes.push(child);
        console.log(`📦 Mesh con morph targets: ${child.name}`);
        
        const morphTargets = Object.keys(child.morphTargetDictionary);
        console.log(`🎭 Morph targets disponibili (${morphTargets.length}):`, morphTargets);
        
        // VERIFICA BLEND SHAPES PER LIP SYNC
        const hasJawOpen = morphTargets.includes("jawOpen");
        const hasMouthWide = morphTargets.includes("mouthWide");
        const hasMouthPucker = morphTargets.includes("mouthPucker");
        
        console.log(`\n🗣️ BLEND SHAPES LIP SYNC:`);
        console.log(`  ${hasJawOpen ? '✅' : '❌'} jawOpen`);
        console.log(`  ${hasMouthWide ? '✅' : '❌'} mouthWide`);
        console.log(`  ${hasMouthPucker ? '✅' : '❌'} mouthPucker`);
        
        if (!hasJawOpen || !hasMouthWide || !hasMouthPucker) {
          console.warn(`⚠️ ATTENZIONE: Mancano alcuni blend shapes per il lip sync!`);
        } else {
          console.log(`✅ Tutti i blend shapes per lip sync sono presenti!`);
        }
      }
    });
    
    setMorphTargetMeshes(meshes);
    
    console.log(`\n🎬 Animazioni trovate (${animations.length}):`);
    animations.forEach((anim, i) => {
      console.log(`  ${i + 1}. "${anim.name}"`);
    });
    
    console.log("=== ✅ DEBUG COMPLETATO ===\n");
  }, [scene, animations]);

  useEffect(() => {
    console.log(message);
    if (!message) {
      setAnimation("Standing Idle");
      return;
    }
    
    // 🛡️ VERIFICA CHE L'ANIMAZIONE RICHIESTA ESISTA
    const requestedAnimation = message.animation;
    const animationExists = animations.find((a) => a.name === requestedAnimation);
    
    if (!animationExists) {
      console.warn(`⚠️ Animazione "${requestedAnimation}" richiesta dal backend non trovata!`);
      console.log("🎬 Animazioni disponibili:", animations.map(a => a.name));
      // Usa Standing Idle come fallback
      setAnimation("Standing Idle");
    } else {
      setAnimation(message.animation);
    }
    
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
  }, [message, animations]);

  useEffect(() => {
    // 🛡️ CONTROLLO DI SICUREZZA: verifica che l'animazione esista
    if (!actions[animation]) {
      console.error(`❌ Animazione "${animation}" non trovata!`);
      console.log("🎬 Animazioni disponibili:", Object.keys(actions));
      return;
    }

    console.log(`✅ Riproduco animazione: "${animation}"`);
    actions[animation]
      .reset()
      .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
      .play();
    return () => {
      if (actions[animation]) {
        actions[animation].fadeOut(0.5);
      }
    };
  }, [animation, actions, mixer]);

  // 🔍 RILEVAMENTO AUTOMATICO MORPH TARGETS
  const [morphTargetMeshes, setMorphTargetMeshes] = useState([]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    morphTargetMeshes.forEach((mesh) => {
      const index = mesh.morphTargetDictionary[target];
      if (index === undefined || mesh.morphTargetInfluences[index] === undefined) {
        return;
      }
      mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
        mesh.morphTargetInfluences[index],
        value,
        speed
      );

      if (!setupMode) {
        try {
          set({ [target]: value });
        } catch (e) {}
      }
    });
  };

  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();
  
  // 🕶️ CONTROLLI ACCESSORI
  const [showGlasses, setShowGlasses] = useState(true);
  const [showMustache, setShowMustache] = useState(true);

  // 👓 GESTIONE VISIBILITÀ ACCESSORI
  useEffect(() => {
    scene.traverse((child) => {
      if (child.name === "Box001") {
        child.visible = showGlasses;
      }
      if (child.name === "Mustache") {
        child.visible = showMustache;
      }
    });
  }, [showGlasses, showMustache, scene]);

  // ASCOLTA EVENTI DAI BOTTONI NELL'UI
  useEffect(() => {
    const handleGlassesToggle = (e) => setShowGlasses(e.detail);
    const handleMustacheToggle = (e) => setShowMustache(e.detail);
    const handlePlayAnimation = (e) => setAnimation(e.detail);

    window.addEventListener('toggleGlasses', handleGlassesToggle);
    window.addEventListener('toggleMustache', handleMustacheToggle);
    window.addEventListener('playAnimation', handlePlayAnimation);

    return () => {
      window.removeEventListener('toggleGlasses', handleGlassesToggle);
      window.removeEventListener('toggleMustache', handleMustacheToggle);
      window.removeEventListener('playAnimation', handlePlayAnimation);
    };
  }, []);

  useFrame(() => {
    if (!setupMode && morphTargetMeshes.length > 0) {
      const referenceMesh = morphTargetMeshes[0];
      
      Object.keys(referenceMesh.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return;
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });
    }

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // 🗣️ LIPSYNC CON BLEND SHAPES PERSONALIZZATI
    if (setupMode) {
      return;
    }

    // Valori target per i blend shapes
    let targetJawOpen = 0;
    let targetMouthWide = 0;
    let targetMouthPucker = 0;

    if (message && lipsync && audio) {
      const currentAudioTime = audio.currentTime;
      
      // Trova il phoneme corrente
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          // Usa la mappatura dei blend shapes invece dei viseme
          const blendShapes = blendShapeMapping[mouthCue.value];
          if (blendShapes) {
            targetJawOpen = blendShapes.jawOpen;
            targetMouthWide = blendShapes.mouthWide;
            targetMouthPucker = blendShapes.mouthPucker;
          }
          break;
        }
      }
    }

    // Applica i blend shapes con interpolazione smooth
    lerpMorphTarget("jawOpen", targetJawOpen, 0.3);
    lerpMorphTarget("mouthWide", targetMouthWide, 0.3);
    lerpMorphTarget("mouthPucker", targetMouthPucker, 0.3);
  });

  useControls("FacialExpressions", {
    chat: button(() => chat()),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      if (morphTargetMeshes.length === 0) {
        console.warn("⚠️ Nessun mesh con morph targets trovato!");
        return;
      }
      
      const emotionValues = {};
      const referenceMesh = morphTargetMeshes[0];
      
      Object.keys(referenceMesh.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return;
        }
        const value =
          referenceMesh.morphTargetInfluences[
            referenceMesh.morphTargetDictionary[key]
          ];
        if (value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  // 🕶️ CONTROLLI ACCESSORI
  useControls("Accessori", {
    "Occhiali 🕶️": {
      value: showGlasses,
      onChange: (value) => setShowGlasses(value),
    },
    "Baffi 👨": {
      value: showMustache,
      onChange: (value) => setShowMustache(value),
    },
  });

  const [, set] = useControls(
    "MorphTarget",
    () => {
      if (morphTargetMeshes.length === 0) return {};
      
      const referenceMesh = morphTargetMeshes[0];
      return Object.assign(
        {},
        ...Object.keys(referenceMesh.morphTargetDictionary).map((key) => {
          return {
            [key]: {
              label: key,
              value: 0,
              min: 0,
              max: 1,
              onChange: (val) => {
                if (setupMode) {
                  lerpMorphTarget(key, val, 1);
                }
              },
            },
          };
        })
      );
    },
    [morphTargetMeshes]
  );

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={scene} />
    </group>
  );
}

// ✅ PRELOAD
useGLTF.preload("/models/NonnoAndrea.glb");
useGLTF.preload("/models/Animazioni.glb");