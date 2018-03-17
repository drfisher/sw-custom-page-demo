const path = require('path');

module.exports = {
  entry: {
    app: './src/js/app.js',
    'service-worker': './src/js/sw/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/js'),
  },
  resolve: {
    extensions: ['.js', '.styl'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.pug$/,
        use: {
          loader: 'pug-loader',
        },
      },
    ],
  },
};
