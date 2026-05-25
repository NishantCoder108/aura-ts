import type { Dispatch, FormEvent, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fieldClass, labelClass, panelClass, primaryButtonClass } from "../styles";
import type { LabelMode, LibraryFormData } from "../hooks/useZenLibrary";

interface AddVideoFormProps {
  formData: LibraryFormData;
  isSaving: boolean;
  labelMode: LabelMode;
  labelNames: string[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setFormData: Dispatch<SetStateAction<LibraryFormData>>;
  setLabelMode: (mode: LabelMode) => void;
}

export function AddVideoForm({
  formData,
  isSaving,
  labelMode,
  labelNames,
  onSubmit,
  setFormData,
  setLabelMode,
}: AddVideoFormProps) {
  const modeClass = (mode: LabelMode) =>
    cn(
      "h-9 flex-1 rounded-full text-sm font-semibold",
      labelMode === mode
        ? "border-white bg-white/80 text-[#312d29]"
        : "border-white/60 bg-white/25 text-[#756d65] hover:bg-white/55",
    );

  return (
    <section className={cn(panelClass, "grid gap-4")}>
      <div>
        <p className="text-xs font-medium text-[#756d65]">Quick capture</p>
        <h2 className="text-xl font-semibold tracking-tight">Save a YouTube room</h2>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <label className={labelClass}>
          <span>YouTube URL</span>
          <input className={fieldClass} placeholder="https://www.youtube.com/watch?v=..." type="url" value={formData.youtubeUrl} onChange={(event) => setFormData((current) => ({ ...current, youtubeUrl: event.target.value }))} />
        </label>
        <label className={labelClass}>
          <span>Title</span>
          <input className={fieldClass} placeholder="Deep focus, rain study, night jazz..." type="text" value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} />
        </label>
        <div className="flex gap-2">
          <Button className={modeClass("existing")} disabled={!labelNames.length} type="button" variant="outline" onClick={() => setLabelMode("existing")}>
            Existing
          </Button>
          <Button className={modeClass("new")} type="button" variant="outline" onClick={() => setLabelMode("new")}>
            New
          </Button>
        </div>
        {labelMode === "existing" && labelNames.length ? (
          <label className={labelClass}>
            <span>Choose playlist</span>
            <select className={fieldClass} value={formData.label} onChange={(event) => setFormData((current) => ({ ...current, label: event.target.value }))}>
              {labelNames.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </label>
        ) : (
          <label className={labelClass}>
            <span>New playlist label</span>
            <input className={fieldClass} placeholder="Focus, Chill, Code..." type="text" value={formData.newLabel} onChange={(event) => setFormData((current) => ({ ...current, newLabel: event.target.value }))} />
          </label>
        )}
        <Button className={primaryButtonClass} disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save to ZenPlay"}
        </Button>
      </form>
    </section>
  );
}
