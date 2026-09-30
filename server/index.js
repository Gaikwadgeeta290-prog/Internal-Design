import express from 'express';
import cors from 'cors';
import pool from "./config/db.js";
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import crypto from 'crypto';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const dataDir=path.join(__dirname,'data'); fs.mkdirSync(dataDir,{recursive:true});
const file=name=>path.join(dataDir,name);
const read=name=>{try{return JSON.parse(fs.readFileSync(file(name),'utf8'));}catch{return[]}};
const write=(name,data)=>fs.writeFileSync(file(name),JSON.stringify(data,null,2));
const app=express(); app.use(cors()); app.use(express.json({limit:'1mb'}));
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||'admin@gmail.com';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'admin123';
const sessions=new Set();
const auth=(req,res,next)=>{const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');if(!token||!sessions.has(token))return res.status(401).json({ok:false,message:'Admin authentication required.'});next()};
app.get('/api/health',(_,res)=>res.json({ok:true,service:'atelier-noire-api'}));
app.post('/api/contact', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      projectType,
      propertyType,
      area,
      budget,
      startDate,
      message
    } = req.body || {};

    if (!name || !email || !phone || !projectType || !message) {
      return res.status(400).json({
        ok: false,
        message: 'Please complete all required fields.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO enquiries
       (
         name,
         email,
         phone,
         city,
         project_type,
         property_type,
         area,
         budget,
         start_date,
         message
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        city || null,
        projectType || null,
        propertyType || null,
        area || null,
        budget || null,
        startDate || null,
        message
      ]
    );

    res.status(201).json({
      ok: true,
      id: result.insertId,
      message: 'Enquiry received successfully.'
    });

  } catch (error) {
    console.error('Create enquiry error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to submit enquiry.'
    });
  }
});
app.post('/api/consultations', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      date,
      time,
      mode
    } = req.body || {};

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({
        ok: false,
        message: 'Please choose a date and time.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO consultations
       (name, email, phone, preferred_date, preferred_time, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        date,
        time,
        mode || 'Video call'
      ]
    );

    res.status(201).json({
      ok: true,
      id: result.insertId,
      message: 'Consultation request received.'
    });

  } catch (error) {
    console.error('Create consultation error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to create consultation.'
    });
  }
});
app.post('/api/admin/login',(req,res)=>{const {email,password}=req.body||{};if(email!==ADMIN_EMAIL||password!==ADMIN_PASSWORD)return res.status(401).json({ok:false,message:'Invalid admin email or password.'});const token=crypto.randomBytes(32).toString('hex');sessions.add(token);res.json({ok:true,token,admin:{email:ADMIN_EMAIL,name:'Atelier Noire Admin'}});});
app.post('/api/admin/logout',auth,(req,res)=>{const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');sessions.delete(token);res.json({ok:true});});
app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const [projectRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM projects'
    );

    const [enquiryRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM enquiries'
    );

    const [consultationRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM consultations'
    );

    res.json({
      ok: true,
      stats: {
        projects: projectRows[0].total,
        enquiries: enquiryRows[0].total,
        consultations: consultationRows[0].total,
        newEnquiries: enquiryRows[0].total
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to fetch dashboard statistics.'
    });
  }
});
app.get('/api/admin/enquiries', auth, async (req, res) => {
  try {
    const [enquiries] = await pool.query(
      'SELECT * FROM enquiries ORDER BY created_at DESC'
    );

    res.json({
      ok: true,
      items: enquiries
    });
  } catch (error) {
    console.error('Get enquiries error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to fetch enquiries.'
    });
  }
});
app.get('/api/admin/consultations', auth, async (req, res) => {
  try {
    const [consultations] = await pool.query(
      'SELECT * FROM consultations ORDER BY created_at DESC'
    );

    res.json({
      ok: true,
      items: consultations
    });
  } catch (error) {
    console.error('Get consultations error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to fetch consultations.'
    });
  }
});
app.get('/api/admin/projects', auth, async (req, res) => {
  try {
    const [projects] = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    res.json({
      ok: true,
      items: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch projects.'
    });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const [projects] = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    res.json({
      ok: true,
      items: projects
    });

  } catch (error) {
    console.error('Get public projects error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to fetch projects.'
    });
  }
});


app.post('/api/admin/projects', auth, async (req, res) => {
  try {
    const { title, category, location, year, image_url } = req.body || {};

    if (!title || !category || !location) {
      return res.status(400).json({
        ok: false,
        message: 'Title, category and location are required.'
      });
    }

    const projectYear = year || String(new Date().getFullYear());

    const [result] = await pool.query(
  `INSERT INTO projects (title, category, location, year, image_url)
 VALUES (?, ?, ?, ?, ?)`,
[title, category, location, projectYear, image_url || null]
   );
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      ok: true,
      item: rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to create project.'
    });
  }
});

app.put('/api/admin/projects/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, category, location, year, image_url } = req.body || {};

    if (!title || !category || !location) {
      return res.status(400).json({
        ok: false,
        message: 'Title, category and location are required.'
      });
    }

    const projectYear = year || String(new Date().getFullYear());

    const [result] = await pool.query(
      `UPDATE projects
 SET title = ?, category = ?, location = ?, year = ?, image_url = ?
 WHERE id = ?`,
      [title, category, location, projectYear, image_url || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found.'
      });
    }

    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    res.json({
      ok: true,
      item: rows[0]
    });

  } catch (error) {
    console.error('Update project error:', error);

    res.status(500).json({
      ok: false,
      message: 'Failed to update project.'
    });
  }
});

app.delete('/api/admin/projects/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await pool.query(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Project not found.'
      });
    }

    res.json({
      ok: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to delete project.'
    });
  }
});
app.listen(5050,()=>console.log('Atelier Noire API running on http://localhost:5050'));
