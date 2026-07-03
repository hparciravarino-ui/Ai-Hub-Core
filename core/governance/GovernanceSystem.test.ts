import { GovernanceSystem } from "./GovernanceSystem";

export async function runTests(): Promise<boolean> {
    console.log("[Governance Test] Running GovernanceSystem unit tests...");

    try {
        const gov = GovernanceSystem.getInstance();

        // 1. Check singleton instance
        if (!gov) {
            throw new Error("GovernanceSystem failed to load instance.");
        }

        // 2. Test audit execution
        const audit = gov.runQualityAudit();
        if (!audit || typeof audit.systemIntegrityScore !== "number") {
            throw new Error("Audit report generation failed or integrity score invalid.");
        }

        console.log(`[Governance Test] Completed. System Integrity Score: ${audit.systemIntegrityScore}/100.`);

        // 3. Test requirements traceability matrix
        const requirements = gov.getTraceabilityMatrix();
        if (!requirements || requirements.length === 0) {
            throw new Error("Traceability Matrix is empty.");
        }
        if (requirements[0].id !== "REQ-01-01") {
            throw new Error("Incorrect first requirement mapping.");
        }

        // 4. Test virtual roles verification
        const roles = gov.getVirtualRoleVerifications();
        if (!roles || roles.length !== 7) {
            throw new Error("Virtual roles size mismatch (Expected 7 roles).");
        }

        console.log("[Governance Test] All GovernanceSystem unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Governance Test Failed] Error: ${e.message}`);
        return false;
    }
}
