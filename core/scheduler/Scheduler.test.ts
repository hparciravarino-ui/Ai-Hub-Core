import { Scheduler } from "./Scheduler";

export function runTests(): Promise<boolean> {
    console.log("[Scheduler Test] Running Scheduler unit tests...");
    const scheduler = Scheduler.getInstance();
    scheduler.clear();
    
    return new Promise((resolve) => {
        try {
            const job = scheduler.submitJob("backup", { filepath: "/data/backup.zip" });
            if (job.status !== "queued") {
                throw new Error("Job status should initially be queued.");
            }
            
            setTimeout(() => {
                const updatedJob = scheduler.getJob(job.id);
                if (!updatedJob) {
                    throw new Error("Job was not found in the scheduler repository.");
                }
                
                console.log(`[Scheduler Test] Job current status: ${updatedJob.status}, progress: ${updatedJob.progress}%`);
                console.log("[Scheduler Test] All Scheduler unit tests passed successfully.");
                resolve(true);
            }, 250);
            
        } catch (e: any) {
            console.error(`[Scheduler Test] Test failed: ${e.message}`);
            resolve(false);
        }
    });
}
