import { Skeleton } from "@/components/ui/skeleton";
import { ToolButton } from "./tool-button";
import VoiceButton from "./voice-button";
import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  TypeIcon,
  Undo2,
  PenLine,
} from "lucide-react";
import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import { useEffect, useState } from "react";
import { useSelf } from "@/liveblocks.config";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  penSize: number;
  setPenSize: (size: number) => void;
}

const Toolbar = ({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canUndo,
  canRedo,
  penSize,
  setPenSize,
}: ToolbarProps) => {
  const selection = useSelf((me) => me.presence.selection);
  const [showPenSize, setShowPenSize] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selection?.length > 0) return;
      switch (e.key) {
        case "a":
          if (e.ctrlKey) setCanvasState({ mode: CanvasMode.None });
          break;
        case "t":
          if (e.ctrlKey)
            setCanvasState({
              layerType: LayerType.Text,
              mode: CanvasMode.Inserting,
            });
          break;
        case "n":
          if (e.ctrlKey)
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            });
          break;
        case "r":
          if (e.ctrlKey)
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            });
          break;
        case "e":
          if (e.ctrlKey)
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            });
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selection, setCanvasState]);

  return (
    <div>
      <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
        {/* Drawing tools */}
        <div className="bg-white rounded-md p-1.5 flex gap-1 flex-col items-center shadow-md">
          <ToolButton
            label="Select (Ctrl+A)"
            icon={MousePointer2}
            onClick={() => setCanvasState({ mode: CanvasMode.None })}
            isActive={
              canvasState.mode === CanvasMode.None ||
              canvasState.mode === CanvasMode.Translating ||
              canvasState.mode === CanvasMode.SelectionNet ||
              canvasState.mode === CanvasMode.Pressing ||
              canvasState.mode === CanvasMode.Resizing
            }
          />
          <ToolButton
            label="Text (Ctrl+T)"
            icon={TypeIcon}
            onClick={() =>
              setCanvasState({
                layerType: LayerType.Text,
                mode: CanvasMode.Inserting,
              })
            }
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Text
            }
          />
          <ToolButton
            label="Sticky Note (Ctrl+N)"
            icon={StickyNote}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Note,
              })
            }
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Note
            }
          />
          <ToolButton
            label="Rectangle (Ctrl+R)"
            icon={Square}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Rectangle,
              })
            }
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Rectangle
            }
          />
          <ToolButton
            label="Ellipse (Ctrl+E)"
            icon={Circle}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Ellipse,
              })
            }
            isActive={
              canvasState.mode === CanvasMode.Inserting &&
              canvasState.layerType === LayerType.Ellipse
            }
          />
          <ToolButton
            label="Pen"
            icon={Pencil}
            onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
            isActive={canvasState.mode === CanvasMode.Pencil}
          />
        </div>

        {/* Undo/Redo */}
        <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
          <ToolButton
            label="Undo (Ctrl+Z)"
            icon={Undo2}
            onClick={undo}
            isDisabled={!canUndo}
          />
          <ToolButton
            label="Redo (Ctrl+Shift+Z)"
            icon={Redo2}
            onClick={redo}
            isDisabled={!canRedo}
          />
        </div>

        {/* Voice */}
        <div className="bg-white rounded-md p-2 flex flex-col items-center shadow-md">
          <VoiceButton
            canvasState={canvasState}
            setCanvasState={setCanvasState}
          />
        </div>

        {/* Pen Size Toggle + Controls */}
        <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md relative">
          <button
            onClick={() => setShowPenSize((prev) => !prev)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
            title="Set Pen Size"
          >
            <PenLine className="w-4 h-4" />
          </button>

          <div
            className={`absolute top-10 flex items-center gap-1 transition-opacity duration-200 ${
              showPenSize ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <button
              onClick={() => setPenSize(Math.max(penSize - 1, 1))}
              className="w-6 h-6 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              −
            </button>
            <span className="text-sm w-6 text-center">{penSize}</span>
            <button
              onClick={() => setPenSize(Math.min(penSize + 1, 20))}
              className="w-6 h-6 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 rounded-md animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] h-[360px] w-[52px]">
      <Skeleton />
    </div>
  );
};

export default Toolbar;
