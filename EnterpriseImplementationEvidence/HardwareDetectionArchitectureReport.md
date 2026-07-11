# Enterprise Architecture Design: Hardware Detection & Execution Environment Engine
**Document ID:** EA-BOARD-HW-01  
**Category:** Enterprise Infrastructure Architecture  
**Status:** APPROVED / PRODUCTION READY  
**Audience:** Enterprise Infrastructure Architecture Board  

---

## 1. Executive Summary

This report defines the enterprise-grade architecture of the **Hardware Detection & Execution Environment Engine** for AI Hub Community. Moving away from standard desktop assumptions or hardcoded mock fallbacks, this engine relies entirely on dynamic, standard-compliant browser and server instrumentation. 

By separating runtime capabilities into a structured **Four-Tier Architecture**, the platform achieves exact awareness of client hardware limitations, sandbox boundaries, and AI model compatibility under strict production constraints.

---

## 2. The Four-Tier Infrastructure Model

The runtime execution environment is mapped onto four distinct physical and logical layers:

```
+--------------------------------------------------------------+
|                    LEVEL 1: USER PHYSICAL HOST               |
|  (User's actual CPU, GPU, RAM, OS, extracted from telemetry)  |
+--------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                    LEVEL 2: CLIENT BROWSER RUNTIME          |
|  (Navigator specs, Screen limits, WebGL Core & WebGPU status)|
+--------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                    LEVEL 3: BACKEND SANDBOX RUNTIME          |
|  (Container memory limits, Host distro OS, Process threads)  |
+--------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                    LEVEL 4: AI TARGET EXECUTION ENGINE       |
|  (Ollama/LM Studio routing, adaptive driver parameters)       |
+--------------------------------------------------------------+
```

### Level 1: Host Physical Machine
* **Responsibility**: Determine the host user's actual computer, hardware chips, and resources.
* **Extraction Methods**: Combined analysis of Client WebGL vendor names, Navigator capabilities, and backend server information.
* **Attributes**:
  * Physical CPU brand name.
  * Operating System name and kernel type.
  * Total Physical Memory (GB).
  * GPU Vendor and Model.
  * Native neural coprocessors (e.g. Apple Neural Engine, Tensor Cores).

### Level 2: Client Browser Runtime
* **Responsibility**: Profiling the browser workspace limits and local persistence layers.
* **Extraction Methods**: Standard sandboxed Window and Navigator API properties.
* **Attributes**:
  * Browser name, version, and rendering engine (Gecko, Blink, WebKit).
  * WebGL core capability (v2) and WebGPU adapter availability.
  * Available storage quota (indexedDB, localStorage, sessionStorage, cacheStorage).
  * Screen density and dark/light color-scheme preference.

### Level 3: Backend Sandbox Runtime
* **Responsibility**: Profiling the server-side container constraint layers (Google Cloud Run / Sandboxed Node.js).
* **Extraction Methods**: Node.js `process` information and native OS file-system hooks (`systeminformation`).
* **Attributes**:
  * Operating system distro and machine architecture (ARM64/x86_64).
  * Container limits (RAM allocated vs. RAM physically used).
  * Storage interface filesystems (overlay, ext4).
  * Temp directory write permissions and sandboxed limits.

### Level 4: AI Target Execution Engine
* **Responsibility**: Formulate the optimal execution target profile for local LLM engines.
* **Attributes**:
  * Target host types and API endpoints (e.g., Ollama or local Node).
  * Selected model size and quantization GGUF profiles based on host RAM.
  * Active drivers (Metal, CUDA, CPU).
  * Predicted speeds (tokens per second) and embedding support.

---

## 3. Strict Anti-Mocking State Machine

To enforce the constraint **"Zero hardcoded or mock fallbacks"**, the system implements an asynchronous three-stage state machine:

1. **State `PROBING`**:
   * Initiated immediately at startup.
   * All structural parameters return non-mock string loading indicators (`Probing CPU...`, `Probing GPU...`).
   * No fake default RAM or CPUs are shown.
2. **State `LOCAL_TELEMETRY_ACQUIRED`**:
   * Client-side WebGL context is initialized safely in a separate viewport.
   * Standard navigator APIs retrieve hardware concurrency and screen limits.
3. **State `MERGED_PROFILE_SYNCHRONIZED`**:
   * Client sends local telemetry via a POST request to `/api/hardware/client-telemetry`.
   * Server executes system information scans, computes physical host matching, and replies with container constraints.
   * UI components re-render with genuine system metrics and correct data-source labels.

---

## 4. Security and Compliance Policies

* **Standard API Only**: To ensure user trust and prevent invasive browser warning flags, the engine only queries standard, user-safe APIs (e.g., `WebGLRenderingContext.getParameter`, `navigator.hardwareConcurrency`). No non-standard or highly-invasive fingerprinting interfaces are called.
* **Secure Context (HTTPS)**: All client-side APIs are structured to execute in secure origins (HTTPS) with proper fallbacks for local loopback development.
* **No Secret Exposure**: All backend host paths and container internal folders are kept on the server. Only normalized user-facing hardware specifications are synchronized with the client.
