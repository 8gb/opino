const path = require('path');

var config = {
  // TODO: Add common Configuration
  module: {
    rules: [{
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: ["@babel/plugin-transform-runtime"],
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      }
    }],
  }
};

var barConfig = Object.assign({}, config, {
  name: "b",
  watch: true,
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'main.js',
  }
});

// Return Array of Configurations
module.exports = [
  barConfig
];