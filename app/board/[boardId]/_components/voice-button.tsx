import { useState } from 'react';
import useVoiceCommands from '@/hooks/use-voiceCommands';
import { CanvasState as AppCanvasState, CanvasMode, LayerType } from "@/types/canvas";

interface VoiceButtonProps {
  canvasState: AppCanvasState;
  setCanvasState: (newState: AppCanvasState) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ canvasState, setCanvasState }) => {
  const [listening, setListening] = useState<boolean>(false);

  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes("stop")) {
      console.log("Stopping voice commands...");
      setListening(false);  // Stop listening when "stop" command is heard
      return;
    }

    if (lowerCommand.includes("add rectangle")) {
      console.log("Adding a rectangle...");
      setCanvasState({
        mode: CanvasMode.Inserting,
        layerType: LayerType.Rectangle,
      });
    } else if (lowerCommand.includes("draw circle") || lowerCommand.includes("add circle") || lowerCommand.includes("ellipse")) {
      console.log("Drawing a circle/ellipse...");
      setCanvasState({
        mode: CanvasMode.Inserting,
        layerType: LayerType.Ellipse,
      });
    } else if (lowerCommand.includes("add text")) {
      console.log("Adding text...");
      setCanvasState({
        mode: CanvasMode.Inserting,
        layerType: LayerType.Text,
      });
    } else if (lowerCommand.includes("add note") || lowerCommand.includes("sticky note")) {
      console.log("Adding sticky note...");
      setCanvasState({
        mode: CanvasMode.Inserting,
        layerType: LayerType.Note,
      });
    } else if (lowerCommand.includes("pen") || lowerCommand.includes("draw freehand")) {
      console.log("Switching to pencil/pen mode...");
      setCanvasState({
        mode: CanvasMode.Pencil,
      });
    } else if (lowerCommand.includes("select")) {
      console.log("Switching to selection mode...");
      setCanvasState({
        mode: CanvasMode.None,
      });
    } else if (lowerCommand.includes("undo")) {
      console.log("Undoing last action...");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }));
    } else if (lowerCommand.includes("redo")) {
      console.log("Redoing last undone action...");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, shiftKey: true }));
    } else if (lowerCommand.includes("change color to")) {
      const color = lowerCommand.replace("change color to", "").trim();
      console.log(`Changing color to ${color}`);
      // Add color change logic if supported
    } else if (lowerCommand.includes("delete selection")) {
      console.log("Deleting selected layer(s)...");
      // Trigger deletion if you have access to selection delete function
    } else {
      console.log(`Unknown command: ${command}`);
    }
  };

  useVoiceCommands(handleCommand, listening);

  return (
    <button
      className={`p-2 rounded-full ${listening ? 'bg-red-500' : 'bg-gray-300'} text-white`}
      onClick={() => setListening(prev => !prev)}
    >
      {listening ? '🎙️' : '🎤'}
    </button>
  );
};

export default VoiceButton;
