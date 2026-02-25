import { Position } from './types.js';
export class InteractiveController {
    constructor(canvas, config, renderCallback, translateX = 0, translateY = 0) {
        this.lineupData = null;
        this.playerCoordinates = [];
        this.customCoordinates = new Map();
        this.dragState = null;
        this.ballDragState = null;
        this.ballPosition = null;
        this.isDragging = false;
        this.canvasTranslateX = 0;
        this.canvasTranslateY = 0;
        this.handleMouseDown = (event) => {
            const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
            // Check for ball first (ball has priority over players)
            if (this.isBallAtPosition(coords.x, coords.y) && this.ballPosition) {
                this.ballDragState = {
                    isBall: true,
                    offsetX: coords.x - this.ballPosition.x,
                    offsetY: coords.y - this.ballPosition.y,
                };
                this.isDragging = true;
                this.canvas.style.cursor = 'grabbing';
                event.preventDefault();
                return;
            }
            // Check for players
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
            if (this.isDragging && this.ballDragState) {
                // Dragging the ball
                const newX = coords.x - this.ballDragState.offsetX;
                const newY = coords.y - this.ballDragState.offsetY;
                this.ballPosition = { x: newX, y: newY };
                // Trigger re-render
                this.renderCallback();
                event.preventDefault();
            }
            else if (this.isDragging && this.dragState) {
                // Dragging a player
                const newX = coords.x - this.dragState.offsetX;
                const newY = coords.y - this.dragState.offsetY;
                const key = `${this.dragState.player.team}-${this.dragState.player.player.id}`;
                this.customCoordinates.set(key, { x: newX, y: newY });
                // Trigger re-render
                this.renderCallback();
                event.preventDefault();
            }
            else {
                // Update cursor based on whether we're hovering over a player or ball
                const isBall = this.isBallAtPosition(coords.x, coords.y);
                const player = this.findPlayerAtPosition(coords.x, coords.y);
                this.canvas.style.cursor = (isBall || player) ? 'grab' : 'default';
            }
        };
        this.handleMouseUp = (event) => {
            if (this.isDragging && this.ballDragState) {
                // Ball drag ended
                const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
                const newX = coords.x - this.ballDragState.offsetX;
                const newY = coords.y - this.ballDragState.offsetY;
                // Call the onBallMove callback if provided
                if (this.config.onBallMove) {
                    this.config.onBallMove(newX, newY);
                }
                this.isDragging = false;
                this.ballDragState = null;
                // Update cursor
                const isBall = this.isBallAtPosition(coords.x, coords.y);
                const player = this.findPlayerAtPosition(coords.x, coords.y);
                this.canvas.style.cursor = (isBall || player) ? 'grab' : 'default';
            }
            else if (this.isDragging && this.dragState) {
                // Player drag ended
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
                const isBall = this.isBallAtPosition(coords.x, coords.y);
                const player = this.findPlayerAtPosition(coords.x, coords.y);
                this.canvas.style.cursor = (isBall || player) ? 'grab' : 'default';
            }
        };
        this.handleTouchStart = (event) => {
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
                // Check for ball first
                if (this.isBallAtPosition(coords.x, coords.y) && this.ballPosition) {
                    this.ballDragState = {
                        isBall: true,
                        offsetX: coords.x - this.ballPosition.x,
                        offsetY: coords.y - this.ballPosition.y,
                    };
                    this.isDragging = true;
                    event.preventDefault();
                    return;
                }
                // Check for players
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
            if (event.touches.length !== 1) {
                return;
            }
            const touch = event.touches[0];
            const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
            if (this.isDragging && this.ballDragState) {
                // Dragging the ball
                const newX = coords.x - this.ballDragState.offsetX;
                const newY = coords.y - this.ballDragState.offsetY;
                this.ballPosition = { x: newX, y: newY };
                // Trigger re-render
                this.renderCallback();
                event.preventDefault();
            }
            else if (this.isDragging && this.dragState) {
                // Dragging a player
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
            if (this.isDragging && this.ballDragState) {
                // Ball drag ended
                if (this.ballPosition && this.config.onBallMove) {
                    this.config.onBallMove(this.ballPosition.x, this.ballPosition.y);
                }
                this.isDragging = false;
                this.ballDragState = null;
            }
            else if (this.isDragging && this.dragState) {
                // Player drag ended - use the last known position from customCoordinates
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
        // Initialize ball position if ball is enabled
        if (this.config.ball) {
            const ballConfig = typeof this.config.ball === 'boolean'
                ? { enabled: this.config.ball }
                : this.config.ball;
            this.ballPosition = {
                x: ballConfig.initialX ?? this.config.width / 2,
                y: ballConfig.initialY ?? this.config.height / 2
            };
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
    getAllPlayerPositions() {
        return this.playerCoordinates;
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
    getBallPosition() {
        return this.ballPosition;
    }
    setBallPosition(coordinates) {
        this.ballPosition = coordinates;
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
    isBallAtPosition(x, y) {
        if (!this.config.ball || !this.ballPosition) {
            return false;
        }
        const ballConfig = typeof this.config.ball === 'boolean'
            ? { enabled: this.config.ball }
            : this.config.ball;
        const ballSize = ballConfig.size ?? 10;
        const dx = x - this.ballPosition.x;
        const dy = y - this.ballPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= ballSize;
    }
}
