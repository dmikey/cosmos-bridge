const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "./src/client/index.tsx",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                // If you are using less-loader@5 please spread the lessOptions to options directly
                modifyVars: {
                  "primary-color": "#E30613",
                  "link-color": "#AF1917",
                  "border-radius-base": "2px",
                },
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      $contracts: path.resolve(__dirname, "build/contracts"),
    },
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      http: require.resolve("stream-http"),
    },
  },
  plugins: [new NodePolyfillPlugin()],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
};
