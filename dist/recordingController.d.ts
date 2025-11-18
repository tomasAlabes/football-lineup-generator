import type { RecordingOptions } from './types.js';
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
export declare class RecordingController {
    private canvas;
    private mediaRecorder;
    private recordedChunks;
    private stream;
    private state;
    private options;
    private onStateChange?;
    constructor(canvas: HTMLCanvasElement, options?: RecordingOptions, onStateChange?: (state: RecordingState) => void);
    /**
     * Start recording the canvas
     */
    startRecording(): void;
    /**
     * Pause the recording
     */
    pauseRecording(): void;
    /**
     * Resume the recording
     */
    resumeRecording(): void;
    /**
     * Stop the recording
     */
    stopRecording(): void;
    /**
     * Download the recorded video
     */
    downloadRecording(filename?: string): void;
    /**
     * Get the recorded video as a Blob
     */
    getRecordingBlob(): Blob | null;
    /**
     * Clear the recorded data
     */
    clearRecording(): void;
    /**
     * Get the current recording state
     */
    getState(): RecordingState;
    /**
     * Check if currently recording
     */
    isRecording(): boolean;
    /**
     * Check if recording is paused
     */
    isPaused(): boolean;
    /**
     * Destroy the controller and clean up resources
     */
    destroy(): void;
    /**
     * Get the best supported MIME type for recording
     */
    private getSupportedMimeType;
    /**
     * Set the state and notify listeners
     */
    private setState;
}
