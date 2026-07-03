import { ConfigManager } from "./ConfigManager";

export function runTests(): boolean {
    console.log("[Config Test] Running ConfigManager unit tests...");
    const configManager = ConfigManager.getInstance();
    
    try {
        const config = configManager.getConfig();
        if (typeof config.sistema.env !== "string" || isNaN(config.sistema.port)) {
            throw new Error("Invalid configuration properties loaded under 'sistema'.");
        }
        
        const sistema = configManager.get("sistema");
        if (sistema.port !== config.sistema.port) {
            throw new Error("Category getter discrepancy.");
        }
        
        // Test update
        configManager.updateConfig("ui", { theme: "dark" }, "test_runner");
        if (configManager.get("ui").theme !== "dark") {
            throw new Error("Configuration update failed.");
        }

        // Test export
        const exported = configManager.exportConfig();
        if (!exported.includes("AIHub Enterprise") || !exported.includes("dark")) {
            throw new Error("Configuration export format invalid.");
        }
        
        console.log("[Config Test] All ConfigManager unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Config Test] Test failed: ${e.message}`);
        return false;
    }
}
