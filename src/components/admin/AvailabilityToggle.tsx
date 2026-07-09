"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { setItemAvailability } from "@/app/actions/menu";

export default function AvailabilityToggle({
  itemId,
  initialAvailable,
}: {
  itemId: string;
  initialAvailable: boolean;
}) {
  const [available, setAvailable] = useState(initialAvailable);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !available;
    setAvailable(next);
    startTransition(async () => {
      const { error } = await setItemAvailability(itemId, next);
      if (error) {
        setAvailable(!next);
        toast.error(error);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      role="switch"
      aria-checked={available}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        available ? "bg-kokoro-600" : "bg-kokoro-200"
      } disabled:opacity-60`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          available ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}
