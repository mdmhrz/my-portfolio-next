import { Suspense } from "react";
import { MessagesPageContents } from "@/modules/portfolio/contact/components/MessagesPageContents";

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageContents />
    </Suspense>
  );
}
