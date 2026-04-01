const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./models/Project');
const Gallery = require('./models/Gallery');

const projects = [
    {
        title: "Clean Water Initiative",
        slug: "clean-water-initiative",
        description: "Providing sustainable clean water access to 50+ villages in remote areas of Sub-Saharan Africa.",
        category: "Sustainability",
        image: "https://images.unsplash.com/photo-1541810270634-31ed213e877b?auto=format&fit=crop&q=80&w=800",
        stats: { label: "Villages Served", value: "50+" },
        impactDescription: "Over 25,000 lives impacted through clean water access points.",
        featured: true
    },
    {
        title: "Digital Schools Program",
        slug: "digital-schools-program",
        description: "Equipping rural schools with solar-powered computer labs and internet connectivity to bridge the digital divide.",
        category: "Education",
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800",
        stats: { label: "Laptops Donated", value: "1,200+" },
        impactDescription: "Educating 10,000+ students through digital literacy programs.",
        featured: true
    },
    {
        title: "Mother & Child Care",
        slug: "mother-child-care",
        description: "Specialized healthcare support for expectant mothers and young children in underprivileged urban areas.",
        category: "Healthcare",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
        stats: { label: "Mothers Helped", value: "5,000+" },
        impactDescription: "Reducing infant mortality rates by 35% in targeted regions.",
        featured: true
    }
];

const gallery = [
    { title: "Village Well Kickoff", category: "Sustainability", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&q=80&w=400" },
    { title: "Student Learning", category: "Education", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400" },
    { title: "Health Checkup Camp", category: "Health", image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=400" },
    { title: "Relief Distribution", category: "Crisis", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400" },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");
        
        await Project.deleteMany();
        await Project.insertMany(projects);
        console.log("Projects seeded!");

        await Gallery.deleteMany();
        await Gallery.insertMany(gallery);
        console.log("Gallery seeded!");

        mongoose.connection.close();
        console.log("Seeding complete. Connection closed.");
    } catch (error) {
        console.error("Error seeding DB:", error);
        process.exit(1);
    }
};

seedDB();
