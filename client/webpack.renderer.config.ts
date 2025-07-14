import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import UnoCSS from 'unocss/webpack';


rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});


export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [...plugins, UnoCSS()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
