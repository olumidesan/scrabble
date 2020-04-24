### Future fixes/features
- Audio implementation where players can talk to each other
- Verbose and simple mode where the former shows every move played by opponents and
  the latter only reflects when a player has played | config
- Time limit to play feature | config
- Restructure nasty css-hacked landing page
- Save scores on server and query from there, instead of emitting immediately?
- Reset config forms on Cancel. State has been reset but forms haven't. 
- Play logs and connection status | config
- Refactor app to use proper React componentization
- Cater for shaky connections. Currently, if connection gets lost,
  there are socketio errors
- Add weights to bag view
- Fix shaky connection issue that causes turns not to be updated on both score and state/props
- Game save feature (save board state and player rack, everything)
- Ask for letter to use when a blank piece is played (modal)
- Score single-word plays
- Cummulate multiple emits within the same function into one
- Improve scoring algorithm