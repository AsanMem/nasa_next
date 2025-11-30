import { fetchNasaJson, formatDubaiDate } from "./api";

const TECHPORT_LIST_ENDPOINT = "https://api.nasa.gov/techport/api/projects";
const TECHPORT_DETAIL_ENDPOINT = "https://api.nasa.gov/techport/api/projects";
const TECHPORT_REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours

export type TechportProjectSummary = {
  projectId: string;
  lastUpdated?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  formattedLastUpdated?: string;
};

type TechportListResponse = {
  projects?: {
    projects?: TechportProjectSummary[];
  };
};

export type TechportProjectDetail = {
  projectId: number;
  title?: string;
  description?: string;
  benefits?: string;
  destinations?: string[];
  startDate?: string;
  endDate?: string;
  lastUpdated?: string;
  leadOrganization?: {
    name?: string;
    type?: string;
  };
  supportingOrganizations?: Array<{
    name?: string;
    type?: string;
  }>;
};

type TechportDetailResponse = {
  project?: TechportProjectDetail;
};

export type TechportProject = TechportProjectDetail & {
  lastUpdatedFormatted?: string;
  startDateFormatted?: string;
  endDateFormatted?: string;
};

export async function fetchTechportProjects(limit = 12): Promise<TechportProjectSummary[]> {
  const response = await fetchNasaJson<TechportListResponse>(TECHPORT_LIST_ENDPOINT, {
    revalidate: TECHPORT_REVALIDATE_SECONDS,
  });

  const projects = response?.projects?.projects ?? [];

  return projects.slice(0, limit).map((project) => ({
    ...project,
    formattedLastUpdated: project.lastUpdated
      ? formatDubaiDate(project.lastUpdated)
      : undefined,
  }));
}

export async function fetchTechportProject(id: string | number): Promise<TechportProject | null> {
  const response = await fetchNasaJson<TechportDetailResponse>(
    `${TECHPORT_DETAIL_ENDPOINT}/${id}`,
    {
      revalidate: TECHPORT_REVALIDATE_SECONDS,
    },
  );

  if (!response?.project) {
    return null;
  }

  return {
    ...response.project,
    lastUpdatedFormatted: response.project.lastUpdated
      ? formatDubaiDate(response.project.lastUpdated)
      : undefined,
    startDateFormatted: response.project.startDate
      ? formatDubaiDate(response.project.startDate)
      : undefined,
    endDateFormatted: response.project.endDate
      ? formatDubaiDate(response.project.endDate)
      : undefined,
  };
}
