import { PanelResizeHandle } from "react-resizable-panels";

export default function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-2 transition-colors hover:bg-muted/50">
      <div className="h-full w-[1px] bg-border mx-auto" />
    </PanelResizeHandle>
  );
}