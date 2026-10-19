import type { MutableRefObject } from "react";
import type { EncounterMotion } from "../../lib/asteroids/encounters";
import type { PhysicalEncounterFrame, EncounterView } from "../../lib/asteroids/encounter-playback";
import type { SizeReferenceId } from "../../lib/asteroids/size-reference";
import type { BirthSky } from "../../lib/sky/model";
export type SceneConfig = {
  kind: "home" | "catalog" | "profile" | "events" | "solar" | "encounters" | "sky";
  sky?: {data:BirthSky;azimuth:number;altitude:number};
  encounter?: { bodies:string[]; body:string; eventKey?:string; revision?:number; motion:MutableRefObject<EncounterMotion|null>; physical?:MutableRefObject<PhysicalEncounterFrame>; view?:EncounterView };
  projectBodies?: (points:{id:string;x:number;y:number;visible:boolean}[])=>void;
  focus?: { latitude:number; longitude:number };
  focusRevision?: number;
  markers?: { id:string; latitude:number; longitude:number }[];
  projectMarkers?: (points:{ id:string; x:number; y:number; visible:boolean }[])=>void;
  id?: string; paused: boolean; diameter?: number | null; speed?: number | null;
  sizeReference?: SizeReferenceId;
  mode?: "object" | "size" | "distance"; progress?: MutableRefObject<number>;
};
export type SceneStatus = "loading" | "ready" | "failed";
export type SceneBinding = { host: HTMLElement; config: SceneConfig; status: (value: SceneStatus) => void };
export type SceneEngine = {
  attach(binding: SceneBinding): void; update(config: SceneConfig): void;
  detach(host: HTMLElement): void; depart(destination: string): void;
  cancelFlight(): void;
  rotate(direction: number): void; reset(): void; dispose(): void;
};
