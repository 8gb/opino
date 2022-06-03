# opino.ongclement.com front end comment system component

- still a work in progress.

## how to run locally
1. configure the `prod.config.js` to output the file into your preferred location.
2. embed the file link in your localhost static page.
3. run `npx webpack --config prod.config.js` to package the js frontend bundle file, and also watch the file for any changes.

## how to build the js
run `npm run build`, collect the bundle js file in `/dist` folder.

## changing the looks
this project uses css module, only one file is being used: `index.css`

## using self host
- if you decide to host yourself, build a REST API service connecting to a database, and hook it to the component.


## credit
Thank you for your interest, come back soon for more surprise.


## cdn link
https://cdn.opino.ongclement.com/main.js