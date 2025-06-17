"use client";

import { useInfoWebsite } from "@/modules/client/common/hooks/useInfoWebsite";

export default function Favicon() {
  const { contact } = useInfoWebsite();
  return <link rel="icon" href={contact?.favicon} sizes="any" />;
}
