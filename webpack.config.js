const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const is_development = process.env.NODE_ENV !== 'production';

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.less']
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.less$/, // This is for LESS files
                use: [
                    is_development
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    'less-loader',
                ],
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        !is_development &&
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ].filter(Boolean),
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
        open: true
    },
    mode: 'development'
}