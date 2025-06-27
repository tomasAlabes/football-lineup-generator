import type { PlayerPositioning, FieldCoordinates } from '../types.js';

interface PlayerWithCoordinates {
  player: PlayerPositioning;
  coordinates: FieldCoordinates;
}

interface LabelPosition {
  player: PlayerPositioning;
  coordinates: FieldCoordinates;
  shouldPlaceLabelAbove: boolean;
}

export function calculateLabelPositions(
  playersWithCoords: PlayerWithCoordinates[],
  allPlayersWithCoords?: PlayerWithCoordinates[] // Optional parameter for cross-team analysis
): LabelPosition[] {
  const proximityThreshold = 60; // Distance threshold for considering players "close"
  
  // Use all players for proximity detection if provided (for cross-team analysis)
  const proximityPlayerSet = allPlayersWithCoords || playersWithCoords;
  
      return playersWithCoords.map((currentPlayer, index) => {
      // Find nearby players (could be from same team or opposing team)
      const nearbyPlayers = proximityPlayerSet.filter((otherPlayer) => {
        // Skip self comparison by checking for exact object reference
        if (currentPlayer.player === otherPlayer.player) return false;
        
        const distance = Math.sqrt(
          (currentPlayer.coordinates.x - otherPlayer.coordinates.x) ** 2 +
          (currentPlayer.coordinates.y - otherPlayer.coordinates.y) ** 2
        );
        
        return distance <= proximityThreshold;
      });
      
      // If no nearby players, use default positioning (below)
      if (nearbyPlayers.length === 0) {
        return {
          ...currentPlayer,
          shouldPlaceLabelAbove: false
        };
      }
      
      // Analyze proximity type: horizontal vs vertical
      const horizontalProximityThreshold = 30; // Y difference threshold for "horizontal alignment"
      
      // Check if any nearby players are horizontally aligned (similar Y, different X)
      const hasHorizontallyAlignedPlayers = nearbyPlayers.some(nearby => {
        const yDifference = Math.abs(currentPlayer.coordinates.y - nearby.coordinates.y);
        const xDifference = Math.abs(currentPlayer.coordinates.x - nearby.coordinates.x);
        return yDifference <= horizontalProximityThreshold && xDifference > horizontalProximityThreshold;
      });
      
      if (hasHorizontallyAlignedPlayers) {
        // For horizontally aligned players, alternate labels above/below based on X position
        // Players on the left side get labels above, players on the right get labels below
        const leftmostNearbyPlayer = nearbyPlayers.reduce((leftmost, current) => {
          return current.coordinates.x < leftmost.coordinates.x ? current : leftmost;
        }, nearbyPlayers[0]);
        
        // If current player is to the left of the leftmost nearby player, place label above
        // Otherwise place below
        const shouldPlaceAbove = currentPlayer.coordinates.x < leftmostNearbyPlayer.coordinates.x;
        
        return {
          ...currentPlayer,
          shouldPlaceLabelAbove: shouldPlaceAbove
        };
      }
      
      // For vertically aligned players, use original Y-coordinate logic
      // The player with the higher Y value (lower on screen) keeps label below
      // The player with the lower Y value (higher on screen) gets label above
      const hasPlayerBelow = nearbyPlayers.some(
        nearby => nearby.coordinates.y > currentPlayer.coordinates.y
      );
      
      return {
        ...currentPlayer,
        shouldPlaceLabelAbove: hasPlayerBelow
      };
    });
} 