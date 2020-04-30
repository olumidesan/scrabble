### Future fixes/features
- Audio implementation where players can talk to each other
- Time limit to play feature | config
- Restructure nasty css-hacked landing page
- Play logs and connection status | config
- Refactor app to use proper React componentization
- Cater for shaky connections. Currently, if connection gets lost,
  there are socketio errors
- Fix shaky connection issue that causes turns not to be updated on both score and state/props
- Game save feature (save board state and player rack, everything)
- Ask for letter to use when a blank piece is played (modal) | check
- Score single-word plays
- Cummulate multiple emits within the same function into one | check
- Improve scoring algorithm
- Fix blank piece recording other than zero bug