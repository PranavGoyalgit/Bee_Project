const express = require("express");
const mongoose = require("mongoose"); // Added mongoose
const app = express();
const fs = require("fs");
app.use(express.json());
app.use(express.static("public"));
let PORT = 3000;
app.use(express.urlencoded({ extended: true }));

const mongoURI = "mongodb+srv://abbhu710:EA0daQvSGFxxJwJw@cluster0.mse1cao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const eventSchema = new mongoose.Schema({
    id: String,
    name: String,
    time: String,
    details: String
});
const Event = mongoose.model("Event", eventSchema);

app.set("view engine", "ejs");
app.set("views", __dirname);

app.get("/", async (req, res) => {
    const events = await Event.find();
    res.render("index", { events, selectedEvent: null });
});

app.post("/addevent", async (req, res) => {
    const { id, name, time, details } = req.body;
    if (!id || !name || !time || !details) return res.send("Missing data");
    const existingEvent = await Event.findOne({ id });
    if (existingEvent) return res.send("Entry already in data");
    const newEvent = new Event({ id, name, time, details });
    await newEvent.save();
    res.redirect("/");
});

app.post("/deleteevent/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) return res.send("No id provided");
    await Event.deleteOne({ id });
    res.redirect("/");
});

app.get("/getevents", async (req, res) => {
    const events = await Event.find();
    res.send(events);
});

app.get("/geteventbyid", async (req, res) => {
    const { id } = req.query;
    const selectedEvent = await Event.findOne({ id });
    const events = await Event.find();
    res.render("index", { events, selectedEvent: selectedEvent || null });
});

app.post("/updateevents", async (req, res) => {
    const { id, name, time, details } = req.body;
    if (!id) return res.send("ID not provided");
    const event = await Event.findOne({ id });
    if (event) {
        if (name) event.name = name;
        if (time) event.time = time;
        if (details) event.details = details;
        await event.save();
    }
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});