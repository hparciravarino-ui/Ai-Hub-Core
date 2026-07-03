import { ProjectAnalyzer } from "./ProjectAnalyzer";

export async function runTests(): Promise<boolean> {
    console.log("[Analyzer Test] Running ProjectAnalyzer unit tests...");
    const analyzer = new ProjectAnalyzer();
    await analyzer.initialize();
    
    try {
        const summary = await analyzer.analyzeWorkspace(".");
        if (summary.filesScanned <= 0 || !summary.framework) {
            throw new Error("Expected workspace analysis to scan files and recognize runtime structure.");
        }
        
        console.log(`[Analyzer Test] Project Framework: ${summary.framework}, Scanned ${summary.filesScanned} files successfully.`);
        console.log("[Analyzer Test] All ProjectAnalyzer unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Analyzer Test] Test failed: ${e.message}`);
        return false;
    }
}
