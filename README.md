# LevelTeam


# Bundling

The source code in the src directory is bundled into a single file using Browserify. The Browserify tools must first be installed on your system:

<code>$ npm install -g browserify (for OSX and linus users, you may need to preface this command with sudo) </code>

Once installed, you can bundle the current source with the command:

<code>$ browserify src/app.js -o bundle.js</code>

Remember, the browser must be refreshed to receive the changed javascript file.


# Watching

You may prefer to instead watch the files for changes using Watchify. This works very similarily to Browserify. It first must be installed:

<code>$ npm install -g watchify (again, sudo may need to be used on linux and OSX platforms)</code>

Then run the command:

<code>watchify src/app.js -o bundle.js</code>

The bundle will automatically be re-created every time you change a source file. However, you still need to refresh your browser for the changed bundle to take effect.
