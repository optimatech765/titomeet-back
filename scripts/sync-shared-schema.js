/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
const { exec } = require('child_process');
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// Path to shared-lib schema
const sharedSchemaPath = path.join(
    __dirname,
    '../node_modules/@optimatech88/titomeet-shared-lib/prisma/schema.prisma',
);

// Path to backend local schema
const localSchemaPath = path.join(__dirname, '../prisma/schema.prisma');

// Copy shared schema into local prisma folder
fs.copyFile(sharedSchemaPath, localSchemaPath, (err) => {
    if (err) {
        console.error('Error copying schema:', err);
        process.exit(1);
    }
    console.log('Shared schema synced to backend prisma/schema.prisma');

    // Optional: run prisma migrate dev automatically after copy
    exec(
        'npx prisma migrate dev --name sync_from_shared_lib',
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Migration failed: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Migration error: ${stderr}`);
                return;
            }
            console.log(stdout);
            console.log('Migration completed successfully!');
        },
    );
});
