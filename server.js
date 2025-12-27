const express = require('express');
const app = express();
const PORT = 3000;

// Serve the public folder
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Free InkVision running on port ${PORT}`);
});
