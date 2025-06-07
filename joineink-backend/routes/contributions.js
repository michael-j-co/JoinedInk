const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get contribution session info (for contributor interface)
router.get('/session/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const session = await prisma.contributorSession.findUnique({
      where: { token },
      include: {
        event: {
          include: {
            recipients: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Invalid contribution link' });
    }

    if (new Date() > session.expiresAt) {
      return res.status(410).json({ error: 'Contribution link has expired' });
    }

    if (session.event.status === 'CLOSED') {
      return res.status(410).json({ error: 'This event has been closed' });
    }

    res.json({
      event: {
        id: session.event.id,
        title: session.event.title,
        description: session.event.description,
        eventType: session.event.eventType,
        deadline: session.event.deadline
      },
      recipients: session.event.recipients,
      completedRecipients: session.completedRecipients || []
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit contribution
router.post('/submit', upload.array('images', 5), async (req, res) => {
  try {
    const {
      contributorToken,
      recipientId,
      content,
      contributorName,
      fontFamily,
      backgroundColor,
      signature,
      stickers,
      drawings
    } = req.body;

    // Validate session
    const session = await prisma.contributorSession.findUnique({
      where: { token: contributorToken },
      include: {
        event: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Invalid contribution token' });
    }

    if (new Date() > session.expiresAt) {
      return res.status(410).json({ error: 'Contribution session has expired' });
    }

    if (session.event.status === 'CLOSED') {
      return res.status(410).json({ error: 'This event has been closed' });
    }

    // Validate recipient exists for this event
    const recipient = await prisma.recipient.findFirst({
      where: {
        id: recipientId,
        eventId: session.eventId
      }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Invalid recipient' });
    }

    // Check if contribution already exists for this contributor/recipient combo
    const existingContribution = await prisma.contribution.findFirst({
      where: {
        contributorToken,
        recipientId,
        eventId: session.eventId
      }
    });

    if (existingContribution) {
      return res.status(400).json({ error: 'You have already submitted a note for this recipient' });
    }

    // Process uploaded images
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        content: content || '',
        contributorName,
        contributorToken,
        fontFamily,
        backgroundColor,
        signature,
        images: imageUrls,
        stickers: stickers ? JSON.parse(stickers) : [],
        drawings,
        eventId: session.eventId,
        recipientId
      }
    });

    // Update session to track completed recipients (for circle notes)
    if (session.event.eventType === 'CIRCLE_NOTES') {
      const updatedCompletedRecipients = [...(session.completedRecipients || []), recipientId];
      await prisma.contributorSession.update({
        where: { token: contributorToken },
        data: {
          completedRecipients: updatedCompletedRecipients
        }
      });
    }

    res.status(201).json({
      message: 'Contribution submitted successfully',
      contribution: {
        id: contribution.id,
        recipientName: recipient.name
      }
    });
  } catch (error) {
    console.error('Submit contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contributions for a specific event (for organizer)
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Note: This endpoint should ideally include authentication to verify organizer ownership
    // For now, we'll return basic stats without revealing content

    const contributions = await prisma.contribution.findMany({
      where: { eventId },
      select: {
        id: true,
        contributorName: true,
        createdAt: true,
        recipient: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      totalContributions: contributions.length,
      contributions: contributions.map(contrib => ({
        id: contrib.id,
        contributorName: contrib.contributorName || 'Anonymous',
        recipientName: contrib.recipient.name,
        submittedAt: contrib.createdAt
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contribution (allow edits before event closes)
router.put('/:contributionId', async (req, res) => {
  try {
    const { contributionId } = req.params;
    const {
      contributorToken,
      content,
      contributorName,
      fontFamily,
      backgroundColor,
      signature,
      stickers,
      drawings
    } = req.body;

    // Validate contributor token and contribution ownership
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        event: true
      }
    });

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    if (contribution.contributorToken !== contributorToken) {
      return res.status(403).json({ error: 'Not authorized to edit this contribution' });
    }

    if (contribution.event.status === 'CLOSED') {
      return res.status(410).json({ error: 'Cannot edit - event has been closed' });
    }

    // Update contribution
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        content: content || contribution.content,
        contributorName: contributorName !== undefined ? contributorName : contribution.contributorName,
        fontFamily: fontFamily || contribution.fontFamily,
        backgroundColor: backgroundColor || contribution.backgroundColor,
        signature: signature || contribution.signature,
        stickers: stickers ? JSON.parse(stickers) : contribution.stickers,
        drawings: drawings || contribution.drawings
      }
    });

    res.json({
      message: 'Contribution updated successfully',
      contribution: { id: updatedContribution.id }
    });
  } catch (error) {
    console.error('Update contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 