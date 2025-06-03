"use client";

import Tesseract from 'tesseract.js';

import { memo } from "react";
import { useRef } from "react";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color, LayerType } from "@/types/canvas";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { BringToFrontIcon, SendToBackIcon } from "@/components/icon";
import { ColorPicker } from "./color-picker";
import { Copy, Trash2 } from "lucide-react";
import { LiveObject } from "@liveblocks/client";
import { TextLayer } from "@/types/canvas"; // Import correct types
import { Base64 } from "convex/values";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
  onDuplicate: () => void;
  lastUsedColor: Color;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const SelectionTools = memo(
  ({
    camera,
    setLastUsedColor,
    onDuplicate,
    lastUsedColor,
    svgRef,
  }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);
    const deleteLayers = useDeleteLayers();
    const selectionBounds = useSelectionBounds();

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];
        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            arr.length - 1 - (indices.length - 1 - i)
          );
        }
      },
      [selection]
    );

    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];
        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        for (let i = 0; i < indices.length; i++) {
          liveLayerIds.move(indices[i], i);
        }
      },
      [selection]
    );

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);
        if (!selection) return;
        selection.forEach((id: any) => liveLayers.get(id)?.set("fill", fill));
      },
      [selection, setLastUsedColor]
    );

//   const createTextLayerMutation = useMutation(
//   ({ storage }, newTextLayer: Omit<TextLayer, "type">) => {
//     const liveLayers = storage.get("layers");
//     const id = Date.now().toString();

//     liveLayers.set(
//       id,
//       new LiveObject<TextLayer>({
//         type: LayerType.Text,
//         x: newTextLayer.x,
//         y: newTextLayer.y,
//         width: newTextLayer.width,
//         height: newTextLayer.height,
//         fill: newTextLayer.fill,
//         value: newTextLayer.value,
//       })
//     );
//   },
//   []
// );

// const addPredefinedTextLayer = useMutation(
//   ({ storage }) => {
//     const liveLayers = storage.get("layers");

//     const id = Date.now().toString(); // Or use uuid()
    
//     const textLayer = new LiveObject<TextLayer>({
//       type: LayerType.Text,
//       x: 227,
//       y: 894,
//       width: 193,
//       height: 100,
//       fill: { r: 0, g: 0, b: 0 }, // Black color
//       value: "Hello from IntelliSketch!", // Your predefined text
//     });

//     liveLayers.set(id, textLayer);
//   },
//   []
// );

// const insertPredefinedText = useMutation(({ storage }) => {
//   const liveLayers = storage.get("layers");
//   const layerIds = storage.get("layerIds");

//   const id = Date.now().toString();

//   const textLayer: TextLayer = {
//     type: LayerType.Text,
//     x: 328,
//     y: 943,
//     width: 329,
//     height: 100,
//     fill: { r: 0, g: 0, b: 1 },
//     value: "Predefined Text",
//   };

//   liveLayers.set(id, new LiveObject(textLayer));
//   layerIds.push(id); // ✅ important
// }, []);

const replaceWithRecognizedText = useMutation(
  (
    { storage, self },
    recognizedText: string,
    bounds: { x: number; y: number; width: number; height: number }
  ) => {
    const { x, y, width, height } = bounds;
    const liveLayers = storage.get("layers");
    const layerIds = storage.get("layerIds");
    const selection = self.presence.selection;

    // Delete the existing selected handwritten layers
    selection.forEach((id: string) => {
      liveLayers.delete(id);
    });

    // Create new recognized text layer
    const id = Date.now().toString();
    const textLayer: TextLayer = {
      type: LayerType.Text,
      x,
      y,
      width,
      height,
      fill: { r: 0, g: 0, b: 0 }, // You can change this or use lastUsedColor
      value: recognizedText,
    };

    liveLayers.set(id, new LiveObject(textLayer));
    layerIds.push(id);
  },
  []
);



    // const getHandwrittenText = async (imageUrl: string) => {
    //   const res = await fetch("/api/recognize-text", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ Base64 : imageUrl }),
    //   });

    //   const data = await res.json();
    //   return data.text;
    // };


const recognizeHandwriting = async (image : string) => {
  const result = await Tesseract.recognize(
    image, // image path or base64 string
    'eng', // language
    {
      logger: (m) => console.log(m), // optional: to monitor progress
    }
  );

  return result.data.text;
};


//     const handleExport = async () => {
//       if (!selectionBounds || !svgRef.current) return;

//       const { x, y, width, height } = selectionBounds;
//       console.log("Selection Bounds:", selectionBounds);
//       const selectedElements = svgRef.current.querySelectorAll('[data-selected="true"]');
//       if (selectedElements.length === 0) return;

//       const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//       svg.setAttribute("width", width.toString());
//       svg.setAttribute("height", height.toString());
//       svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);

