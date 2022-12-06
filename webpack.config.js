
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = (options) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    mode: 'production',
    externals: {
      knex: 'commonjs knex'
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
      usedExports: true
    },
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
      // Fix to build knex
      new webpack.IgnorePlugin({
        resourceRegExp: /(sqlite3|pg|pg-query-stream|oracledb|mysql2|tedious|mysql)/
      }),
    ],
  }
}
