import type { DriftItem, Incident, Recommendation, Workload, WorkloadId } from "../schema";
import { ebsProd, ebsProdDrift, ebsProdIncident, ebsProdRecommendations } from "./ebs-prod";
import { ebsUat } from "./ebs-uat";

export const WORKLOADS: Record<WorkloadId, Workload> = {
  "ebs-prod": ebsProd,
  "ebs-uat": ebsUat,
};

export const WORKLOAD_LIST: Workload[] = [ebsProd, ebsUat];

export const getWorkload = (id: WorkloadId): Workload =>
  WORKLOADS[id] ?? ebsProd;

export const getDriftFor = (id: WorkloadId): DriftItem[] =>
  id === "ebs-prod" ? ebsProdDrift : [];

export const getRecommendationsFor = (id: WorkloadId): Recommendation[] =>
  id === "ebs-prod" ? ebsProdRecommendations : [];

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
