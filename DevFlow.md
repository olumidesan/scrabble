### Future fixes/features
- Audio implementation where players can talk to each other
- Time limit to play feature | config
- Restructure nasty css-hacked landing page
- Play logs and connection status | config
- Refactor app to use strict React componentization
- Cater for shaky connections. Currently, if connection gets lost,
  there are socketio errors
- Game save feature (save board state and player rack, everything). Currently, if player refreshes his/her browser, the whole game has to be restarted
- Improve scoring algorithm
- Implement piece swapping
- Once game has ended, turn rack buttons to 'Play Again' button, without taking the users back to the config screen.