import { EnterpriseServiceBus, ESBService, ESBMessage } from "./EnterpriseServiceBus";

export async function runTests(): Promise<boolean> {
    console.log("[ESB Test] Initiating Enterprise Service Bus and Microkernel tests...");
    const esb = EnterpriseServiceBus.getInstance();

    try {
        // 1. Check default services are registered
        const services = esb.getServices();
        if (services.length < 3) {
            throw new Error(`Expected at least 3 default microkernel services, got ${services.length}`);
        }
        console.log(`[ESB Test] Default services validation passed (${services.length} services found).`);

        // 2. Test Dynamic Service Registration
        const newService: ESBService = {
            contract: {
                id: "srv-custom-plugin",
                name: "CustomAIPlugin",
                version: "1.2.0",
                dependencies: ["Kernel", "SecurityEngine"],
                permissions: ["system:monitor"],
                supportedEvents: ["TaskProcessed"],
                apis: ["processTask"],
                license: "Enterprise-MIT",
                checksum: "0xAB49129E",
                digitalSignature: "SIG_CUSTOM_AI"
            },
            state: "Running",
            telemetry: {
                cpuPercent: 2.5,
                ramMb: 45.2,
                vramMb: 512,
                threadsCount: 6,
                errorCount: 0,
                totalRequests: 0,
                averageResponseTimeMs: 12.4,
                uptimeSeconds: 10,
                documentationScore: 95,
                testQualityScore: 88
            },
            bootstrapTimeMs: 85,
            lastStateChange: new Date().toISOString()
        };

        esb.registerService(newService);
        const fetched = esb.getService("CustomAIPlugin");
        if (!fetched || fetched.contract.version !== "1.2.0") {
            throw new Error("Failed to register or retrieve CustomAIPlugin dynamically.");
        }
        console.log("[ESB Test] Dynamic Service Registration passed.");

        // 3. Test Dependency Graph & Validation Check
        const graphCheck = esb.analyzeDependencyGraph();
        if (!graphCheck.isValid) {
            throw new Error(`Dependency graph should be valid but returned errors: ${graphCheck.errors.join(", ")}`);
        }
        console.log("[ESB Test] Dependency graph analysis validated (No cycles or missing modules).");

        // 4. Test Circular Dependency detection
        const badService: ESBService = {
            contract: {
                id: "srv-cyclic-1",
                name: "CyclicA",
                version: "1.0.0",
                dependencies: ["CyclicB"],
                permissions: [],
                supportedEvents: [],
                apis: [],
                license: "Proprietary",
                checksum: "0x0",
                digitalSignature: "SIG_CYCLIC"
            },
            state: "Running",
            telemetry: { cpuPercent: 0, ramMb: 1, vramMb: 0, threadsCount: 1, errorCount: 0, totalRequests: 0, averageResponseTimeMs: 0, uptimeSeconds: 1, documentationScore: 50, testQualityScore: 50 },
            bootstrapTimeMs: 5,
            lastStateChange: new Date().toISOString()
        };

        const badService2: ESBService = {
            contract: {
                id: "srv-cyclic-2",
                name: "CyclicB",
                version: "1.0.0",
                dependencies: ["CyclicA"],
                permissions: [],
                supportedEvents: [],
                apis: [],
                license: "Proprietary",
                checksum: "0x0",
                digitalSignature: "SIG_CYCLIC"
            },
            state: "Running",
            telemetry: { cpuPercent: 0, ramMb: 1, vramMb: 0, threadsCount: 1, errorCount: 0, totalRequests: 0, averageResponseTimeMs: 0, uptimeSeconds: 1, documentationScore: 50, testQualityScore: 50 },
            bootstrapTimeMs: 5,
            lastStateChange: new Date().toISOString()
        };

        esb.registerService(badService);
        esb.registerService(badService2);

        const circularCheck = esb.analyzeDependencyGraph();
        if (circularCheck.isValid) {
            throw new Error("Dependency analyzer failed to catch the circular dependency cycle.");
        }
        console.log(`[ESB Test] Circular dependency test passed successfully. Caught errors: ${circularCheck.errors.join("; ")}`);

        // Cleanup circular bad services
        // @ts-ignore
        esb.services.delete("cyclica");
        // @ts-ignore
        esb.services.delete("cyclicb");

        // 5. Test ESB Message Routing
        const message: ESBMessage = {
            id: `msg-${Date.now()}`,
            correlationId: `corr-${Date.now()}`,
            origin: "Kernel",
            destination: "CustomAIPlugin",
            payload: { action: "processTask", data: { text: "Hello AI Hub" } },
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            priority: "High",
            requiredPermissions: ["system:monitor"],
            timeoutMs: 5000,
            retryCount: 0,
            maxRetries: 3
        };

        const routeResult = await esb.routeMessage(message);
        if (!routeResult.success) {
            throw new Error("Message routing failed or returned failure status.");
        }
        console.log("[ESB Test] Message routing passed successfully.");

        // 6. Test Fault Isolation & Auto Recovery
        const faultyMessage: ESBMessage = {
            id: `msg-fail-${Date.now()}`,
            correlationId: `corr-fail-${Date.now()}`,
            origin: "Kernel",
            destination: "CustomAIPlugin",
            payload: { action: "processTask", forceFail: true },
            version: "1.0.0",
            timestamp: new Date().toISOString(),
            priority: "High",
            requiredPermissions: [],
            timeoutMs: 5000,
            retryCount: 0,
            maxRetries: 3
        };

        const recoveryResult = await esb.routeMessage(faultyMessage);
        if (!recoveryResult.includes("Auto Recovered")) {
            throw new Error("Fault Isolation & Recovery engine failed to self-heal the simulated service crash.");
        }
        console.log("[ESB Test] Fault Isolation & Auto Recovery validated successfully.");

        // 7. Test Hot Reload
        const reloadSuccess = await esb.hotReloadService("CustomAIPlugin");
        if (!reloadSuccess) {
            throw new Error("Hot Reload of CustomAIPlugin failed.");
        }
        console.log("[ESB Test] Hot Reload system validated successfully.");

        // 8. Test Health Score Calculation
        const customScore = esb.calculateHealthScore(newService);
        if (customScore < 0 || customScore > 100) {
            throw new Error(`Calculated health score out of expected bounds: ${customScore}`);
        }
        console.log(`[ESB Test] Health Score engine calculated: ${customScore}%`);

        console.log("[ESB Test] All ESB & Microkernel unit tests executed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[ESB Test] Test suite failed: ${e.message}`);
        return false;
    }
}
