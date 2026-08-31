"use client";

import React from "react";
import { EditorProvider } from "@/context/EditorContext";
import { MainPage } from "@/components/pages/editor/MainPage";

export default function Page() {
  return (
    <EditorProvider>
      <MainPage />
    </EditorProvider>
  );
}