//       selectedElements.forEach((el) => {
//         svg.appendChild(el.cloneNode(true));
//       });

//       const svgData = new XMLSerializer().serializeToString(svg);
//       const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
//       const url = URL.createObjectURL(svgBlob);

//       const image = new Image();
//       image.onload = async () => {
//         const canvas = document.createElement("canvas");
//         canvas.width = width * 2;
//         canvas.height = height * 2;

//         const ctx = canvas.getContext("2d");
//         if (!ctx) return;

//         ctx.scale(2, 2);
//         ctx.drawImage(image, 0, 0);

//         const imgDataUrl = canvas.toDataURL("image/png");
//         const pureBase64 = imgDataUrl.replace(/^data:image\/\w+;base64,/, "");

//         const rawText = await getHandwrittenText(pureBase64);
//         const cleanedText = rawText.trim().replace(/\s+/g, " ");

// //         await createTextLayerMutation({
// //           x,
// //           y,
// //           width,
// //           height,
// // fill: { r: 0, g: 0, b: 255 } , // Color object

// //           value: "cleanedText",
// //         });

//        // alert("Recognized Text:\n" + cleanedText);
//        insertPredefinedText();
//       };

//       image.src = url;
//     };

// async function uploadToImgBB(base64Image : string): Promise<string> {
//   const apiKey = "3560894b34a51e29267595fe945205e8"; // replace with your real key

//   const formData = new FormData();
//   formData.append("key", apiKey);
//   formData.append("image", base64Image);

//   const response = await fetch("/api/recognize-text", {
//     method: "POST",
//     body: formData,
//   });

//   const data = await response.json();
//   if (data.success) {
//     console.log("Image uploaded successfully!");
//     console.log("Public URL:", data.data.url);
//     return data.data.url;  // this is the publicly accessible image URL
//   } else {
//     console.error("Upload failed:", data);
//     throw new Error("Upload failed");
//   }
// }



const handleExport = async () => {
  if (!selectionBounds || !svgRef.current) return;

  const { x, y, width, height } = selectionBounds;
  const selectedElements = svgRef.current.querySelectorAll('[data-selected="true"]');
  if (selectedElements.length === 0) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());
  svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);

  selectedElements.forEach((el) => {
    svg.appendChild(el.cloneNode(true));
  });

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.drawImage(image, 0, 0);

    const imgDataUrl = canvas.toDataURL("image/png");
    //const base64Image = imgDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const base64Image = "data:image/png;base64," + imgDataUrl;

//     //console.log("Base64 Image Data:", pureBase64);
// uploadToImgBB(base64Image)
//   .then(url => {
//     console.log("Public image URL:", url);
//     // Now you can send this URL to OpenAI or anywhere else
//   })
//   .catch(console.error);
   const rawText = await recognizeHandwriting(imgDataUrl);;
    const cleanedText = rawText?.trim().replace(/\s+/g, " ");

    replaceWithRecognizedText(rawText, { x, y, width, height });

// try {
//       // Step 1: Upload to imgbb
//       const publicImageUrl = await uploadToImgBB(base64Image);
//       console.log("Public image URL:", publicImageUrl);

//       // Step 2: Send to OpenAI
//       const rawText = await getHandwrittenText(publicImageUrl);
//       const cleanedText = rawText?.trim().replace(/\s+/g, " ");

//       // Step 3: Replace in canvas
//       replaceWithRecognizedText(cleanedText, { x, y, width, height });
//     } catch (err) {
//       console.error("Failed to process image:", err);
//     }
  };

  image.src = url;
};


    if (!selectionBounds) return null;

    const xPos = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const yPos = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{
          transform: `translate(calc(${xPos}px - 50%), calc(${yPos - 16}px - 100%))`,
        }}
      >
        <ColorPicker onChange={setFill} lastUsedColor={lastUsedColor} />
        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to front">
            <Button onClick={moveToFront} variant="board" size="icon">
              <BringToFrontIcon color="black" height={30} width={30} />
            </Button>
          </Hint>
          <Hint label="Send to back" side="bottom">
            <Button onClick={moveToBack} variant="board" size="icon">
              <SendToBackIcon color="black" height={30} width={30} />
            </Button>
          </Hint>
        </div>
        <div className="flex flex-col items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label="Convert to Text">
            <Button variant="board" size="icon" onClick={handleExport}>
              📝
            </Button>
          </Hint>
          <Hint label="Duplicate (ctrl + D)">
            <Button onClick={onDuplicate} variant="board" size="icon">
              <Copy />
            </Button>
          </Hint>
          <Hint label="Delete" side="bottom">
            <Button
              variant="boardDestructive"
              size="icon"
              onClick={deleteLayers}
            >
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
