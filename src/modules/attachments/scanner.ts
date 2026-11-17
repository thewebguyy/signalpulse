/**
 * SignalPulse NG — Malware Scanner Port & Fail-Closed Integration
 *
 * Requirements:
 * - Fail-closed: If scanning infrastructure is unavailable or unconfigured,
 *   uploads remain disabled and files are never marked 'clean'.
 * - Never pretend scanning succeeded.
 */

export interface MalwareScanResult {
  clean: boolean;
  scannerVersion: string;
  scannedAt: string;
  error?: string;
}

export interface MalwareScannerPort {
  isConfigured(): boolean;
  scan(fileBytes: Uint8Array, mimeType: string): Promise<MalwareScanResult>;
}

/**
 * Fail-Closed Scanner implementation:
 * Checks whether an approved external scanning endpoint or service is configured.
 * If not configured, throws or rejects to prevent unverified uploads from becoming clean.
 */
export class FailClosedMalwareScanner implements MalwareScannerPort {
  private readonly scannerEndpoint: string | null;

  constructor(scannerEndpoint?: string) {
    this.scannerEndpoint = scannerEndpoint ?? null;
  }

  isConfigured(): boolean {
    return typeof this.scannerEndpoint === "string" && this.scannerEndpoint.length > 0;
  }

  async scan(fileBytes: Uint8Array, mimeType: string): Promise<MalwareScanResult> {
    const now = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        clean: false,
        scannerVersion: "unconfigured",
        scannedAt: now,
        error: "Attachment uploads are disabled because no malware scanning service is configured. Fail-closed to protect subscribers.",
      };
    }

    // When an approved scanner endpoint is configured, forward the bytes for scanning
    try {
      const response = await fetch(this.scannerEndpoint!, {
        method: "POST",
        headers: {
          "Content-Type": mimeType,
          "X-Scan-Timestamp": now,
        },
        body: fileBytes as unknown as BodyInit,
      });

      if (!response.ok) {
        return {
          clean: false,
          scannerVersion: "remote-scanner-v1",
          scannedAt: now,
          error: `Malware scanner returned non-OK status: ${response.status}`,
        };
      }

      const body = (await response.json()) as { clean?: boolean; scanner_version?: string };
      return {
        clean: body.clean === true,
        scannerVersion: body.scanner_version ?? "remote-scanner-v1",
        scannedAt: now,
      };
    } catch (err) {
      return {
        clean: false,
        scannerVersion: "remote-scanner-v1",
        scannedAt: now,
        error: `Malware scan failed with network or transport error: ${err instanceof Error ? err.message : "unknown"}`,
      };
    }
  }
}
