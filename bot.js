const mineflayer = require('mineflayer');
const express = require('express');

// Dummy web server for Render's free tier
const app = express();
app.get('/', (req, res) => res.send('Mumbledore is active!'));
app.listen(process.env.PORT || 3000, () => console.log('Web ping server ready.'));

const config = {
    host: 'your-seedloaf-ip.seedloaf.gg', // Change this to your server IP
    port: 25565,                           
    username: 'Mumbledore', 
    version: '1.20.4'
};

function startBot() {
    console.log(`📡 Connecting Mumbledore in Static Collision-Free Mode...`);
    
    const bot = mineflayer.createBot({
        ...config,
        hideErrors: true,
        physicsEnabled: false, // Disables physics engine
        viewDistance: 'tiny'
    });

    // Strip out core physics tracking to stop position sync errors
    bot.on('inject_allowed', () => {
        bot.physics = null; 
    });

    bot.on('messagestr', (message, position) => {
        if (position === 'actionbar') return;
    });

    bot.on('spawn', () => {
        console.log(`✅ ${bot.username} spawned safely inside the barrier box!`);
        
        // Safe arm swing loop to reset the AFK timer without moving or looking
        const afkTimer = setInterval(() => {
            if (!bot.entity) return;
            bot.swingArm();
        }, 5000); 

        bot.once('end', () => {
            clearInterval(afkTimer);
        });
    });

    bot.on('end', (reason) => {
        console.log(`❌ Disconnected: ${reason}. Auto-reconnecting in 60s...`);
        setTimeout(startBot, 60000); // 1-minute delay to keep things stable
    });

    bot.on('error', (err) => {
        console.log(`⚠️ Network Notice: ${err.message}`);
    });
}

process.on('uncaughtException', (err) => {
    if (err.message.includes('socketClosed') || err.message.includes('Invalid move')) return;
    console.log(`🛡️ Handled core glitch: ${err.message}`);
});

startBot();
