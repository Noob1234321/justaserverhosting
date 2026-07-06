const mineflayer = require('mineflayer');
const express = require('express'); // 🌟 Added Express

// 🌟 Create a dummy web server so Render stays happy
const app = express();
app.get('/', (req, res) => res.send('Mumbledore is alive!'));
app.listen(process.env.PORT || 3000, () => console.log('Web ping server ready.'));

const config = {
    host: 'justaserver.seedloaf.gg', 
    port: 25565,                           
    username: 'Mumbledore', 
    version: '1.20.4'
};

// ... (Keep the rest of your 3x3 movement script exactly the same!)

function startBot() {
    console.log(`📡 Connecting Mumbledore with 3x3 movement loops...`);
    
    const bot = mineflayer.createBot({
        ...config,
        hideErrors: true,
        physicsEnabled: true, // MUST be true for the bot to physically move forward/back
        viewDistance: 'tiny'
    });

    // Automatically suppress actionbar or title packets that could cause a crash
    bot.on('messagestr', (message, position) => {
        if (position === 'actionbar') return;
    });

    bot.on('spawn', () => {
        console.log(`✅ ${bot.username} spawned! Ready to walk the perimeter.`);
        
        let stepCount = 0;

        // 🌟 THE 3x3 PATTERN ROUTINE
        // Every 3 seconds, the bot takes a step forward and occasionally turns or punches
        const movementTimer = setInterval(() => {
            if (!bot.entity) return;

            // 1. Randomly swing the arm (punch)
            if (Math.random() > 0.4) {
                bot.swingArm();
            }

            // 2. Press 'forward' to move a tiny bit
            bot.setControlState('forward', true);
            
            // Lift the forward key after 400 milliseconds so it doesn't sprint away
            setTimeout(() => {
                bot.setControlState('forward', false);
                stepCount++;

                // Every 3 steps (~3 blocks), pivot the yaw 90 degrees to complete a square wall
                if (stepCount >= 3) {
                    const currentYaw = bot.entity.yaw;
                    // Add 90 degrees in radians (PI / 2) to turn smoothly
                    bot.look(currentYaw + Math.PI / 2, 0, true);
                    stepCount = 0; 
                    console.log(`🧭 Completed edge. Turning 90 degrees...`);
                }
            }, 400);

        }, 3000); // Trigger a step cycle every 3 seconds

        // Clean up memory leaks if the bot gets kicked out
        bot.once('end', () => {
            clearInterval(movementTimer);
        });
    });

    bot.on('end', (reason) => {
        console.log(`❌ Disconnected: ${reason}. Auto-reconnecting in 30s...`);
        setTimeout(startBot, 30000); 
    });

    bot.on('error', (err) => {
        console.log(`⚠️ Network Notice: ${err.message}`);
    });
}

// Global safety catch
process.on('uncaughtException', (err) => {
    if (err.message.includes('socketClosed') || err.message.includes('Invalid move')) return;
    console.log(`🛡️ Handled core glitch: ${err.message}`);
});

startBot();
