export class RecordingUI {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.config = {
            position: config.position ?? 'top-right',
            theme: config.theme ?? 'light'
        };
        // Create UI elements
        this.uiContainer = this.createContainer();
        this.controlsContainer = this.createControlsContainer();
        this.startBtn = this.createButton('⏺ Start', '#f44336');
        this.pauseBtn = this.createButton('⏸ Pause', '#ff9800');
        this.resumeBtn = this.createButton('▶ Resume', '#4CAF50');
        this.stopBtn = this.createButton('⏹ Stop', '#9E9E9E');
        this.downloadBtn = this.createButton('⬇ Download', '#2196F3');
        this.statusIndicator = this.createStatusIndicator();
        // Add buttons to container
        this.controlsContainer.appendChild(this.startBtn);
        this.controlsContainer.appendChild(this.pauseBtn);
        this.controlsContainer.appendChild(this.resumeBtn);
        this.controlsContainer.appendChild(this.stopBtn);
        this.controlsContainer.appendChild(this.downloadBtn);
        this.controlsContainer.appendChild(this.statusIndicator);
        this.uiContainer.appendChild(this.controlsContainer);
        // Ensure canvas parent has relative positioning
        this.ensureCanvasParentPositioning();
        // Insert UI into canvas parent
        const canvasParent = this.canvas.parentElement;
        if (canvasParent) {
            canvasParent.appendChild(this.uiContainer);
        }
        else {
            document.body.appendChild(this.uiContainer);
        }
        // Set initial button states
        this.updateButtonStates('idle');
        // Bind event listeners
        this.attachEventListeners();
    }
    ensureCanvasParentPositioning() {
        const canvasParent = this.canvas.parentElement;
        if (canvasParent) {
            const currentPosition = window.getComputedStyle(canvasParent).position;
            if (currentPosition === 'static') {
                canvasParent.style.position = 'relative';
            }
        }
    }
    createContainer() {
        const container = document.createElement('div');
        container.style.cssText = `
      position: absolute;
      ${this.getPositionStyles()}
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 14px;
      pointer-events: auto;
    `;
        return container;
    }
    getPositionStyles() {
        // Position controls just outside the canvas edges with minimal gap
        const gap = '8px';
        switch (this.config.position) {
            case 'top':
                return `top: ${gap}; left: 50%; transform: translateX(-50%);`;
            case 'bottom':
                return `bottom: ${gap}; left: 50%; transform: translateX(-50%);`;
            case 'top-left':
                return `top: ${gap}; left: ${gap};`;
            case 'top-right':
                return `top: ${gap}; right: ${gap};`;
            case 'bottom-left':
                return `bottom: ${gap}; left: ${gap};`;
            case 'bottom-right':
                return `bottom: ${gap}; right: ${gap};`;
            default:
                return `top: ${gap}; right: ${gap};`;
        }
    }
    createControlsContainer() {
        const container = document.createElement('div');
        const bgColor = this.config.theme === 'dark' ? '#333' : '#fff';
        const textColor = this.config.theme === 'dark' ? '#fff' : '#333';
        container.style.cssText = `
      background: ${bgColor};
      color: ${textColor};
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    `;
        return container;
    }
    createButton(label, color) {
        const button = document.createElement('button');
        button.textContent = label;
        button.style.cssText = `
      background: ${color};
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: opacity 0.2s;
      display: none;
    `;
        button.addEventListener('mouseenter', () => {
            button.style.opacity = '0.9';
        });
        button.addEventListener('mouseleave', () => {
            button.style.opacity = '1';
        });
        return button;
    }
    createStatusIndicator() {
        const indicator = document.createElement('span');
        indicator.style.cssText = `
      margin-left: 8px;
      font-weight: 600;
      font-size: 13px;
      display: none;
    `;
        return indicator;
    }
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.onStart?.());
        this.pauseBtn.addEventListener('click', () => this.onPause?.());
        this.resumeBtn.addEventListener('click', () => this.onResume?.());
        this.stopBtn.addEventListener('click', () => this.onStop?.());
        this.downloadBtn.addEventListener('click', () => this.onDownload?.());
    }
    setCallbacks(callbacks) {
        this.onStart = callbacks.onStart;
        this.onPause = callbacks.onPause;
        this.onResume = callbacks.onResume;
        this.onStop = callbacks.onStop;
        this.onDownload = callbacks.onDownload;
    }
    updateState(state) {
        this.updateButtonStates(state);
        this.updateStatusIndicator(state);
    }
    updateButtonStates(state) {
        // Hide all buttons first
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'none';
        this.resumeBtn.style.display = 'none';
        this.stopBtn.style.display = 'none';
        this.downloadBtn.style.display = 'none';
        this.statusIndicator.style.display = 'none';
        switch (state) {
            case 'idle':
                this.startBtn.style.display = 'inline-block';
                break;
            case 'recording':
                this.pauseBtn.style.display = 'inline-block';
                this.stopBtn.style.display = 'inline-block';
                this.statusIndicator.style.display = 'inline-block';
                break;
            case 'paused':
                this.resumeBtn.style.display = 'inline-block';
                this.stopBtn.style.display = 'inline-block';
                this.statusIndicator.style.display = 'inline-block';
                break;
            case 'stopped':
                this.startBtn.style.display = 'inline-block';
                this.downloadBtn.style.display = 'inline-block';
                this.statusIndicator.style.display = 'inline-block';
                break;
        }
    }
    updateStatusIndicator(state) {
        switch (state) {
            case 'idle':
                this.statusIndicator.textContent = '';
                break;
            case 'recording':
                this.statusIndicator.textContent = '🔴 Recording...';
                this.statusIndicator.style.color = '#f44336';
                break;
            case 'paused':
                this.statusIndicator.textContent = '⏸ Paused';
                this.statusIndicator.style.color = '#ff9800';
                break;
            case 'stopped':
                this.statusIndicator.textContent = '✓ Stopped';
                this.statusIndicator.style.color = '#4CAF50';
                break;
        }
    }
    show() {
        this.uiContainer.style.display = 'block';
    }
    hide() {
        this.uiContainer.style.display = 'none';
    }
    destroy() {
        this.uiContainer.remove();
    }
}
