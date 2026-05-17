import { useEffect, useState, type FormEvent } from "react";
import {
  Check,
  Heart,
  ListVideo,
  LogOut,
  Pencil,
  Play,
  Plus,
  Repeat,
  Rows3,
  Trash2,
} from "lucide-react";

import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Item, LabelSummary, ViewSelection } from "@/lib/types";

const shellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_18%),linear-gradient(180deg,#fff8f1_0%,#f4f1eb_48%,#efece6_100%)]";
const cardClassName =
  "rounded-[28px] border border-stone-200/70 bg-white/85 shadow-[0_24px_70px_rgba(120,113,108,0.12)] backdrop-blur";
const softButtonClassName =
  "border-stone-200/80 bg-white/80 text-stone-900 hover:bg-stone-100";
const fieldClassName =
  "h-11 w-full rounded-2xl border border-stone-200 bg-white/90 px-4 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

const Home = () => {
  const { user, logout } = useAuth();
  const [labels, setLabels] = useState<LabelSummary[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeView, setActiveView] = useState<ViewSelection>({ type: "all" });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [autoplayToken, setAutoplayToken] = useState(0);
  const [loopOne, setLoopOne] = useState(false);
  const [loopList, setLoopList] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const [labelMode, setLabelMode] = useState<"existing" | "new">("new");
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const [savingTitleId, setSavingTitleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    youtubeUrl: "",
    title: "",
    label: "",
    newLabel: "",
  });

  const labelNames = labels.map((entry) => entry.label);
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const currentItem =
    items.find((item) => item.id === currentItemId) ?? selectedItem ?? null;

  useEffect(() => {
    void loadData(activeView);
    // We intentionally refetch when the selected view changes, not when local drafts change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  async function loadData(view: ViewSelection) {
    setIsLoading(true);
    setActionError("");

    try {
      const [labelsResponse, itemsResponse] = await Promise.all([
        api.getLabels(),
        view.type === "label"
          ? api.getItems({ label: view.label })
          : view.type === "favorites"
            ? api.getItems({ view: "favorites" })
            : api.getItems({ view: "all" }),
      ]);

      setLabels(labelsResponse);
      setItems(itemsResponse);
      setTitleDrafts(
        Object.fromEntries(itemsResponse.map((item) => [item.id, item.title])),
      );

      if (labelsResponse.length === 0) {
        setLabelMode("new");
        setFormData((current) => ({ ...current, label: "" }));
      } else {
        setFormData((current) => ({
          ...current,
          label:
            current.label && labelsResponse.some((entry) => entry.label === current.label)
              ? current.label
              : labelsResponse[0].label,
        }));
      }

      if (view.type === "label" && !labelsResponse.some((entry) => entry.label === view.label)) {
        setActiveView({ type: "all" });
        setRenameDraft("");
      } else {
        setRenameDraft(view.type === "label" ? view.label : "");
      }

      if (itemsResponse.length === 0) {
        setSelectedItemId(null);
        setCurrentItemId(null);
      } else {
        const nextSelectedItemId =
          selectedItemId && itemsResponse.some((item) => item.id === selectedItemId)
            ? selectedItemId
            : itemsResponse[0].id;
        const nextCurrentItemId =
          currentItemId && itemsResponse.some((item) => item.id === currentItemId)
            ? currentItemId
            : null;

        setSelectedItemId(nextSelectedItemId);
        setCurrentItemId(nextCurrentItemId);
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to load your library right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshCurrentView() {
    await loadData(activeView);
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setIsSaving(true);

    try {
      const label =
        labelMode === "new" ? formData.newLabel.trim() : formData.label.trim();

      await api.createItem({
        youtubeUrl: formData.youtubeUrl,
        title: formData.title,
        label,
      });

      setFormData((current) => ({
        ...current,
        youtubeUrl: "",
        title: "",
        newLabel: labelMode === "new" ? "" : current.newLabel,
      }));

      if (labelMode === "new") {
        setActiveView({ type: "label", label });
      } else {
        await refreshCurrentView();
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "Unable to save this video.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleFavorite(item: Item) {
    setActionError("");

    try {
      await api.updateItem(item.id, { isFavorite: !item.isFavorite });
      await refreshCurrentView();
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to update favorites right now.",
      );
    }
  }

  async function handleMoveItem(itemId: string, label: string) {
    setActionError("");

    try {
      await api.updateItem(itemId, { label });
      await refreshCurrentView();
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to move this video right now.",
      );
    }
  }

  async function handleUpdateTitle(itemId: string) {
    const nextTitle = titleDrafts[itemId]?.trim();
    if (!nextTitle) {
      setActionError("Title is required.");
      return;
    }

    setActionError("");
    setSavingTitleId(itemId);

    try {
      await api.updateItem(itemId, { title: nextTitle });
      await refreshCurrentView();
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to update this title right now.",
      );
    } finally {
      setSavingTitleId(null);
    }
  }

  async function handleDeleteItem(itemId: string) {
    setActionError("");

    try {
      await api.deleteItem(itemId);
      await refreshCurrentView();
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to delete this video right now.",
      );
    }
  }

  async function handleRenameLabel() {
    if (activeView.type !== "label") {
      return;
    }

    setActionError("");

    try {
      const nextLabel = renameDraft.trim();
      await api.renameLabel(activeView.label, nextLabel);
      setActiveView({ type: "label", label: nextLabel });
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to rename this playlist right now.",
      );
    }
  }

  async function handleLogout() {
    await logout();
  }

  function handlePlayList() {
    const firstItem = items[0];
    if (!firstItem) {
      return;
    }

    setSelectedItemId(firstItem.id);
    setCurrentItemId(firstItem.id);
    setAutoplayToken((current) => current + 1);
  }

  function handlePlaySelected() {
    if (!selectedItem) {
      return;
    }

    setCurrentItemId(selectedItem.id);
    setAutoplayToken((current) => current + 1);
  }

  function handleVideoEnded() {
    if (!currentItem || items.length === 0) {
      return;
    }

    if (loopOne) {
      setAutoplayToken((current) => current + 1);
      return;
    }

    const currentIndex = items.findIndex((item) => item.id === currentItem.id);
    const nextItem = items[currentIndex + 1];

    if (nextItem) {
      setSelectedItemId(nextItem.id);
      setCurrentItemId(nextItem.id);
      setAutoplayToken((current) => current + 1);
      return;
    }

    if (loopList) {
      setSelectedItemId(items[0].id);
      setCurrentItemId(items[0].id);
      setAutoplayToken((current) => current + 1);
      return;
    }

    setCurrentItemId(null);
  }

  const headerTitle =
    activeView.type === "label"
      ? activeView.label
      : activeView.type === "favorites"
        ? "Favorites"
        : "All videos";

  return (
    <div className={shellClassName}>
      <div className="grid min-h-screen xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="border-b border-stone-200/70 bg-amber-50/60 p-4 backdrop-blur xl:border-r xl:border-b-0 xl:p-6">
          <div className={cn(cardClassName, "grid gap-4 p-5")}>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
              URLVibe
            </span>
            <div className="grid gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                Your looping YouTube library
              </h1>
              <p className="text-sm leading-6 text-stone-600">
                Organize videos by label, keep a favorites lane, and play the
                exact view you are browsing.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5",
                activeView.type === "all"
                  ? "border-amber-400 bg-amber-400 text-stone-950 shadow-sm"
                  : "border-stone-200/80 bg-white/80 text-stone-900 hover:bg-white",
              )}
              onClick={() => setActiveView({ type: "all" })}
              type="button"
            >
              <Rows3 size={18} />
              <span>All</span>
            </button>

            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5",
                activeView.type === "favorites"
                  ? "border-amber-400 bg-amber-400 text-stone-950 shadow-sm"
                  : "border-stone-200/80 bg-white/80 text-stone-900 hover:bg-white",
              )}
              onClick={() => setActiveView({ type: "favorites" })}
              type="button"
            >
              <Heart size={18} />
              <span>Favorites</span>
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between px-1 text-sm font-medium text-stone-600">
              <span>Your playlists</span>
              <Button
                className={cn("rounded-full", softButtonClassName)}
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => {
                  const nextLabel = `Playlist ${labels.length + 1}`;
                  setLabelMode("new");
                  setFormData((current) => ({ ...current, newLabel: nextLabel }));
                }}
              >
                <Plus size={16} />
              </Button>
            </div>

            {labels.length > 0 ? (
              <div className="grid gap-2">
                {labels.map((entry) => (
                  <button
                    key={entry.label}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition hover:-translate-y-0.5",
                      activeView.type === "label" && activeView.label === entry.label
                        ? "border-amber-400 bg-amber-400 text-stone-950 shadow-sm"
                        : "border-stone-200/80 bg-white/80 text-stone-900 hover:bg-white",
                    )}
                    onClick={() => setActiveView({ type: "label", label: entry.label })}
                    type="button"
                  >
                    <ListVideo size={18} />
                    <span>{entry.label}</span>
                    <strong className="ml-auto text-xs font-semibold">
                      {entry.itemCount}
                    </strong>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-4 py-4 text-sm leading-6 text-stone-600">
                Playlists appear after you save your first URL with a label.
              </p>
            )}
          </div>
        </aside>

        <main className="p-4 md:p-6">
          <div className="grid gap-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Signed in as @{user?.username}
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
                  {headerTitle}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-stone-600">
                  {activeView.type === "label"
                    ? "Rename this playlist or update item titles and move videos between labels below."
                    : "Use the form to add a URL, then play one video or loop the whole current view."}
                </p>
              </div>

              <Button
                className={cn("rounded-full", softButtonClassName)}
                type="button"
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Log out
              </Button>
            </header>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
              <div className={cn(cardClassName, "grid gap-5 p-5 md:p-6")}>
                <div className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                    Add video
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                    Save a YouTube URL
                  </h3>
                </div>

                <form className="grid gap-4" onSubmit={handleCreateItem}>
                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    <span>YouTube URL</span>
                    <input
                      className={fieldClassName}
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.youtubeUrl}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          youtubeUrl: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-stone-700">
                    <span>Title</span>
                    <input
                      className={fieldClassName}
                      type="text"
                      placeholder="Peace session, Gym energy, Focus mix..."
                      value={formData.title}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className={cn(
                          "h-11 rounded-2xl",
                          labelMode === "existing"
                            ? "border-amber-400 bg-amber-400 text-stone-950 hover:bg-amber-400/90"
                            : softButtonClassName,
                        )}
                        disabled={labelNames.length === 0}
                        type="button"
                        variant="outline"
                        onClick={() => setLabelMode("existing")}
                      >
                        Existing playlist
                      </Button>
                      <Button
                        className={cn(
                          "h-11 rounded-2xl",
                          labelMode === "new"
                            ? "border-amber-400 bg-amber-400 text-stone-950 hover:bg-amber-400/90"
                            : softButtonClassName,
                        )}
                        type="button"
                        variant="outline"
                        onClick={() => setLabelMode("new")}
                      >
                        New playlist
                      </Button>
                    </div>

                    {labelMode === "existing" && labelNames.length > 0 ? (
                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        <span>Choose playlist</span>
                        <select
                          className={fieldClassName}
                          value={formData.label}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              label: event.target.value,
                            }))
                          }
                        >
                          {labelNames.map((label) => (
                            <option key={label} value={label}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        <span>New playlist label</span>
                        <input
                          className={fieldClassName}
                          type="text"
                          placeholder="Peace, Gym, Goosebumps..."
                          value={formData.newLabel}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              newLabel: event.target.value,
                            }))
                          }
                        />
                      </label>
                    )}
                  </div>

                  <Button className="h-12 rounded-full text-sm font-semibold" disabled={isSaving} type="submit">
                    {isSaving ? "Saving..." : "Save to library"}
                  </Button>
                </form>
              </div>

              <div className={cn(cardClassName, "grid gap-5 p-5 md:p-6")}>
                <div className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                    Player
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                    {currentItem?.title ?? "Select a video"}
                  </h3>
                </div>

                <YouTubePlayer
                  autoplayToken={autoplayToken}
                  onEnded={handleVideoEnded}
                  videoId={currentItem?.youtubeVideoId ?? null}
                />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="h-11 flex-1 rounded-full text-sm font-semibold" type="button" onClick={handlePlaySelected}>
                    <Play size={16} />
                    Play selected
                  </Button>
                  <Button
                    className={cn("h-11 flex-1 rounded-full", softButtonClassName)}
                    type="button"
                    variant="outline"
                    onClick={handlePlayList}
                  >
                    <ListVideo size={16} />
                    Play current view
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    className={cn(
                      "h-11 rounded-2xl",
                      loopOne
                        ? "border-amber-400 bg-amber-400 text-stone-950 hover:bg-amber-400/90"
                        : softButtonClassName,
                    )}
                    type="button"
                    variant="outline"
                    onClick={() => setLoopOne((current) => !current)}
                  >
                    <Repeat size={16} />
                    Loop selected
                  </Button>
                  <Button
                    className={cn(
                      "h-11 rounded-2xl",
                      loopList
                        ? "border-amber-400 bg-amber-400 text-stone-950 hover:bg-amber-400/90"
                        : softButtonClassName,
                    )}
                    type="button"
                    variant="outline"
                    onClick={() => setLoopList((current) => !current)}
                  >
                    <Repeat size={16} />
                    Loop current list
                  </Button>
                </div>
              </div>
            </section>

            <section className={cn(cardClassName, "grid gap-5 p-5 md:p-6")}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                    Current view
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-stone-900">
                    {headerTitle}
                  </h3>
                </div>

                {activeView.type === "label" ? (
                  <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                    <input
                      className={cn(fieldClassName, "xl:w-72")}
                      type="text"
                      value={renameDraft}
                      onChange={(event) => setRenameDraft(event.target.value)}
                    />
                    <Button
                      className={cn("h-11 rounded-full", softButtonClassName)}
                      type="button"
                      variant="outline"
                      onClick={handleRenameLabel}
                    >
                      <Pencil size={16} />
                      Rename playlist
                    </Button>
                  </div>
                ) : null}
              </div>

              {actionError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </p>
              ) : null}

              {isLoading ? (
                <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed border-stone-300 bg-white/50 text-sm font-medium text-stone-600">
                  Loading videos...
                </div>
              ) : items.length === 0 ? (
                <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed border-stone-300 bg-white/50 px-6 text-center text-sm leading-6 text-stone-600">
                  No videos in this view yet. Add a YouTube URL above to get
                  started.
                </div>
              ) : (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className={cn(
                        "rounded-[24px] border p-4 transition",
                        selectedItem?.id === item.id
                          ? "border-amber-400 bg-amber-50/70 shadow-sm"
                          : "border-stone-200 bg-white/70",
                      )}
                    >
                      <button
                        className="grid w-full gap-3 text-left"
                        onClick={() => setSelectedItemId(item.id)}
                        type="button"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="grid gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                              {item.label}
                            </span>
                            <p className="break-all text-sm leading-6 text-stone-600">
                              {item.youtubeUrl}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-stone-500">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>

                      <div className="mt-4 grid gap-4">
                        <div className="flex flex-col gap-3 lg:flex-row">
                          <input
                            className={cn(fieldClassName, "flex-1")}
                            type="text"
                            value={titleDrafts[item.id] ?? item.title}
                            onChange={(event) =>
                              setTitleDrafts((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))
                            }
                          />
                          <Button
                            className={cn("h-11 rounded-full lg:px-5", softButtonClassName)}
                            type="button"
                            variant="outline"
                            onClick={() => handleUpdateTitle(item.id)}
                            disabled={savingTitleId === item.id}
                          >
                            {savingTitleId === item.id ? (
                              "Saving..."
                            ) : (
                              <>
                                <Check size={16} />
                                Save title
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className={cn("rounded-full", softButtonClassName)}
                              size="icon-sm"
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setSelectedItemId(item.id);
                                setCurrentItemId(item.id);
                                setAutoplayToken((current) => current + 1);
                              }}
                            >
                              <Play size={16} />
                            </Button>

                            <Button
                              className={cn(
                                "rounded-full",
                                item.isFavorite
                                  ? "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-100/90"
                                  : softButtonClassName,
                              )}
                              size="icon-sm"
                              type="button"
                              variant="outline"
                              onClick={() => handleToggleFavorite(item)}
                            >
                              <Heart size={16} />
                            </Button>
                          </div>

                          <select
                            className={cn(fieldClassName, "xl:max-w-56")}
                            value={item.label}
                            onChange={(event) => handleMoveItem(item.id, event.target.value)}
                          >
                            {labelNames.map((label) => (
                              <option key={label} value={label}>
                                {label}
                              </option>
                            ))}
                          </select>

                          <Button
                            className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            size="icon-sm"
                            type="button"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
