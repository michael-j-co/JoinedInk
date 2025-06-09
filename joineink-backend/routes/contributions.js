const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

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
                email: true,
                userId: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
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

    // For Circle Notes, filter out the current user from recipients so they can't write to themselves
    let recipients = session.event.recipients;
    if (session.event.eventType === 'CIRCLE_NOTES' && session.user) {
      // Filter out recipients where userId matches the current user's ID
      // This is the most reliable way to prevent users from writing to themselves
      recipients = recipients.filter(recipient => recipient.userId !== session.user.id);
    }

    res.json({
      event: {
        id: session.event.id,
        title: session.event.title,
        description: session.event.description,
        eventType: session.event.eventType,
        deadline: session.event.deadline
      },
      recipients: recipients,
      completedRecipients: session.completedRecipients || [],
      currentUser: session.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      } : null
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get participant's contributor session for an event (authenticated)
router.get('/participant-session/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // Find the contributor session for this user and event
    const contributorSession = await prisma.contributorSession.findFirst({
      where: {
        eventId,
        userId
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
            status: true,
            deadline: true
          }
        }
      }
    });

    if (!contributorSession) {
      return res.status(404).json({ error: 'You are not a participant in this event' });
    }

    if (contributorSession.event.status === 'CLOSED') {
      return res.status(410).json({ error: 'This event has been closed' });
    }

    if (new Date() > contributorSession.expiresAt) {
      return res.status(410).json({ error: 'This event has expired' });
    }

    res.json({
      contributorToken: contributorSession.token,
      event: contributorSession.event
    });
  } catch (error) {
    console.error('Get participant session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit contribution
router.post('/submit', upload.array('images', 10), async (req, res) => {
  try {
    const {
      contributorToken,
      recipientId,
      content,
      contributorName,
      fontFamily,
      backgroundColor,
      signature,
      media,
      drawings,
      formatting,
      stickers // Legacy field for backward compatibility
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

    // Process uploaded images and create URLs mapping
    const uploadedImageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Parse media items and update URLs for uploaded images
    let mediaItems = [];
    if (media) {
      try {
        mediaItems = JSON.parse(media);
        // Replace blob URLs with actual upload URLs for images
        let uploadIndex = 0;
        mediaItems = mediaItems.map(item => {
          if (item.type === 'image' && item.url.startsWith('blob:')) {
            if (uploadIndex < uploadedImageUrls.length) {
              return { ...item, url: uploadedImageUrls[uploadIndex++] };
            }
          }
          return item;
        });
      } catch (error) {
        console.error('Error parsing media:', error);
        mediaItems = [];
      }
    }

    // Parse signature data
    let signatureData = null;
    if (signature) {
      try {
        signatureData = JSON.parse(signature);
      } catch (error) {
        console.error('Error parsing signature:', error);
        // Fallback to treating as string for backward compatibility
        signatureData = signature;
      }
    }

    // Parse drawings data
    let drawingsData = null;
    if (drawings) {
      try {
        drawingsData = JSON.parse(drawings);
      } catch (error) {
        console.error('Error parsing drawings:', error);
        drawingsData = drawings;
      }
    }

    // Parse formatting data
    let formattingData = null;
    if (formatting) {
      try {
        formattingData = JSON.parse(formatting);
      } catch (error) {
        console.error('Error parsing formatting:', error);
        // Fallback to basic formatting
        formattingData = {
          fontFamily: fontFamily || 'Arial',
          fontSize: '16px',
          bold: false,
          italic: false
        };
      }
    }

    // Parse legacy stickers for backward compatibility
    let stickersData = [];
    if (stickers) {
      try {
        stickersData = Array.isArray(stickers) ? stickers : JSON.parse(stickers);
      } catch (error) {
        console.error('Error parsing stickers:', error);
        stickersData = [];
      }
    }

    // Prepare contribution data
    const contributionData = {
      content: content || '',
      contributorName: contributorName || null,
      contributorToken,
      fontFamily: formattingData?.fontFamily || fontFamily || 'Arial',
      backgroundColor: backgroundColor || 'clean',
      signature: signatureData,
      images: uploadedImageUrls, // Legacy field for uploaded images
      stickers: stickersData, // Legacy field for backward compatibility
      media: mediaItems, // New comprehensive media field
      drawings: drawingsData,
      formatting: formattingData,
      eventId: session.eventId,
      recipientId
    };

    // Create or update contribution
    let contribution;
    if (existingContribution) {
      // Update existing contribution
      contribution = await prisma.contribution.update({
        where: { id: existingContribution.id },
        data: contributionData
      });
    } else {
      // Create new contribution
      contribution = await prisma.contribution.create({
        data: contributionData
      });
    }

    // Update session to track completed recipients (for circle notes)
    // Only add to completed list if it's a new contribution
    if (session.event.eventType === 'CIRCLE_NOTES' && !existingContribution) {
      const updatedCompletedRecipients = [...(session.completedRecipients || []), recipientId];
      await prisma.contributorSession.update({
        where: { token: contributorToken },
        data: {
          completedRecipients: updatedCompletedRecipients
        }
      });
    }

    res.status(existingContribution ? 200 : 201).json({
      message: existingContribution ? 'Contribution updated successfully' : 'Contribution submitted successfully',
      isUpdate: !!existingContribution,
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