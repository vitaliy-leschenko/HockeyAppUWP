# What is it?
This is extention for Team Foundation Server for deploy UWP *.appxupload to HockeyApp 

# How to create package?
Run this commands:

1. npm i -g tfx-cli
2. tfx extension create --manifest-globs vss-extension.json

After this will be created *Vitaliy-Leschenko.HockeyAppUWP-1.0.5.vsix* package.

# How to install package?
Open http://tfsserver:8080/tfs/_gallery/manage and install *Vitaliy-Leschenko.HockeyAppUWP-1.0.5.vsix*
