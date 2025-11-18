import type { RecordingOptions } from './types.js';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export class RecordingController {
  private canvas: HTMLCanvasElement;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private state: RecordingState = 'idle';
  private options: RecordingOptions;
  private onStateChange?: (state: RecordingState) => void;

  constructor(
    canvas: HTMLCanvasElement,
    options?: RecordingOptions,
    onStateChange?: (state: RecordingState) => void
  ) {
    this.canvas = canvas;
    this.options = {
      fps: options?.fps ?? 30,
      videoBitsPerSecond: options?.videoBitsPerSecond ?? 2500000, // 2.5 Mbps default
    };
    this.onStateChange = onStateChange;
  }

  /**
   * Start recording the canvas
   */
  public startRecording(): void {
    if (this.state === 'recording') {
      console.warn('Recording is already in progress');
      return;
    }

    // Reset recorded chunks
    this.recordedChunks = [];

    // Capture the canvas as a media stream
    // @ts-ignore - captureStream is supported but TypeScript may not have the complete definition
    this.stream = this.canvas.captureStream(this.options.fps);

    if (!this.stream) {
      console.error('Failed to capture canvas stream');
      return;
    }

    // Determine the best supported MIME type
    const mimeType = this.getSupportedMimeType();

    if (!mimeType) {
      console.error('No supported video MIME type found');
      return;
    }

    // Create MediaRecorder with the stream
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: this.options.videoBitsPerSecond,
      });

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Handle recording stop event
      this.mediaRecorder.onstop = () => {
        this.setState('stopped');
      };

      // Handle errors
      this.mediaRecorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        this.stopRecording();
      };

      // Start recording
      this.mediaRecorder.start(100); // Request data every 100ms
      this.setState('recording');
    } catch (error) {
      console.error('Failed to create MediaRecorder:', error);
    }
  }

  /**
   * Pause the recording
   */
  public pauseRecording(): void {
    if (this.state !== 'recording') {
      console.warn('Cannot pause - not currently recording');
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.setState('paused');
    }
  }

  /**
   * Resume the recording
   */
  public resumeRecording(): void {
    if (this.state !== 'paused') {
      console.warn('Cannot resume - recording is not paused');
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.setState('recording');
    }
  }

  /**
   * Stop the recording
   */
  public stopRecording(): void {
    if (this.state !== 'recording' && this.state !== 'paused') {
      console.warn('Cannot stop - not currently recording');
      return;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();

      // Stop all tracks in the stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  /**
   * Download the recorded video
   */
  public downloadRecording(filename: string = 'lineup-recording.webm'): void {
    if (this.recordedChunks.length === 0) {
      console.warn('No recording available to download');
      return;
    }

    // Create a blob from the recorded chunks
    const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
    const blob = new Blob(this.recordedChunks, { type: mimeType });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Get the recorded video as a Blob
   */
  public getRecordingBlob(): Blob | null {
    if (this.recordedChunks.length === 0) {
      return null;
    }

    const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
    return new Blob(this.recordedChunks, { type: mimeType });
  }

  /**
   * Clear the recorded data
   */
  public clearRecording(): void {
    this.recordedChunks = [];
    this.setState('idle');
  }

  /**
   * Get the current recording state
   */
  public getState(): RecordingState {
    return this.state;
  }

  /**
   * Check if currently recording
   */
  public isRecording(): boolean {
    return this.state === 'recording';
  }

  /**
   * Check if recording is paused
   */
  public isPaused(): boolean {
    return this.state === 'paused';
  }

  /**
   * Destroy the controller and clean up resources
   */
  public destroy(): void {
    if (this.mediaRecorder && (this.state === 'recording' || this.state === 'paused')) {
      this.stopRecording();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  /**
   * Get the best supported MIME type for recording
   */
  private getSupportedMimeType(): string | null {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Set the state and notify listeners
   */
  private setState(state: RecordingState): void {
    this.state = state;
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }
}
