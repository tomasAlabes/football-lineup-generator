import { LayoutType, SubstitutesPosition } from './types.js';
// Import all the extracted functions
import { renderFullPitch } from './functions/renderFullPitch.js';
import { renderHalfPitch } from './functions/renderHalfPitch.js';
import { renderSplitPitch } from './functions/renderSplitPitch.js';
// Import interactive controller
import { InteractiveController } from './interactiveController.js';
export class FootballLineupRenderer {
    constructor(canvas, config = {}) {
        this.interactiveController = null;
        this.lineupData = null;
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;
        // Normalize showSubstitutes config
        let substitutesConfig;
        if (typeof config.showSubstitutes === 'boolean') {
            substitutesConfig = {
                enabled: config.showSubstitutes,
                position: SubstitutesPosition.BOTTOM,
            };
        }
        else if (config.showSubstitutes) {
            substitutesConfig = config.showSubstitutes;
        }
        else {
            substitutesConfig = {
                enabled: false,
                position: SubstitutesPosition.BOTTOM,
            };
        }
        // Default configuration with smaller player circles
        this.config = {
            width: config.width ?? 800,
            height: config.height ?? 600,
            layoutType: config.layoutType ?? LayoutType.FULL_PITCH,
            showPlayerNames: config.showPlayerNames ?? true,
            showJerseyNumbers: config.showJerseyNumbers ?? true,
            showSubstitutes: substitutesConfig,
            fieldColor: config.fieldColor ?? '#4CAF50',
            lineColor: config.lineColor ?? '#FFFFFF',
            homeTeamColor: config.homeTeamColor ?? '#FF5722',
            awayTeamColor: config.awayTeamColor ?? '#2196F3',
            fontSize: config.fontSize ?? 12,
            playerCircleSize: config.playerCircleSize ?? 16, // Reduced from 20 to 16
            interactive: config.interactive ?? false,
            onPlayerMove: config.onPlayerMove,
        };
        // Adjust canvas size for split pitch layout
        if (this.config.layoutType === LayoutType.SPLIT_PITCH) {
            // For rotated split pitch: arrange side by side with rotated dimensions
            this.canvas.width = this.config.height * 2 + 60; // Two rotated pitches side by side
            this.canvas.height = this.config.width; // Rotated height becomes original width
        }
        else {
            this.canvas.width = this.config.width;
            this.canvas.height = this.config.height;
            // Add extra space for substitutes if enabled
            if (this.config.showSubstitutes.enabled) {
                if (this.config.showSubstitutes.position === SubstitutesPosition.BOTTOM) {
                    this.canvas.height += 120; // Add space for substitute lists (60px per team)
                }
                else if (this.config.showSubstitutes.position === SubstitutesPosition.LEFT) {
                    this.canvas.width += 180; // Add space on the left
                    // Shift the entire canvas context to the right to make room for left substitutes
                    this.ctx.translate(180, 0);
                }
                else if (this.config.showSubstitutes.position === SubstitutesPosition.RIGHT) {
                    this.canvas.width += 180; // Add space on the right
                }
            }
        }
        // Initialize interactive controller if interactive mode is enabled
        if (this.config.interactive) {
            // Calculate translation offset for substitutes on the left
            let translateX = 0;
            let translateY = 0;
            if (this.config.layoutType !== LayoutType.SPLIT_PITCH &&
                this.config.showSubstitutes.enabled &&
                this.config.showSubstitutes.position === SubstitutesPosition.LEFT) {
                translateX = 180;
            }
            this.interactiveController = new InteractiveController(this.canvas, this.config, () => this.render(this.lineupData), translateX, translateY);
        }
    }
    render(lineupData) {
        // Store lineup data for re-rendering
        this.lineupData = lineupData;
        // Clear canvas - need to account for any translation
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        // Get custom coordinates if in interactive mode
        const customCoordinates = this.interactiveController?.getCustomCoordinates();
        let playerCoordinates = [];
        switch (this.config.layoutType) {
            case LayoutType.FULL_PITCH:
                playerCoordinates = renderFullPitch(this.ctx, lineupData, this.config, customCoordinates);
                break;
            case LayoutType.HALF_PITCH:
                playerCoordinates = renderHalfPitch(this.ctx, lineupData, this.config, customCoordinates);
                break;
            case LayoutType.SPLIT_PITCH:
                playerCoordinates = renderSplitPitch(this.ctx, lineupData, this.config, customCoordinates);
                break;
        }
        // Update interactive controller with player coordinates
        if (this.interactiveController) {
            this.interactiveController.updatePlayerCoordinates(playerCoordinates);
            this.interactiveController.updateLineupData(lineupData);
        }
    }
    destroy() {
        if (this.interactiveController) {
            this.interactiveController.detachEventListeners();
        }
    }
    getCustomCoordinates() {
        return this.interactiveController?.getCustomCoordinates();
    }
    setCustomCoordinate(playerId, team, x, y) {
        if (this.interactiveController) {
            this.interactiveController.setCustomCoordinate(playerId, team, { x, y });
            if (this.lineupData) {
                this.render(this.lineupData);
            }
        }
    }
    clearCustomCoordinates() {
        if (this.interactiveController) {
            this.interactiveController.clearCustomCoordinates();
            if (this.lineupData) {
                this.render(this.lineupData);
            }
        }
    }
}
