import heroArt from "@/assets/hero.png";
import { AddVideoForm } from "@/features/library/components/AddVideoForm";
import { PlayerPanel } from "@/features/library/components/PlayerPanel";
import { VideoLibrary } from "@/features/library/components/VideoLibrary";
import { ZenHeader } from "@/features/library/components/ZenHeader";
import { ambientLayerClass, pageClass, shellClass } from "@/features/library/styles";
import { useZenLibrary } from "@/features/library/hooks/useZenLibrary";

const Home = () => {
  const zen = useZenLibrary();

  return (
    <main className={pageClass}>
      <div className={ambientLayerClass} />
      <img
        src={heroArt}
        alt=""
        className="pointer-events-none fixed right-[-3rem] top-20 hidden w-80 opacity-20 blur-[1px] lg:block"
      />
      <div className={shellClass}>
        <ZenHeader
          activeView={zen.activeView}
          labels={zen.labels}
          onLogout={zen.logout}
          onPrepareNewLabel={zen.prepareNewLabel}
          onViewChange={zen.setActiveView}
          user={zen.user}
        />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <AddVideoForm
            formData={zen.formData}
            isSaving={zen.isSaving}
            labelMode={zen.labelMode}
            labelNames={zen.labelNames}
            onSubmit={zen.createItem}
            setFormData={zen.setFormData}
            setLabelMode={zen.setLabelMode}
          />
          <PlayerPanel
            autoplayToken={zen.autoplayToken}
            currentItem={zen.currentItem}
            loopList={zen.loopList}
            loopOne={zen.loopOne}
            onEnded={zen.videoEnded}
            onPlayList={zen.playList}
            onPlaySelected={zen.playSelected}
            setLoopList={zen.setLoopList}
            setLoopOne={zen.setLoopOne}
          />
        </section>

        <VideoLibrary
          actionError={zen.actionError}
          activeView={zen.activeView}
          headerTitle={zen.headerTitle}
          isLoading={zen.isLoading}
          items={zen.items}
          labelNames={zen.labelNames}
          onDelete={zen.deleteItem}
          onMove={zen.moveItem}
          onPlay={zen.playItem}
          onRename={zen.renameLabel}
          onSelect={zen.setSelectedItemId}
          onToggleFavorite={zen.toggleFavorite}
          onUpdateTitle={zen.updateTitle}
          renameDraft={zen.renameDraft}
          savingTitleId={zen.savingTitleId}
          selectedItem={zen.selectedItem}
          setRenameDraft={zen.setRenameDraft}
          setTitleDrafts={zen.setTitleDrafts}
          titleDrafts={zen.titleDrafts}
        />
      </div>
    </main>
  );
};

export default Home;
