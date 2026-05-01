"use client";

import { useEffect } from "react";
import { useWvi } from "@/store/useWvi";

export function WorkloadIdSync({ workloadId }: { workloadId: string }) {
  const setWorkloadId = useWvi((s) => s.setWorkloadId);
  useEffect(() => {
    setWorkloadId(workloadId);
  }, [workloadId, setWorkloadId]);
  return null;
}
