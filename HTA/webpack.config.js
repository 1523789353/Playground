module.exports = {
    entry: ['core-js', 'proxy-polyfill', './launcher.hta'],
    mode: 'development',
    target: ['web', 'es5'],
    // devtool: "source-map",
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.(html?|hta|js|tsx?|jpe?g|png|icon?)$/,
                use: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    // output: {
    //     filename: 'bundle.js',
    // },
};
