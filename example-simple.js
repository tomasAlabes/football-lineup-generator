// Simple example showing how to use the football-lineup-generator library
// This would be run in a Node.js environment or bundled for the browser

const { generateLineup, generateLineupFromPositioning, Team, Position } = require('./dist/index.js');

// Example 1: Using the main generateLineup function
function example1() {
  console.log('Example 1: Basic lineup generation');
  
  const lineupData = {
    homeTeam: {
      name: "Manchester City",
      players: [
        { player: { id: 1, name: "Ederson", jerseyNumber: 31 }, team: Team.RED, position: Position.GOALKEEPER },
        { player: { id: 2, name: "Walker", jerseyNumber: 2 }, team: Team.RED, position: Position.RIGHT_BACK },
        { player: { id: 3, name: "Dias", jerseyNumber: 3 }, team: Team.RED, position: Position.CENTER_BACK },
        { player: { id: 4, name: "Stones", jerseyNumber: 5 }, team: Team.RED, position: Position.CENTER_BACK },
        { player: { id: 5, name: "Cancelo", jerseyNumber: 27 }, team: Team.RED, position: Position.LEFT_BACK },
        { player: { id: 6, name: "Rodri", jerseyNumber: 16 }, team: Team.RED, position: Position.DEFENSIVE_MIDFIELDER },
        { player: { id: 7, name: "De Bruyne", jerseyNumber: 17 }, team: Team.RED, position: Position.CENTER_MIDFIELDER },
        { player: { id: 8, name: "Silva", jerseyNumber: 20 }, team: Team.RED, position: Position.CENTER_MIDFIELDER },
        { player: { id: 9, name: "Mahrez", jerseyNumber: 26 }, team: Team.RED, position: Position.RIGHT_WINGER },
        { player: { id: 10, name: "Haaland", jerseyNumber: 9 }, team: Team.RED, position: Position.CENTER_FORWARD },
        { player: { id: 11, name: "Grealish", jerseyNumber: 10 }, team: Team.RED, position: Position.LEFT_WINGER },
      ]
    },
    awayTeam: {
      name: "Liverpool",
      players: [
        { player: { id: 12, name: "Alisson", jerseyNumber: 1 }, team: Team.YELLOW, position: Position.GOALKEEPER },
        { player: { id: 13, name: "Alexander-Arnold", jerseyNumber: 66 }, team: Team.YELLOW, position: Position.RIGHT_BACK },
        { player: { id: 14, name: "Van Dijk", jerseyNumber: 4 }, team: Team.YELLOW, position: Position.CENTER_BACK },
        { player: { id: 15, name: "Konate", jerseyNumber: 5 }, team: Team.YELLOW, position: Position.CENTER_BACK },
        { player: { id: 16, name: "Robertson", jerseyNumber: 26 }, team: Team.YELLOW, position: Position.LEFT_BACK },
        { player: { id: 17, name: "Fabinho", jerseyNumber: 3 }, team: Team.YELLOW, position: Position.DEFENSIVE_MIDFIELDER },
        { player: { id: 18, name: "Henderson", jerseyNumber: 14 }, team: Team.YELLOW, position: Position.CENTER_MIDFIELDER },
        { player: { id: 19, name: "Thiago", jerseyNumber: 6 }, team: Team.YELLOW, position: Position.CENTER_MIDFIELDER },
        { player: { id: 20, name: "Salah", jerseyNumber: 11 }, team: Team.YELLOW, position: Position.RIGHT_WINGER },
        { player: { id: 21, name: "Nunez", jerseyNumber: 27 }, team: Team.YELLOW, position: Position.CENTER_FORWARD },
        { player: { id: 22, name: "Diaz", jerseyNumber: 23 }, team: Team.YELLOW, position: Position.LEFT_WINGER },
      ]
    }
  };

  const config = {
    width: 1000,
    height: 700,
    fieldColor: '#2E7D32',
    homeTeamColor: '#87CEEB',
    awayTeamColor: '#DC143C',
    fontSize: 14,
    playerCircleSize: 25
  };

  // In a browser environment, you would do:
  // const canvas = generateLineup(lineupData, config);
  // document.body.appendChild(canvas);
  
  console.log('Lineup generated successfully!');
  console.log('In a browser environment, this would create a canvas element with the visual lineup.');
}

// Example 2: Using backend positioning data format
function example2() {
  console.log('\nExample 2: Backend integration with positioning data');
  
  const backendData = [
    { match_id: 1, player_id: 1, player_name: "Lionel Messi", jersey_number: 10, team: Team.RED, position: Position.RIGHT_WINGER },
    { match_id: 1, player_id: 2, player_name: "Kylian Mbappé", jersey_number: 7, team: Team.RED, position: Position.LEFT_WINGER },
    { match_id: 1, player_id: 3, player_name: "Neymar", jersey_number: 11, team: Team.RED, position: Position.CENTER_FORWARD },
    { match_id: 1, player_id: 4, player_name: "Marco Verratti", jersey_number: 6, team: Team.RED, position: Position.CENTER_MIDFIELDER },
    { match_id: 1, player_id: 5, player_name: "Marquinhos", jersey_number: 5, team: Team.RED, position: Position.CENTER_BACK },
    { match_id: 1, player_id: 6, player_name: "Gianluigi Donnarumma", jersey_number: 99, team: Team.RED, position: Position.GOALKEEPER },
    
    // Away team
    { match_id: 1, player_id: 11, player_name: "Robert Lewandowski", jersey_number: 9, team: Team.YELLOW, position: Position.CENTER_FORWARD },
    { match_id: 1, player_id: 12, player_name: "Pedri", jersey_number: 8, team: Team.YELLOW, position: Position.CENTER_MIDFIELDER },
    { match_id: 1, player_id: 13, player_name: "Ronald Araújo", jersey_number: 4, team: Team.YELLOW, position: Position.CENTER_BACK },
    { match_id: 1, player_id: 14, player_name: "Marc-André ter Stegen", jersey_number: 1, team: Team.YELLOW, position: Position.GOALKEEPER },
  ];

  // In a browser environment:
  // const canvas = generateLineupFromPositioning(backendData, "PSG", "Barcelona");
  // document.getElementById('lineup-container').appendChild(canvas);
  
  console.log('Backend integration example completed!');
  console.log('This would create a lineup from your backend positioning data.');
}

// Example 3: Show all available positions and teams
function example3() {
  console.log('\nExample 3: Available enums');
  
  console.log('Available Teams:', Object.values(Team));
  console.log('Available Positions:', Object.values(Position));
}

// Run all examples
if (typeof window === 'undefined') {
  // Running in Node.js
  console.log('🏈 Football Lineup Generator Examples\n');
  console.log('Note: These examples show the API usage. In a browser environment,');
  console.log('the functions would return actual canvas elements that can be added to the DOM.\n');
  
  example1();
  example2();
  example3();
  
  console.log('\n✅ All examples completed successfully!');
  console.log('\nTo see the visual output, open example.html in your browser.');
} else {
  // Running in browser
  console.log('Library loaded in browser environment');
} 