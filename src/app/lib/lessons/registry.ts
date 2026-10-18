import records from "./resources.json";

export type LessonResource = { id: string; kind: "image" | "video" | "page"; title: string; shortTitle?: string; source: string; preview?: string; credit?: string };
export type LessonPack = {
  id: string; title: string; ages: "11–14"; minutes: 40; objective: string;
  stages: readonly { minutes: number; title: string; activity: string; resources?: readonly string[] }[];
  questions: readonly string[]; exitTask: string; note: string; resources: readonly LessonResource[];
};
const page = (id: string, title: string, source: string): LessonResource => ({ id, title, source, kind: "page" });
const media = (topic: string): LessonResource[] => records.filter(item => item.topic === topic).map(item => ({ ...item, kind: item.kind as "image" | "video" }));
const stages = (activities: readonly string[]) => activities.map((activity, i) => ({ minutes: [5, 10, 15, 10][i], title: ["Notice", "Investigate", "Build an explanation", "Discuss & reflect"][i], activity }));

// Curated by hand, not generated at request time. Source review: 2026-10-18.
const curatedPacks: readonly LessonPack[] = [
  {
    id: "moon", title: "Reading the lunar surface", ages: "11–14", minutes: 40,
    objective: "Use photographs and a temperature visualization to distinguish observations from explanations about the Moon.",
    stages: stages([
      "Show the two Apollo photographs without their captions. Each learner writes three things they can see and one question.",
      "Read the captions and Moon facts page in pairs. Mark which initial statements were observations and which were guesses. Watch the LRO eclipse-temperature video; pause at two moments to compare illuminated and shadowed areas.",
      "Groups annotate a sketch with evidence of surface texture, shadows and human exploration. Use the exploration page to add one fact with its source. Write a cautious explanation of why lighting changes what a photograph reveals.",
      "Compare group claims using the questions below. Complete the exit task independently and share one uncertainty that would need another measurement."
    ]),
    questions: ["What can a shadow tell us, and what can it hide?", "Which claims require a measurement rather than a photograph?", "How does an eclipse-temperature visualization differ from an ordinary photograph?"],
    exitTask: "Write one observation, one evidence-based explanation and one unanswered question about the lunar surface. Cite a resource for the explanation.",
    note: "The temperature video is a visualization of measurements, not visible-light footage. The Apollo views are not a controlled before-and-after experiment.",
    resources: [...media("moon"), page("moon-facts", "Moon facts", "https://science.nasa.gov/moon/facts/"), page("moon-exploration", "Moon exploration", "https://science.nasa.gov/moon/exploration/")]
  },
  {
    id: "asteroids", title: "An asteroid, from world to grain", ages: "11–14", minutes: 40,
    objective: "Compare remote images with returned samples and explain what each kind of evidence can tell us about an asteroid.",
    stages: stages([
      "Display the Bennu mosaic and sample vial. Ask learners to list similarities and differences, keeping scale separate from appearance.",
      "Watch selected sections of Tour of Asteroid Bennu. Read the Bennu facts page and record two measurements with units. Identify which views are images and which are explanatory visualizations.",
      "Pairs create an evidence table: question, useful resource, what it reveals, and what it cannot establish. Include surface shape, size and sample material. Use asteroid facts to compare Bennu with the wider asteroid population.",
      "Discuss the limits of each source. Complete the exit task, checking that every factual claim has a source and every measurement has a unit."
    ]),
    questions: ["Why can a distant image and a sample answer different questions?", "Can colour alone establish an asteroid's composition?", "What information would you need before making a claim about an Earth encounter?"],
    exitTask: "Recommend two complementary observations for studying an unfamiliar asteroid. Explain the value and limitation of each.",
    note: "Orbital's procedural asteroid scenes are artistic reconstructions. Use the NASA Bennu images here as observational evidence; do not infer collision risk from appearance.",
    resources: [...media("asteroids"), page("asteroid-facts", "Asteroid facts", "https://science.nasa.gov/solar-system/asteroids/facts/"), page("bennu-facts", "Bennu facts", "https://science.nasa.gov/solar-system/asteroids/101955-bennu/facts/")]
  },
  {
    id: "sun", title: "Seeing an active Sun", ages: "11–14", minutes: 40,
    objective: "Explain how wavelength and time affect our view of the Sun, using SDO imagery.",
    stages: stages([
      "Compare the two solar images. Learners describe structures without assuming that the displayed colours match what human eyes would see.",
      "Read the image captions and Sun facts. Watch a short section of SDO: Year 7 with pauses. Identify changes over time and check which wavelengths or instruments the source describes.",
      "Groups prepare a labelled comparison: visible feature, source, wavelength information if supplied, and a question for further study. Use the Sun overview to explain one feature in their own words.",
      "Discuss how scientists turn measurements into images. Complete an exit caption that separates what is shown from what is inferred."
    ]),
    questions: ["Why might two images of the Sun have different colours?", "What does a sequence reveal that a still image cannot?", "Which differences might come from the instrument rather than a change in the Sun?"],
    exitTask: "Write a museum caption for one solar image: what it shows, how it was observed and one limitation of the view.",
    note: "Use only recorded imagery. Never ask learners to look directly at the Sun. SDO colours represent selected wavelengths; the two still images are from different dates.",
    resources: [...media("sun"), page("sun-facts", "Sun facts", "https://science.nasa.gov/sun/facts/"), page("sun-overview", "Explore the Sun", "https://science.nasa.gov/sun/")]
  },
  {
    id: "earth", title: "How to read a Blue Marble", ages: "11–14", minutes: 40,
    objective: "Distinguish a composite Earth image from a single view and explain why source metadata matters.",
    stages: stages([
      "Look at both Blue Marble images. List visible land, ocean and cloud features. Ask whether each could be one camera exposure.",
      "Read the image descriptions and Earth facts page. Watch the Orion Earthrise video. Record viewpoint, date information and whether each source combines observations.",
      "Pairs design an image label including viewpoint, source and a limitation. Compare the composite still images with the spacecraft video. Consult the Earth overview before making a broader claim.",
      "Discuss why these images alone cannot demonstrate a climate trend. Complete the exit task and exchange labels for an evidence check."
    ]),
    questions: ["What is gained by combining observations into a composite?", "How does viewpoint change what appears large or visible?", "What extra data would a claim about long-term change require?"],
    exitTask: "Write two sentences comparing a Blue Marble composite and the Orion view. Include one useful feature and one limitation of each.",
    note: "The 2007 composite combines layers from different observation periods; its label is not one observation date. These resources are not a matched time series.",
    resources: [...media("earth"), page("earth-facts", "Earth facts", "https://science.nasa.gov/earth/facts/"), page("earth-overview", "Explore Earth science", "https://science.nasa.gov/earth/")]
  },
  {
    id: "galaxies", title: "One galaxy, different light", ages: "11–14", minutes: 40,
    objective: "Compare ultraviolet and infrared views of Andromeda and explain why astronomers use multiple wavelengths.",
    stages: stages([
      "Display both Andromeda images. Ask learners what appears similar and what changes, before reading the instrument labels.",
      "Read both captions and the galaxy overview. Identify ultraviolet and infrared views and what the source says they reveal. Watch the short cosmic-structure visualization, pausing to distinguish galaxy and larger-scale structure.",
      "Groups create a two-column observation chart with evidence from each wavelength. Use the galaxy types page to add context while keeping classification separate from the colours assigned to an image.",
      "Discuss what one wavelength might miss. Complete the exit task using at least one image caption and one NASA article as sources."
    ]),
    questions: ["Why can the same galaxy look different in different light?", "Does a displayed image colour always represent visible light?", "How is a visualization of cosmic structure different from a telescope photograph?"],
    exitTask: "Propose a two-image display about Andromeda. Explain what each wavelength contributes and state one question the display cannot answer.",
    note: "The cosmic-structure video includes scientific visualization, not footage of a camera flying out of our galaxy. Display colours and image scales must be read from their sources.",
    resources: [...media("galaxies"), page("galaxies", "Galaxies", "https://science.nasa.gov/universe/galaxies/"), page("galaxy-types", "Types of galaxies", "https://science.nasa.gov/universe/galaxies/types/")]
  }
];

