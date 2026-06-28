"use client";

import dynamic from "next/dynamic";

const ApartmentViewerSection = dynamic(
  () => import("./apartment-viewer-section").then((m) => ({ default: m.ApartmentViewerSection })),
  { ssr: false },
);

export function ApartmentViewerLazy() {
  return <ApartmentViewerSection />;
}
