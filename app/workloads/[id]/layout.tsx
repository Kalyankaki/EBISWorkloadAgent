import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shell/Breadcrumb";
import { WorkloadHeader } from "@/components/workload/WorkloadHeader";
import { CommandBar } from "@/components/workload/CommandBar";
import { TabNav } from "@/components/workload/TabNav";
import { ScenarioBanner } from "@/components/scenario/ScenarioBanner";
import { WORKLOADS } from "@/data/workloads";
import { WorkloadIdSync } from "./WorkloadIdSync";

export default function WorkloadLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const workload = WORKLOADS[params.id];
  if (!workload) notFound();

  return (
    <div className="pb-12">
      <WorkloadIdSync workloadId={params.id} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Workload Virtual Instance", href: "/workloads" },
          { label: workload.name },
        ]}
      />
      <WorkloadHeader workload={workload} />
      <CommandBar />
      <TabNav workloadId={workload.id} />
      <ScenarioBanner />
      {children}
    </div>
  );
}
