const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');

const plugins = [new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery'
}), new CleanWebpackPlugin()]

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    plugins: plugins,
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
};