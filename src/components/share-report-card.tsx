"use client";

import { useEffect, useRef, useState } from "react";
import type { Operator, IncidentCategory } from "@/contracts/domain";
import { OPERATOR_OPTIONS, INCIDENT_CATEGORIES, LAGOS_LGAS } from "@/components/constants";
import { DownloadIcon, ShareIcon, CopyIcon, CheckCircleIcon } from "@/components/icons";

interface ShareReportCardProps {
  operator: Operator;
  category: IncidentCategory;
  areaId: string | null;
  onDismiss?: () => void;
}

export function ShareReportCard({
  operator,
  category,
  areaId,
  onDismiss,
}: ShareReportCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const opInfo = OPERATOR_OPTIONS.find((o) => o.code === operator) ?? OPERATOR_OPTIONS[0]!;
  const catInfo = INCIDENT_CATEGORIES.find((c) => c.code === category) ?? INCIDENT_CATEGORIES[0]!;
  const areaName = LAGOS_LGAS.find((a) => a.id === areaId)?.name ?? "Lagos State";

  const reportUrl = typeof window !== "undefined"
    ? `${window.location.origin}/report/${operator}`
    : `https://signalpulse-nine.vercel.app/report/${operator}`;

  // Render high-res PNG to hidden canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Deep dark navy into emerald)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#090D16");
    bgGrad.addColorStop(0.5, "#0D1527");
    bgGrad.addColorStop(1, "#03281E");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid pattern / decorative lines
    ctx.strokeStyle = "rgba(6, 78, 59, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 60; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 60; y < height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer card border
    ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner glow
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Header: Logo and Brand
    // Logo Box
    ctx.fillStyle = "#064E3B";
    ctx.beginPath();
    ctx.roundRect(70, 70, 56, 56, 12);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SP", 98, 98);

    // Brand Name
    ctx.textAlign = "left";
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("SignalPulse ", 142, 92);
    ctx.fillStyle = "#34D399";
    ctx.fillText("NG", 325, 92);

    ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("Independent Telecom Evidence Platform · Lagos", 142, 118);

    // Top Right Pill: USER-REPORTED (Required Provenance)
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.beginPath();
    ctx.roundRect(width - 320, 75, 250, 46, 23);
    ctx.fill();
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#34D399";
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("● USER-REPORTED", width - 195, 99);

    // Main Statement
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("I logged a network problem.", 70, 240);

    ctx.font = "400 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText("Documenting mobile service failures with structured, factual records.", 70, 285);

    // Metrics / Badges Container
    const boxY = 340;
    const boxH = 150;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(70, boxY, width - 140, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Column 1: Network / Operator
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("NETWORK", 100, boxY + 45);

    // Dot with operator brand color
    ctx.fillStyle = opInfo.brandColor;
    ctx.beginPath();
    ctx.arc(110, boxY + 88, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(opInfo.name, 130, boxY + 92);

    // Divider 1
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(460, boxY + 25);
    ctx.lineTo(460, boxY + boxH - 25);
    ctx.stroke();

    // Column 2: Problem Category
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("PROBLEM CATEGORY", 500, boxY + 45);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(catInfo.title, 500, boxY + 92);

    // Divider 2
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(850, boxY + 25);
    ctx.lineTo(850, boxY + boxH - 25);
    ctx.stroke();

    // Column 3: Area / Location
    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("LOCATION", 890, boxY + 45);

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(areaName, 890, boxY + 92);

    // Footer Bar
    ctx.fillStyle = "#34D399";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("signalpulse-nine.vercel.app", 70, height - 70);

    ctx.fillStyle = "#64748B";
    ctx.font = "400 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Private on-device · No tracking · Independent consumer platform", width - 70, height - 70);
  }, [operator, category, areaId, opInfo, catInfo, areaName]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `signalpulse-${operator}-report.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleShareX = () => {
    const text = `I just logged a network problem on SignalPulse NG for ${opInfo.name} (${catInfo.title}).\n\nBad network? Keep a record here:\n${reportUrl}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const text = `I just logged a network problem on SignalPulse NG for ${opInfo.name} (${catInfo.title}). If your data or calls are acting up, record what happened here: ${reportUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <section
      aria-labelledby="share-card-title"
      className="rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-br from-slate-900 via-slate-900 to-[#04281E] p-5 sm:p-7 text-white shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 mb-2">
            <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Report successfully saved on this phone
          </span>
          <h3 id="share-card-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Share that you logged a problem
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Generate a privacy-safe image card to post on X or share on WhatsApp. Your private notes, phone numbers, and reference codes are never included.
          </p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="self-start text-xs text-slate-400 hover:text-white font-medium px-2 py-1"
          >
            Done
          </button>
        )}
      </div>

      {/* Visual Live Preview of the Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/70 p-5 sm:p-6 backdrop-blur-sm shadow-inner">
        <div className="flex items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#064E3B] font-bold text-xs text-white">
              SP
            </span>
            <span className="font-bold text-sm tracking-tight text-white">
              SignalPulse <span className="text-emerald-400">NG</span>
            </span>
          </div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
            User-Reported Problem
          </span>
        </div>

        <div className="py-3 space-y-1.5">
          <p className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
            I logged a network problem.
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            Recorded in Lagos State to support provider and NCC complaints.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Network
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: opInfo.brandColor }}
                aria-hidden="true"
              />
              <span className="font-bold text-xs sm:text-sm text-white truncate">
                {opInfo.name}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Problem
            </span>
            <span className="font-bold text-xs sm:text-sm text-white block mt-1 truncate">
              {catInfo.title}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-lg border border-slate-800 bg-slate-900/90 p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Location
            </span>
            <span className="font-bold text-xs sm:text-sm text-white block mt-1 truncate">
              {areaName}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="font-mono text-emerald-400 font-semibold">signalpulse-nine.vercel.app</span>
          <span>Private on this device</span>
        </div>
      </div>

      {/* Hidden 1200x675 Canvas for High-DPI PNG Generation */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Share Actions Grid */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-60"
        >
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
          <span>{downloading ? "Generating PNG..." : "Download Card (PNG)"}</span>
        </button>

        <button
          type="button"
          onClick={handleShareX}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <ShareIcon className="h-4 w-4 text-sky-400" aria-hidden="true" />
          <span>Share on X</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <ShareIcon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span>Share on WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <CopyIcon className="h-4 w-4 text-slate-300" aria-hidden="true" />
          <span>{copied ? "Link Copied!" : "Copy Link"}</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        No report data or private text is sent to our servers. Sharing is initiated solely by your explicit tap.
      </p>
    </section>
  );
}
