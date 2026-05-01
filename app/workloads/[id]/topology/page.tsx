"use client";

import { motion } from "framer-motion";
import { TopologyGraph } from "@/components/topology/TopologyGraph";
import { PropagationCards } from "@/components/topology/PropagationCards";
import { Card } from "@/components/primitives/Card";
import { useWvi } from "@/store/useWvi";
import { getWorkload } from "@/data/workloads";

export default function TopologyPage() {
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId);

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 space-y-4 pb-12"
    >
      <Card
        title="Workload IQ · Topology"
        right={
          <span>
            {workload.processes.length} processes ·{" "}
            {workload.applicationComponents.length} app components ·{" "}
            {workload.infrastructureResources.length} resources ·{" "}
            {workload.dependencies.length} edges
          </span>
        }
        noPadding
      >
        <TopologyGraph workload={workload} />
      </Card>

      <PropagationCards workload={workload} />
    </motion.div>
  );
}