// Match each resource to the activity that uses it, keeping the curated source records intact.
const resourceLabels:Record<string,string>={
  "as11-37-5505":"Lunar module shadow", "as11-40-5874":"Buzz Aldrin on the Moon",
  "GSFC_20110617_LRO_m10794_Temp":"The Moon’s changing temperature",
  "Bennu_Sample2":"A sample from Bennu", "bennu-mosaic":"Bennu, seen by OSIRIS-REx",
  "PIA26681":"The Sun in ultraviolet", "PIA17669":"A coronal hole on the Sun",
  "GSFC_20170211_SDO_m12500_Year7":"A year of the Sun",
  "GSFC_20171208_Archive_e001386":"Blue Marble (2012)", "GSFC_20171208_Archive_e002131":"Blue Marble composite",
  "ART-CMA1_2022_325_1250_SHARED_art001m1203251250":"Earthrise from Orion",
  "PIA04921":"Andromeda in ultraviolet", "PIA25163":"Andromeda in infrared",
  "GSFC_20080520_HST_m10223_COS":"From galaxies to the cosmic web"
};
export const lessonPacks: readonly LessonPack[] = curatedPacks.map(lesson=>{
  const images=lesson.resources.filter(item=>item.kind==="image").map(item=>item.id);
  const video=lesson.resources.find(item=>item.kind==="video")!;
  const reading=lesson.resources.filter(item=>item.kind==="page");
  const steps=[images,[video.id,reading[0].id],[reading[1].id],[]];
  return {...lesson,resources:lesson.resources.map(resource=>({...resource,shortTitle:resourceLabels[resource.id]})),stages:lesson.stages.map((stage,index)=>({...stage,resources:steps[index]}))};
});
