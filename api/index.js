import express from "express";
import cors from "cors";
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/events', eventRoutes);
app.use('/users', userRoutes);

app.get('/ping', (req, res) => {
  res.send('Server is up and running');
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

