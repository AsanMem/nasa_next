
import React from "react";

type TimelineProps = {
    closeApproachData: any[];
};

export default function Timeline({ closeApproachData }: TimelineProps) {
    if (!closeApproachData || closeApproachData.length === 0) {
        return null;
    }

    return (
        <div
            className="
        max-h-[51vh] 
        overflow-y-auto
        pr-2
        timeline-scroll
      "
        >
            <ol
                className="
          relative
          ml-3  
          border-l border-white/15
          pl-4
          text-sm text-white/80
        "
            >
                {closeApproachData.map((approach: any, index: number) => {
                    const velocity =
                        approach?.relative_velocity?.kilometers_per_second ?? null;
                    const missDistance = approach?.miss_distance?.kilometers ?? null;
                    const date = approach?.close_approach_date ?? "";
                    const body = approach?.orbiting_body ?? "object";

                    return (
                        <li key={index} className="mb-4 last:mb-0">
                            <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />

                            <div className="flex flex-col gap-1">
                                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                                    {date}
                                </p>
                                {missDistance && (
                                    <p>
                                        <span className="text-white/60">Miss distance:</span>{" "}
                                        <span className="text-white">
                                            {Number(missDistance).toFixed(0)} km
                                        </span>
                                    </p>
                                )}
                                {velocity && (
                                    <p>
                                        <span className="text-white/60">Relative speed:</span>{" "}
                                        <span className="text-white">
                                            {Math.round(
                                                Number(velocity),
                                            ).toLocaleString("en-US")}{" "}
                                            km/s
                                        </span>
                                    </p>
                                )}
                                <p className="text-readable text-xs text-white/60">
                                    Approach to <span className="text-white">{body}</span>
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
