"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { RCAReport } from "@flarevision/shared-types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "P1" | "P2" | "P3";
type IncidentStatus = "running" | "completed" | "failed";

interface Incident {
  incidentId: string;
  workflowId: string;
  service: string;
  severity: Severity;
  errorRate: number;
  baseline: number;
  region: string;
  triggeredAt: string;
  status: IncidentStatus;
  result?: RCAReport;
  startedAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = ["payment-service", "auth-service", "api-gateway", "user-service"] as const;
const REGIONS = ["us-east-1", "us-west-2", "eu-west-1"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeSeverity(errorRate: number): Severity {
  if (errorRate > 300) return "P1";
  if (errorRate > 150) return "P2";
  return "P3";
}

function formatElapsed(startedAt: number, now: number): string {
  const secs = Math.floor((now - startedAt) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className = "border-amber-400" }: { className?: string }) {
  return (
    <div
      className={`w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin shrink-0 ${className}`}
    />
  );
}

// ─── SeverityBadge ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    P1: "bg-red-500/15 text-red-400 border-red-500/30",
    P2: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    P3: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IncidentStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400 text-sm">
        <Spinner />
        Running
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-red-400 text-sm">
      <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
      Failed
    </span>
  );
}

// ─── RCAPanel ─────────────────────────────────────────────────────────────────

function RCAPanel({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const report = incident.result!;
  return (
    <div className="mt-4 bg-slate-800/80 border border-slate-700/60 rounded-lg overflow-hidden animate-fade-in">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <SeverityBadge severity={incident.severity} />
          <span className="text-slate-200 font-semibold text-sm">Root Cause Analysis</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-400 text-sm">{incident.incidentId}</span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded">
            {incident.service}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-slate-500 hover:text-slate-300 transition-colors text-base leading-none shrink-0"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Root cause — full width */}
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Root Cause
          </p>
          <p className="text-slate-200 leading-relaxed">{report.rootCause}</p>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Timeline
          </p>
          <ol className="space-y-0">
            {report.timeline.map((event, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center shrink-0 w-3">
                  <div className="w-2 h-2 rounded-full border-2 border-slate-500 bg-slate-900 mt-1.5 shrink-0" />
                  {i < report.timeline.length - 1 && (
                    <div className="w-px flex-1 bg-slate-700 mt-1 mb-1" />
                  )}
                </div>
                <span className="text-slate-300 pb-3 leading-snug">{event}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Fix + preventive actions */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Recommended Fix
            </p>
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-md px-4 py-3 text-emerald-300 text-sm leading-relaxed">
              {report.recommendedFix}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Preventive Actions
            </p>
            <ol className="space-y-2">
              {report.preventiveActions.map((action, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                  <span className="font-mono text-slate-500 shrink-0 w-4 text-right tabular-nums">
                    {i + 1}.
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [now, setNow] = useState(Date.now());
  const streamsRef = useRef<Map<string, EventSource>>(new Map());

  // 1-second tick so elapsed times stay fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close all open EventSources on unmount
  useEffect(() => {
    const streams = streamsRef.current;
    return () => {
      for (const es of streams.values()) es.close();
    };
  }, []);

  const openStream = useCallback((workflowId: string) => {
    if (streamsRef.current.has(workflowId)) return;

    const es = new EventSource(
      `/api/incidents/${encodeURIComponent(workflowId)}/stream`
    );
    streamsRef.current.set(workflowId, es);

    es.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as {
        status: IncidentStatus;
        result?: RCAReport;
      };
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.workflowId === workflowId
            ? { ...inc, status: data.status, result: data.result }
            : inc
        )
      );
      if (data.status !== "running") {
        es.close();
        streamsRef.current.delete(workflowId);
      }
    };

    es.onerror = () => {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.workflowId === workflowId ? { ...inc, status: "failed" } : inc
        )
      );
      es.close();
      streamsRef.current.delete(workflowId);
    };
  }, []);

  const simulateIncident = useCallback(async () => {
    setIsSimulating(true);
    try {
      const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const errorRate = Math.floor(Math.random() * 401) + 100;
      const baseline = Math.floor(Math.random() * 5) + 1;
      const incidentId = `INC-${String(Math.floor(Math.random() * 9000) + 1000)}`;

      const alert = {
        incidentId,
        service,
        errorRate,
        baseline,
        region,
        triggeredAt: new Date().toISOString(),
      };

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });

      if (!res.ok) throw new Error("Failed to start workflow");

      const { workflowId } = (await res.json()) as { workflowId: string };

      const incident: Incident = {
        ...alert,
        workflowId,
        severity: computeSeverity(errorRate),
        status: "running",
        startedAt: Date.now(),
      };

      setIncidents((prev) => [incident, ...prev]);
      openStream(workflowId);
    } catch (err) {
      console.error("Failed to simulate incident:", err);
    } finally {
      setIsSimulating(false);
    }
  }, [openStream]);

  const selectedIncident = incidents.find((i) => i.workflowId === selectedId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-xl leading-none">⚡</span>
              <h1 className="text-base font-semibold text-slate-100 tracking-tight">
                FlareVision
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-700 text-slate-400 ml-0.5">
                ALPHA
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 pl-7">
              AI-powered incident response orchestrator
            </p>
          </div>

          <button
            onClick={simulateIncident}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isSimulating ? (
              <>
                <Spinner className="border-slate-400" />
                Starting…
              </>
            ) : (
              <>
                <span className="text-base leading-none">⚡</span>
                Simulate Incident
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Feed heading */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Incident Feed
          </h2>
          <span className="text-xs font-mono text-slate-600">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/80">
                {[
                  "Sev",
                  "Incident ID",
                  "Service",
                  "Region",
                  "Error Rate",
                  "Status",
                  "Triggered",
                  "Elapsed",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/40">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                      <span className="text-4xl opacity-20">⚡</span>
                      <p className="text-sm">
                        No incidents yet —{" "}
                        <button
                          onClick={simulateIncident}
                          className="text-slate-400 underline underline-offset-2 hover:text-slate-200 transition-colors"
                        >
                          simulate one
                        </button>{" "}
                        to trigger a workflow
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const isSelected = selectedId === inc.workflowId;
                  const isClickable =
                    inc.status === "completed" && !!inc.result;

                  return (
                    <tr
                      key={inc.workflowId}
                      onClick={
                        isClickable
                          ? () =>
                              setSelectedId(
                                isSelected ? null : inc.workflowId
                              )
                          : undefined
                      }
                      className={[
                        "animate-fade-in transition-colors duration-150",
                        inc.status === "running"
                          ? "bg-amber-500/[0.04]"
                          : "",
                        isSelected
                          ? "bg-slate-700/40"
                          : isClickable
                          ? "hover:bg-slate-700/25"
                          : "",
                        isClickable ? "cursor-pointer" : "cursor-default",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <SeverityBadge severity={inc.severity} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-200 text-sm">
                          {inc.incidentId}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs bg-slate-700/60 border border-slate-600/40 text-slate-300 px-2 py-1 rounded">
                          {inc.service}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-500 text-xs">
                          {inc.region}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-200">
                          {inc.errorRate}
                        </span>
                        <span className="text-slate-600 text-xs ml-1">
                          req/s
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={inc.status} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-500 text-xs">
                          {formatTime(inc.triggeredAt)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-500 text-xs tabular-nums">
                          {formatElapsed(inc.startedAt, now)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── RCA detail panel ── */}
        {selectedIncident?.status === "completed" &&
          selectedIncident.result && (
            <RCAPanel
              incident={selectedIncident}
              onClose={() => setSelectedId(null)}
            />
          )}
      </main>
    </div>
  );
}
