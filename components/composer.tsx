"use client";

import { ImageIcon, Video, X } from "@/components/icons";
import Image from "next/image";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { type FeedMode, useCreatePost } from "@/hooks/useFeed";

type ComposerProps = {
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
};

function tabClassName(active: boolean) {
  return [
    "border-b-2 px-1 pb-2 text-sm transition",
    active ? "border-accent font-medium text-slate-100" : "border-transparent text-muted hover:text-slate-200",
  ].join(" ");
}

export function Composer({ feedMode, onFeedModeChange }: ComposerProps) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [composerNotice, setComposerNotice] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const { user, signIn } = useAuth();
  const mutation = useCreatePost();

  const clearAttachments = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const onPickImage = () => {
    setComposerNotice("");
    imageInputRef.current?.click();
  };

  const onPickVideo = () => {
    setComposerNotice("");
    videoInputRef.current?.click();
  };

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setSelectedVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";

    if (file) {
      setComposerNotice("Image selected. Media publishing is not enabled yet.");
    } else {
      setComposerNotice("");
    }
  };

  const onVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedVideo(file);
    setSelectedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";

    if (file) {
      setComposerNotice("Video selected. Media publishing is not enabled yet.");
    } else {
      setComposerNotice("");
    }
  };

  const onSubmit = async () => {
    if (!text.trim() && !selectedImage && !selectedVideo) return;

    if (!user) {
      await signIn();
      return;
    }

    if (selectedImage || selectedVideo) {
      setComposerNotice("Text posting works. Media publishing is not wired yet.");
      return;
    }

    await mutation.mutateAsync({ publicKey: user.publicKey, body: text.trim() });
    setText("");
    setComposerNotice("");
    clearAttachments();
  };

  return (
    <section className="border-b border-border">
      <div className="flex gap-3 px-5 py-4">
        <div className="pt-1">
          {user?.profilePic ? (
            <Image
              src={user.profilePic}
              alt={user.username || "profile"}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full border border-border bg-panel" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What's happening on DeSo?"
            className="min-h-24 w-full resize-y rounded-xl border border-border bg-panel p-3 text-sm outline-none"
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={onVideoChange}
          />

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Upload image"
                title="Upload image"
                onClick={onPickImage}
                className="rounded-md p-2 text-muted transition hover:bg-slate-900 hover:text-slate-200"
              >
                <ImageIcon size={16} />
              </button>

              <button
                type="button"
                aria-label="Upload video"
                title="Upload video"
                onClick={onPickVideo}
                className="rounded-md p-2 text-muted transition hover:bg-slate-900 hover:text-slate-200"
              >
                <Video size={16} />
              </button>

              {selectedImage || selectedVideo ? (
                <button
                  type="button"
                  aria-label="Clear attachment"
                  title="Clear attachment"
                  onClick={clearAttachments}
                  className="rounded-md p-2 text-muted transition hover:bg-slate-900 hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <button
              onClick={() => void onSubmit()}
              disabled={mutation.isPending || (!text.trim() && !selectedImage && !selectedVideo)}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {user ? "Post" : "Sign in to post"}
            </button>
          </div>

          {selectedImage ? (
            <div className="mt-3 rounded-xl border border-border bg-panel px-3 py-2 text-xs text-muted">
              image selected: <span className="text-slate-100">{selectedImage.name}</span>
            </div>
          ) : null}

          {selectedVideo ? (
            <div className="mt-3 rounded-xl border border-border bg-panel px-3 py-2 text-xs text-muted">
              video selected: <span className="text-slate-100">{selectedVideo.name}</span>
            </div>
          ) : null}

          <div className="mt-2 text-xs text-red-300">
            {mutation.isError
              ? "Failed to publish. Try again."
              : mutation.isSuccess
              ? "Posted successfully."
              : composerNotice}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-t border-border px-5 py-2 text-sm">
        <button type="button" className={tabClassName(feedMode === "following")} onClick={() => onFeedModeChange("following")}>
          Following
        </button>
        <button type="button" className={tabClassName(feedMode === "hot")} onClick={() => onFeedModeChange("hot")}>
          Hot
        </button>
        <button type="button" className={tabClassName(feedMode === "core")} onClick={() => onFeedModeChange("core")}>
          Core
        </button>
      </div>
    </section>
  );
}
