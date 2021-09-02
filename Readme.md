Pre-requirements:
  Install puppeteer globally && link it with project
  ```
    npm install puppeteer puppeteer-core
    npm link puppeteer
  ```
Usage:

  Launch Chrome with dev port: (You need to close browser if it's running)
  ```
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check
  ```

  Execute:
  ```npm start```

  To open all profiles in browser (from output.json) use:

  ```npm run open```
