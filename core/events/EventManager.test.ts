import { EventManager } from "./EventManager";

export function runTests(): boolean {
    console.log("[Events Test] Running EventManager unit tests...");
    const eventManager = EventManager.getInstance();
    eventManager.clear();
    
    let receivedData: string | null = null;
    const testCallback = (data: any) => {
        receivedData = data;
    };
    
    try {
        eventManager.subscribe("test_event", testCallback);
        eventManager.publish("test_event", "hello_world");
        
        if (receivedData !== "hello_world") {
            throw new Error(`Expected received data to be 'hello_world', but got: ${receivedData}`);
        }
        
        eventManager.unsubscribe("test_event", testCallback);
        receivedData = null;
        eventManager.publish("test_event", "hello_again");
        
        if (receivedData !== null) {
            throw new Error("Callback was invoked after unsubscribe.");
        }
        
        console.log("[Events Test] All EventManager unit tests passed successfully.");
        return true;
    } catch (e: any) {
        console.error(`[Events Test] Test failed: ${e.message}`);
        return false;
    }
}
