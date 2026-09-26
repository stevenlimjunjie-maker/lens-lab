"use client";

import { useId, useState } from "react";
import { Tabs } from "@/components/ui/Controls";
import { IphoneMock, SamsungMock, type IphoneSpot, type SamsungSpot } from "@/components/mockui/PhoneMock";
import type { Platform } from "@/lib/content";

export type GuideItem = { title: string; text: string };

export function PlatformGuide({
  samsung,
  iphone,
  samsungSpot,
  iphoneSpot,
  title = "Where it lives",
  ordered,
}: {
  samsung: (string | GuideItem)[];
  iphone: (string | GuideItem)[];
  samsungSpot?: SamsungSpot;
  iphoneSpot?: IphoneSpot;
  title?: string;
  ordered?: boolean;
}) {
  const [p, setP] = useState<Platform>("samsung");
  const panelId = useId();
  const items = p === "samsung" ? samsung : iphone;
  const List = ordered ? "ol" : "ul";
  return (
    <div className="rounded-lg border border-rule bg-white">
      <div className="px-3 pt-2">
        <p className="smallcaps text-[12px] text-muted">{title}</p>
        <Tabs
          label={title}
          tabs={[
            { value: "samsung", label: "On Samsung" },
            { value: "iphone", label: "On iPhone" },
          ]}
          value={p}
          onChange={setP}
        />
      </div>
      <div id={panelId} role="tabpanel" aria-label={p === "samsung" ? "On Samsung" : "On iPhone"} className="grid gap-4 p-3 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="mx-auto w-[150px] sm:w-full">
          {p === "samsung" ? (
            <SamsungMock spot={samsungSpot} label="Simplified drawing of a Samsung Galaxy camera screen with the relevant control highlighted in amber" />
          ) : (
            <IphoneMock spot={iphoneSpot} label="Simplified drawing of an iPhone camera screen with the relevant control highlighted in amber" />
          )}
        </div>
        <List className={`grid content-start gap-2 text-[15px] ${ordered ? "list-decimal pl-5" : ""}`}>
          {items.map((it, i) =>
            typeof it === "string" ? (
              <li key={i} className={ordered ? "pl-1" : "flex gap-2"}>
                {!ordered && <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />}
                <span>{it}</span>
              </li>
            ) : (
              <li key={i} className="border-b border-rule pb-2 last:border-0">
                <p className="font-semibold text-ink">{it.title}</p>
                <p className="text-ink-2">{it.text}</p>
              </li>
            ),
          )}
        </List>
      </div>
      <p className="border-t border-rule px-3 py-2 text-[12px] text-muted">
        Simplified drawing. Layouts, labels and lens buttons vary by model and software version.
      </p>
    </div>
  );
}
