import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import type { PlaybackCommand, PlaybackState } from "@/components/player/youtubeApi";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { Item, LabelSummary, ViewSelection } from "@/lib/types";

export type LabelMode = "existing" | "new";
export type LibraryFormData = { youtubeUrl: string; title: string; label: string; newLabel: string };

const emptyForm: LibraryFormData = { youtubeUrl: "", title: "", label: "", newLabel: "" };
const err = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;
const fetchItems = (view: ViewSelection) =>
  view.type === "label" ? api.getItems({ label: view.label }) : api.getItems({ view: view.type });

export function useZenLibrary() {
  const { user, logout } = useAuth();
  const [labels, setLabels] = useState<LabelSummary[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeView, setActiveView] = useState<ViewSelection>({ type: "all" });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [autoplayToken, setAutoplayToken] = useState(0);
  const [playbackCommand, setPlaybackCommand] = useState<PlaybackCommand | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopOne, setLoopOne] = useState(false);
  const [loopList, setLoopList] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const [labelMode, setLabelMode] = useState<LabelMode>("new");
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const [savingTitleId, setSavingTitleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LibraryFormData>(emptyForm);
  const labelNames = labels.map((entry) => entry.label);
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const currentItem = items.find((item) => item.id === currentItemId) ?? selectedItem ?? null;
  const currentIndex = currentItem ? items.findIndex((item) => item.id === currentItem.id) : -1;
  const hasManyItems = items.length > 1;
  const canPrevious = hasManyItems && (loopList || currentIndex > 0);
  const canNext = hasManyItems && (loopList || (currentIndex >= 0 && currentIndex < items.length - 1));
  const headerTitle =
    activeView.type === "label" ? activeView.label : activeView.type === "favorites" ? "Favorites" : "All videos";

  useEffect(() => {
    void loadData(activeView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  async function loadData(view: ViewSelection) {
    setIsLoading(true);
    setActionError("");
    try {
      const [nextLabels, nextItems] = await Promise.all([api.getLabels(), fetchItems(view)]);
      const hasSelected = selectedItemId && nextItems.some((item) => item.id === selectedItemId);
      const hasCurrent = currentItemId && nextItems.some((item) => item.id === currentItemId);
      setLabels(nextLabels);
      setItems(nextItems);
      setTitleDrafts(Object.fromEntries(nextItems.map((item) => [item.id, item.title])));
      setFormData((current) => ({
        ...current,
        label: nextLabels.some((entry) => entry.label === current.label) ? current.label : nextLabels[0]?.label ?? "",
      }));
      setLabelMode((mode) => (nextLabels.length ? mode : "new"));
      if (view.type === "label" && !nextLabels.some((entry) => entry.label === view.label)) {
        setActiveView({ type: "all" });
        setRenameDraft("");
      } else {
        setRenameDraft(view.type === "label" ? view.label : "");
      }
      setSelectedItemId(nextItems.length ? (hasSelected ? selectedItemId : nextItems[0].id) : null);
      setCurrentItemId(hasCurrent ? currentItemId : null);
      if (!nextItems.length) setIsPlaying(false);
    } catch (error) {
      setActionError(err(error, "Unable to load your library."));
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshCurrentView() {
    await loadData(activeView);
  }

  async function saveChange(work: () => Promise<unknown>, fallback: string) {
    setActionError("");
    try {
      await work();
      await refreshCurrentView();
    } catch (error) {
      setActionError(err(error, fallback));
    }
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setIsSaving(true);
    try {
      const label = labelMode === "new" ? formData.newLabel.trim() : formData.label.trim();
      await api.createItem({ youtubeUrl: formData.youtubeUrl, title: formData.title, label });
      setFormData((current) => ({ ...current, youtubeUrl: "", title: "", newLabel: labelMode === "new" ? "" : current.newLabel }));
      if (labelMode === "new") setActiveView({ type: "label", label });
      else await refreshCurrentView();
    } catch (error) {
      setActionError(err(error, "Unable to save this video."));
    } finally {
      setIsSaving(false);
    }
  }

  async function updateTitle(itemId: string) {
    const title = titleDrafts[itemId]?.trim();
    if (!title) return setActionError("Title is required.");
    setActionError("");
    setSavingTitleId(itemId);
    try {
      await api.updateItem(itemId, { title });
      await refreshCurrentView();
    } catch (error) {
      setActionError(err(error, "Unable to update this title."));
    } finally {
      setSavingTitleId(null);
    }
  }

  async function renameLabel() {
    if (activeView.type !== "label") return;
    setActionError("");
    try {
      const label = renameDraft.trim();
      await api.renameLabel(activeView.label, label);
      setActiveView({ type: "label", label });
    } catch (error) {
      setActionError(err(error, "Unable to rename this playlist."));
    }
  }

  function playItem(item: Item) {
    setSelectedItemId(item.id);
    setCurrentItemId(item.id);
    setIsPlaying(true);
    setPlaybackCommand((current) => ({ action: "play", id: (current?.id ?? 0) + 1 }));
    setAutoplayToken((current) => current + 1);
  }

  function movePlayback(direction: -1 | 1) {
    if (!items.length) return;
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = baseIndex + direction;
    if (items[nextIndex]) return playItem(items[nextIndex]);
    if (loopList) playItem(direction < 0 ? items[items.length - 1] : items[0]);
  }

  function togglePlayback() {
    const target = currentItem ?? selectedItem ?? items[0];
    if (!target) return;
    if (!currentItemId) return playItem(target);
    const action = isPlaying ? "pause" : "play";
    setIsPlaying(!isPlaying);
    setPlaybackCommand((current) => ({ action, id: (current?.id ?? 0) + 1 }));
  }

  function handlePlaybackStateChange(state: PlaybackState) {
    setIsPlaying(state === "playing");
  }

  function videoEnded() {
    if (!currentItem || !items.length) return;
    if (loopOne) {
      setIsPlaying(true);
      return setAutoplayToken((current) => current + 1);
    }
    const next = items[items.findIndex((item) => item.id === currentItem.id) + 1];
    if (next) return playItem(next);
    if (loopList) return playItem(items[0]);
    setIsPlaying(false);
    setCurrentItemId(null);
  }

  return {
    user, labels, items, activeView, setActiveView, setSelectedItemId, headerTitle,
    labelNames, selectedItem, currentItem, autoplayToken, playbackCommand, isPlaying,
    canPrevious, canNext, loopOne, setLoopOne, loopList, setLoopList, isLoading,
    isSaving, actionError, renameDraft, setRenameDraft, labelMode, setLabelMode,
    titleDrafts, setTitleDrafts, savingTitleId, formData, setFormData, createItem, updateTitle, renameLabel,
    playItem, videoEnded, togglePlayback, handlePlaybackStateChange, logout,
    toggleFavorite: (item: Item) => saveChange(() => api.updateItem(item.id, { isFavorite: !item.isFavorite }), "Unable to update favorites."),
    moveItem: (itemId: string, label: string) => saveChange(() => api.updateItem(itemId, { label }), "Unable to move this video."),
    deleteItem: (itemId: string) => saveChange(() => api.deleteItem(itemId), "Unable to delete this video."),
    playPrevious: () => movePlayback(-1),
    playNext: () => movePlayback(1),
    prepareNewLabel: () => { setLabelMode("new"); setFormData((current) => ({ ...current, newLabel: `Playlist ${labels.length + 1}` })); },
  };
}
