import type { Metadata } from "next";
import { PhotosRunner } from "./PhotosRunner";
import { photoTotal } from "@/lib/add-photos";

export const metadata: Metadata = { title: "Add photos", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Add photos to the new trips</h1>
      <p className="mt-4 text-muted">
        {photoTotal} free-licence photos from Wikimedia Commons for the new trips and destinations. Each photo shows the
        photographer&apos;s credit, as its licence requires (also listed on the Photo credits page).
      </p>
      <PhotosRunner total={photoTotal} />
    </main>
  );
}
