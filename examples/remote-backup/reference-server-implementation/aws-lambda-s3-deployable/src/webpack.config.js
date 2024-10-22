const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node',  // Set target for Node.js environment
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
    
  },
  resolve: {
    extensions: ['.ts', '.js'],  // Resolve both .ts and .js files
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',  // Required for Lambda compatibility
  },
};