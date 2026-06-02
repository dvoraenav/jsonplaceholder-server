const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// נתיב בדיקה לראות שהכל מחובר
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: 'החיבור ל-MySQL עובד בהצלחה!', result: rows[0].solution });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאה בחיבור למסד הנתונים' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});