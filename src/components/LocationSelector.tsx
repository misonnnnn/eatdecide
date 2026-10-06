"use client";

import { useState } from "react";
import type { UserLocation } from "@/lib/types";

export type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; location: UserLocation }
  | { status: "denied" }
  | { status: "error"; message: string };

type LocationSelectorProps = {
  state: LocationState;
  onRequest: () => void;
  onContinueWithout: () => void;
  onTryAgain: () => void;
};

export default function LocationSelector({
  state,
  onRequest,
  onContinueWithout,
  onTryAgain,
}: LocationSelectorProps) {
  const [skipped, setSkipped] = useState(false);

  if (skipped || state.status === "success") {
    return (
      <div className="rounded-3xl bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
        {state.status === "success" ? (
          <>
            <p className="text-4xl" aria-hidden="true">
              📍
            </p>
            <p className="mt-4 text-lg font-bold">Location found</p>
            <p className="mt-2 text-[var(--muted)]">
              Ready to find food nearby!
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-[var(--muted)]">
              Continuing without location
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              You&apos;ll still get a food pick — just no nearby restaurants.
            </p>
          </>
        )}
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="rounded-3xl bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
        <p className="animate-pulse text-4xl" aria-hidden="true">
          📍
        </p>
        <p className="mt-4 font-semibold">Finding your location...</p>
      </div>
    );
  }

  if (state.status === "denied" || state.status === "error") {
    return (
      <div className="rounded-3xl bg-[var(--surface)] p-6 text-center shadow-[var(--shadow)]">
        <p className="text-sm text-[var(--muted)]">
          We couldn&apos;t access your location.
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          You can still use EatDecide, but nearby restaurant recommendations
          won&apos;t be available.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={onTryAgain} className="btn-secondary">
            Try Again
          </button>
          <button
            type="button"
            onClick={() => {
              setSkipped(true);
              onContinueWithout();
            }}
            className="btn-ghost"
          >
            Continue Without Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={onRequest}
        className="flex w-full flex-col items-center gap-3 rounded-3xl bg-[var(--surface)] px-6 py-10 shadow-[var(--shadow)] transition active:scale-[0.98] hover:bg-[var(--surface-muted)]"
      >
        <span className="text-5xl" aria-hidden="true">
          📍
        </span>
        <span className="text-xl font-bold">Use my location</span>
        <span className="text-sm text-[var(--muted)]">
          Find restaurants near you
        </span>
      </button>
      <button
        type="button"
        onClick={() => {
          setSkipped(true);
          onContinueWithout();
        }}
        className="btn-ghost"
      >
        Continue without location
      </button>
    </div>
  );
}

export function requestUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("denied"));
        } else {
          reject(new Error("unavailable"));
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  });
}
