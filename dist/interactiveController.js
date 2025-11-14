import { Position } from './types.js';
export class InteractiveController {
    constructor(canvas, config, renderCallback, translateX = 0, translateY = 0) {
        this.lineupData = null;
        this.playerCoordinates = [];
        this.customCoordinates = new Map();
        this.dragState = null;
        this.isDragging = false;
        this.canvasTranslateX = 0;
        this.canvasTranslateY = 0;
        this.handleMouseDown = (event) => {
            const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
            const player = this.findPlayerAtPosition(coords.x, coords.y);
            if (player) {
                this.dragState = {
                    player: player.player,
                    isHomeTeam: player.isHomeTeam,
                    offsetX: coords.x - player.coordinates.x,
                    offsetY: coords.y - player.coordinates.y,
                };
                this.isDragging = true;
                this.canvas.style.cursor = 'grabbing';
                event.preventDefault();
            }
        };
        this.handleMouseMove = (event) => {
            const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
            if (this.isDragging && this.dragState) {
                // Update custom coordinates - store directly in canvas space
                // Custom coordinates are applied AFTER all transformations in render functions
                const newX = coords.x - this.dragState.offsetX;
                const newY = coords.y - this.dragState.offsetY;
                const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
                this.customCoordinates.set(key, { x: newX, y: newY });
                // Trigger re-render
                this.renderCallback();
                event.preventDefault();
            }
            else {
                // Update cursor based on whether we're hovering over a player
                const player = this.findPlayerAtPosition(coords.x, coords.y);
                this.canvas.style.cursor = player ? 'grab' : 'default';
            }
        };
        this.handleMouseUp = (event) => {
            if (this.isDragging && this.dragState) {
                const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
                const newX = coords.x - this.dragState.offsetX;
                const newY = coords.y - this.dragState.offsetY;
                // Call the onPlayerMove callback if provided
                if (this.config.onPlayerMove) {
                    this.config.onPlayerMove(this.dragState.player.player.id, this.dragState.player.team, newX, newY);
                }
                this.isDragging = false;
                this.dragState = null;
                // Update cursor
                const player = this.findPlayerAtPosition(coords.x, coords.y);
                this.canvas.style.cursor = player ? 'grab' : 'default';
            }
        };
        this.handleTouchStart = (event) => {
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
                const player = this.findPlayerAtPosition(coords.x, coords.y);
                if (player) {
                    this.dragState = {
                        player: player.player,
                        isHomeTeam: player.isHomeTeam,
                        offsetX: coords.x - player.coordinates.x,
                        offsetY: coords.y - player.coordinates.y,
                    };
                    this.isDragging = true;
                    event.preventDefault();
                }
            }
        };
        this.handleTouchMove = (event) => {
            if (this.isDragging && this.dragState && event.touches.length === 1) {
                const touch = event.touches[0];
                const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
                // Update custom coordinates - store directly in canvas space
                const newX = coords.x - this.dragState.offsetX;
                const newY = coords.y - this.dragState.offsetY;
                const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
                this.customCoordinates.set(key, { x: newX, y: newY });
                // Trigger re-render
                this.renderCallback();
                event.preventDefault();
            }
        };
        this.handleTouchEnd = (event) => {
            if (this.isDragging && this.dragState) {
                // Use the last known position from customCoordinates
                const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
                const coords = this.customCoordinates.get(key);
                if (coords && this.config.onPlayerMove) {
                    this.config.onPlayerMove(this.dragState.player.player.id, this.dragState.player.team, coords.x, coords.y);
                }
                this.isDragging = false;
                this.dragState = null;
            }
        };
        this.canvas = canvas;
        this.config = config;
        this.renderCallback = renderCallback;
        this.canvasTranslateX = translateX;
        this.canvasTranslateY = translateY;
        if (this.config.interactive) {
            this.attachEventListeners();
        }
    }
    attachEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart);
        this.canvas.addEventListener('touchmove', this.handleTouchMove);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd);
        // Change cursor when hovering over players
        this.canvas.style.cursor = 'default';
    }
    detachEventListeners() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
    updatePlayerCoordinates(coordinates) {
        this.playerCoordinates = coordinates;
    }
    updateLineupData(lineupData) {
        this.lineupData = lineupData;
    }
    getCustomCoordinates() {
        return this.customCoordinates;
    }
    setCustomCoordinate(playerId, team, coordinates) {
        const key = `${team}-${playerId}`;
        this.customCoordinates.set(key, coordinates);
    }
    clearCustomCoordinates() {
        this.customCoordinates.clear();
    }
    getCanvasCoordinates(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX - this.canvasTranslateX,
            y: (clientY - rect.top) * scaleY - this.canvasTranslateY,
        };
    }
    findPlayerAtPosition(x, y) {
        const radius = this.config.playerCircleSize;
        // Check in reverse order so that players drawn on top are selected first
        for (let i = this.playerCoordinates.length - 1; i >= 0; i--) {
            const playerData = this.playerCoordinates[i];
            // Skip substitutes
            if (playerData.player.position === Position.SUBSTITUTE) {
                continue;
            }
            const dx = x - playerData.coordinates.x;
            const dy = y - playerData.coordinates.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= radius) {
                return playerData;
            }
        }
        return null;
    }
}
