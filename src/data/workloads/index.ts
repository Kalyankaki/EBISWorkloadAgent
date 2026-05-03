import type {
  DriftItem,
  Incident,
  Recommendation,
  Workload,
  WorkloadId,
} from "../schema";
import {
  ebsProd,
  ebsProdDrift,
  ebsProdIncident,
  ebsProdRecommendations,
} from "./ebs-prod";
import { ebsUat, ebsUatDrift, ebsUatRecommendations } from "./ebs-uat";

export const WORKLOADS: Record<WorkloadId, Workload> = {
  "ebs-prod": ebsProd,
  "ebs-uat": ebsUat,
};

export const WORKLOAD_LIST: Workload[] = Object.values(WORKLOADS);

export function getWorkload(id: WorkloadId): Workload | undefined {
  return WORKLOADS[id];
}

export const getDriftFor = (id: WorkloadId): DriftItem[] => {
  if (id === "ebs-prod") return ebsProdDrift;
  if (id === "ebs-uat") return ebsUatDrift;
  return [];
};

export const getRecommendationsFor = (id: WorkloadId): Recommendation[] => {
  if (id === "ebs-prod") return ebsProdRecommendations;
  if (id === "ebs-uat") return ebsUatRecommendations;
  return [];
};

export const getIncidentFor = (
  id: WorkloadId,
  scenarioStepId: string
): Incident | null => {
  if (id !== "ebs-prod") return null;
  const inc = ebsProdIncident;
  if (scenarioStepId === "incident") return { ...inc, status: "active" };
  if (scenarioStepId === "impact") return { ...inc, status: "mitigating" };
  if (scenarioStepId === "resolved") return { ...inc, status: "resolved" };
  return null;
};
