import { runTests as runLoggerTests } from "../core/logging/Logger.test";
import { runTests as runConfigTests } from "../core/configuration/ConfigManager.test";
import { runTests as runDITests } from "../core/dependency-injection/Container.test";
import { runTests as runLifecycleTests } from "../core/lifecycle/ErrorHandler.test";
import { runTests as runEventsTests } from "../core/events/EventManager.test";
import { runTests as runSchedulerTests } from "../core/scheduler/Scheduler.test";
import { runTests as runKernelTests } from "../core/kernel/Kernel.test";
import { runTests as runESBTests } from "../core/esb/EnterpriseServiceBus.test";
import { runTests as runUMALTests } from "../engines/umal/UMAL.test";
import { runTests as runIHALTests } from "../engines/ihal/IHAL.test";
import { runTests as runRuntimeTests } from "../engines/runtime/Runtime.test";
import { runTests as runInferenceTests } from "../engines/inference/Inference.test";
import { runTests as runOrchestrationTests } from "../engines/ai-orchestrator/AIOrchestrator.test";
import { runTests as runHardwareTests } from "../engines/hardware/Hardware.test";
import { runTests as runPerformanceTests } from "../engines/optimization/Performance.test";
import { runTests as runMemoryTests } from "../engines/memory/Memory.test";
import { runTests as runKnowledgeTests } from "../engines/knowledge/Knowledge.test";
import { runTests as runDigitalBrainTests } from "../engines/digital-brain/DigitalBrain.test";
import { runTests as runLearningTests } from "../engines/learning/Learning.test";
import { runTests as runProjectAnalyzerTests } from "../engines/project-analyzer/ProjectAnalyzer.test";
import { runTests as runSecurityTests } from "../engines/security/Security.test";
import { runTests as runGovernanceTests } from "../core/governance/GovernanceSystem.test";

async function executeAllTests() {
    console.log("==========================================");
    console.log("   AI-HUB ENTERPRISE UNIT TEST RUNNER     ");
    console.log("==========================================\n");

    let totalPassed = 0;
    let totalFailed = 0;

    const executeTest = async (name: string, testFn: () => any) => {
        try {
            const pass = await testFn();
            if (pass) {
                console.log(`[PASS] ${name}\n`);
                totalPassed++;
            } else {
                console.error(`[FAIL] ${name}\n`);
                totalFailed++;
            }
        } catch (e: any) {
            console.error(`[CRASH] ${name} threw exception: ${e.message}\n`);
            totalFailed++;
        }
    };

    // Run core tests
    await executeTest("Logging Module", runLoggerTests);
    await executeTest("Configuration Module", runConfigTests);
    await executeTest("Dependency Injection Container", runDITests);
    await executeTest("Lifecycle & Error Handler", runLifecycleTests);
    await executeTest("Event Bus Module", runEventsTests);
    await executeTest("Scheduler Queue Module", runSchedulerTests);
    await executeTest("Kernel Core Bootstrapper", runKernelTests);
    await executeTest("Enterprise Service Bus", runESBTests);

    // Run UMAL tests
    await executeTest("Universal Model Abstraction Layer", runUMALTests);

    // Run IHAL tests
    await executeTest("Intelligent Hardware Abstraction Layer", runIHALTests);

    // Run engines tests
    await executeTest("Model Runtime Module", runRuntimeTests);
    await executeTest("Inference Routing Module", runInferenceTests);
    await executeTest("AI Orchestrator Module", runOrchestrationTests);
    await executeTest("Hardware Telemetry Module", runHardwareTests);
    await executeTest("Performance & Optimization Module", runPerformanceTests);
    await executeTest("Memory Profile Module", runMemoryTests);
    await executeTest("Knowledge Vault & Retrieval", runKnowledgeTests);
    await executeTest("Digital Brain Context Memory", runDigitalBrainTests);
    await executeTest("Learning Engine Document Mapper", runLearningTests);
    await executeTest("Project Static Analyzer", runProjectAnalyzerTests);
    await executeTest("Security Sandbox & Hash Auditor", runSecurityTests);
    await executeTest("Governance & Quality Assurance (AAGQA)", runGovernanceTests);

    console.log("==========================================");
    console.log("              TEST RESULTS                ");
    console.log(`  Passed: ${totalPassed} / ${totalPassed + totalFailed}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log("==========================================");

    if (totalFailed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

executeAllTests();
