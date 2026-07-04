import { Suspense } from "react";
import { MessagesPageContents } from "./_components/MessagesPageContents";

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageContents />
    </Suspense>
  );
}
