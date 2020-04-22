- Play implementation must mark played pieces as a different class | check
- Prevent others from interacting with pieces on the board not played by them | check
- Audio implementation where players can talk to each other
- Verbose and simple mode where the former shows every move played by opponents and
  the latter only reflects when a player has played | config
- Time limit to play feature | config
- Restructure nasty css-hacked landing page
- Validate name and game ids | check
- Save scores on server and query from there, instead of emitting immediately?
- Reset config forms on Cancel. State has been reset but forms haven't. 
- Play logs and connection status | config
- Remove haphazard definition of axios requests | Check
- Show modal of pieces on bag click | check
- Refactor app to use proper React componentization
- Cater for shaky connections. Currently, if connection gets lost,
  there are socketio errors
- Add weights to bag view
- Fix shaky connection issue that causes turns not to be updated on both score and state/props