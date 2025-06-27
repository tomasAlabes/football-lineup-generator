// Advanced example showcasing new features: split pitch layout and background images
const { generateLineup, generateLineupFromPositioning, Team, Position, LayoutType } = require('./dist/index.js');

// Example with different layout types
async function demonstrateLayouts() {
  console.log('🏈 Advanced Football Lineup Generator Examples\n');

  const sampleLineupData = {
    homeTeam: {
      name: "Real Madrid",
      players: [
        { player: { id: 1, name: "Courtois", jerseyNumber: 1 }, team: Team.RED, position: Position.GOALKEEPER },
        { player: { id: 2, name: "Carvajal", jerseyNumber: 2 }, team: Team.RED, position: Position.RIGHT_BACK },
        { player: { id: 3, name: "Militão", jerseyNumber: 3 }, team: Team.RED, position: Position.CENTER_BACK },
        { player: { id: 4, name: "Alaba", jerseyNumber: 4 }, team: Team.RED, position: Position.CENTER_BACK },
        { player: { id: 5, name: "Mendy", jerseyNumber: 23 }, team: Team.RED, position: Position.LEFT_BACK },
        { player: { id: 6, name: "Casemiro", jerseyNumber: 14 }, team: Team.RED, position: Position.DEFENSIVE_MIDFIELDER },
        { player: { id: 7, name: "Modrić", jerseyNumber: 10 }, team: Team.RED, position: Position.CENTER_MIDFIELDER },
        { player: { id: 8, name: "Kroos", jerseyNumber: 8 }, team: Team.RED, position: Position.CENTER_MIDFIELDER },
        { player: { id: 9, name: "Valverde", jerseyNumber: 15 }, team: Team.RED, position: Position.RIGHT_WINGER },
        { player: { id: 10, name: "Benzema", jerseyNumber: 9 }, team: Team.RED, position: Position.CENTER_FORWARD },
        { player: { id: 11, name: "Vinícius Jr.", jerseyNumber: 20 }, team: Team.RED, position: Position.LEFT_WINGER },
      ]
    },
    awayTeam: {
      name: "Barcelona",
      players: [
        { player: { id: 12, name: "ter Stegen", jerseyNumber: 1 }, team: Team.YELLOW, position: Position.GOALKEEPER },
        { player: { id: 13, name: "Dest", jerseyNumber: 2 }, team: Team.YELLOW, position: Position.RIGHT_BACK },
        { player: { id: 14, name: "Araújo", jerseyNumber: 4 }, team: Team.YELLOW, position: Position.CENTER_BACK },
        { player: { id: 15, name: "Christensen", jerseyNumber: 15 }, team: Team.YELLOW, position: Position.CENTER_BACK },
        { player: { id: 16, name: "Alba", jerseyNumber: 18 }, team: Team.YELLOW, position: Position.LEFT_BACK },
        { player: { id: 17, name: "Busquets", jerseyNumber: 5 }, team: Team.YELLOW, position: Position.DEFENSIVE_MIDFIELDER },
        { player: { id: 18, name: "Pedri", jerseyNumber: 8 }, team: Team.YELLOW, position: Position.CENTER_MIDFIELDER },
        { player: { id: 19, name: "de Jong", jerseyNumber: 21 }, team: Team.YELLOW, position: Position.CENTER_MIDFIELDER },
        { player: { id: 20, name: "Dembélé", jerseyNumber: 7 }, team: Team.YELLOW, position: Position.RIGHT_WINGER },
        { player: { id: 21, name: "Lewandowski", jerseyNumber: 9 }, team: Team.YELLOW, position: Position.CENTER_FORWARD },
        { player: { id: 22, name: "Raphinha", jerseyNumber: 22 }, team: Team.YELLOW, position: Position.LEFT_WINGER },
      ]
    }
  };

  console.log('📋 Layout Type Examples:');
  console.log('========================\n');

  // Full Pitch Layout
  console.log('1. FULL_PITCH: Traditional layout with both teams across the entire field');
  console.log('   - Home team (left side), Away team (right side, mirrored)');
  
  // Half Pitch Layout
  console.log('\n2. HALF_PITCH: Each team positioned in their respective half');
  console.log('   - Clearer visualization, no position overlaps');
  
  // Split Pitch Layout
  console.log('\n3. SPLIT_PITCH: Two separate parallel pitches side by side');
  console.log('   - Each team gets its own complete field');
  console.log('   - Perfect for tactical analysis and comparison');

  console.log('\n🎨 Background Image Support:');
  console.log('============================');
  console.log('- Custom field textures and stadium backgrounds');
  console.log('- Supports both image URLs and loaded Image elements');
  console.log('- Automatic fallback to solid color if image fails to load');

  console.log('\n🚀 API Changes:');
  console.log('===============');
  console.log('- generateLineup() is now async to support image loading');
  console.log('- generateLineupFromPositioning() is also async');
  console.log('- Canvas size automatically adjusts for split pitch layout');

  console.log('\n💡 Usage Examples:');
  console.log('==================');
  
  console.log('\n// Basic usage with layout type:');
  console.log('const canvas = await generateLineup(lineupData, {');
  console.log('  layoutType: LayoutType.SPLIT_PITCH,');
  console.log('  width: 1000,');
  console.log('  height: 700');
  console.log('});');

  console.log('\n// With background image:');
  console.log('const canvas = await generateLineup(lineupData, {');
  console.log('  layoutType: LayoutType.HALF_PITCH,');
  console.log('  backgroundImage: "https://example.com/field.jpg",');
  console.log('  homeTeamColor: "#FF6B6B",');
  console.log('  awayTeamColor: "#4ECDC4"');
  console.log('});');

  console.log('\n✅ All new features are ready for production use!');
  console.log('📖 Check the updated README.md for complete documentation.');
  console.log('🌐 Open example.html in your browser to test interactively.');
}

// Run the demonstration
if (typeof window === 'undefined') {
  demonstrateLayouts().catch(console.error);
} else {
  console.log('Advanced features loaded in browser environment');
} 