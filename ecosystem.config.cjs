module.exports = {
    apps: [{
        time: true,
        name: 'Fyre API',
        script: './build/app.js',
        node_args: '-r dotenv/config'
    }]
};
