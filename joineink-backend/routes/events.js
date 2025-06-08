const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

// Get all events for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.userId },
      include: {
        recipients: {
          select: {
            id: true,
            name: true,
            email: true,
            _count: {
              select: { contributions: true }
            }
          }
        },
        _count: {
          select: { contributions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event details
router.get('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      },
      include: {
        recipients: {
          select: {
            id: true,
            name: true,
            email: true,
            _count: {
              select: { contributions: true }
            }
          }
        },
        _count: {
          select: { contributions: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, eventType, deadline, recipientName, recipientEmail } = req.body;

    // Validate input
    if (!title || !eventType || !deadline) {
      return res.status(400).json({ error: 'Title, event type, and deadline are required' });
    }

    if (!['INDIVIDUAL_TRIBUTE', 'CIRCLE_NOTES'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    // For Individual Tribute, validate recipient info
    if (eventType === 'INDIVIDUAL_TRIBUTE') {
      if (!recipientName || !recipientEmail) {
        return res.status(400).json({ error: 'Recipient name and email are required for Individual Tribute' });
      }
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType,
        deadline: deadlineDate,
        organizerId: req.user.userId
      }
    });

    let responseData = {};
    
    if (eventType === 'INDIVIDUAL_TRIBUTE') {
      // Create recipient for Individual Tribute
      const recipient = await prisma.recipient.create({
        data: {
          name: recipientName,
          email: recipientEmail,
          accessToken: uuidv4(),
          eventId: event.id
        }
      });

      // Create contributor session for Individual Tribute
      const contributorToken = uuidv4();
      await prisma.contributorSession.create({
        data: {
          token: contributorToken,
          eventId: event.id,
          expiresAt: deadlineDate
        }
      });
      
      responseData = {
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        contributorLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contribute/${contributorToken}`,
        recipientName: recipientName,
        recipientEmail: recipientEmail
      };
    } else if (eventType === 'CIRCLE_NOTES') {
      // For Circle Notes, create a join token that people can use to register themselves
      const joinToken = uuidv4();
      
      // Store the join token in a way that associates it with the event
      // We can use the contributorSession table with a special flag or create a new table
      await prisma.contributorSession.create({
        data: {
          token: joinToken,
          eventId: event.id,
          expiresAt: deadlineDate,
          completedRecipients: [] // Will track which people this person has written for
        }
      });
      
      responseData = {
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        joinLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-circle/${joinToken}`
      };
    }

    res.status(201).json({
      message: 'Event created successfully',
      ...responseData
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
router.put('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, deadline, status } = req.body;

    // Verify event ownership
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(status && { status })
      }
    });

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close event manually
router.post('/:eventId/close', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      },
      include: {
        recipients: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status === 'CLOSED') {
      return res.status(400).json({ error: 'Event is already closed' });
    }

    // Update event status
    await prisma.event.update({
      where: { id: eventId },
      data: { status: 'CLOSED' }
    });

    // TODO: Trigger keepsake book generation and email delivery
    // This would involve compiling contributions and sending to recipients

    res.json({ message: 'Event closed successfully' });
  } catch (error) {
    console.error('Close event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contributor links for an event
router.get('/:eventId/contributor-links', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      },
      include: {
        recipients: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get contributor sessions for this event
    const contributorSessions = await prisma.contributorSession.findMany({
      where: { eventId }
    });

    let contributorLinks = {};

    if (event.eventType === 'INDIVIDUAL_TRIBUTE') {
      if (contributorSessions.length > 0) {
        contributorLinks.contributorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contribute/${contributorSessions[0].token}`;
      }
    } else if (event.eventType === 'CIRCLE_NOTES') {
      // For Circle Notes, return the join link
      if (contributorSessions.length > 0) {
        contributorLinks.joinLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-circle/${contributorSessions[0].token}`;
      }
    }

    res.json({ contributorLinks });
  } catch (error) {
    console.error('Get contributor links error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a circle notes event
router.post('/:eventId/join-circle', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, joinToken, password } = req.body;

    if (!name || !email || !joinToken || !password) {
      return res.status(400).json({ error: 'Name, email, password, and join token are required' });
    }

    // Verify the join token belongs to this event and is valid
    const session = await prisma.contributorSession.findUnique({
      where: { token: joinToken },
      include: {
        event: true
      }
    });

    if (!session || session.eventId !== eventId) {
      return res.status(400).json({ error: 'Invalid join token for this event' });
    }

    if (new Date() > session.expiresAt) {
      return res.status(410).json({ error: 'Join link has expired' });
    }

    if (session.event.eventType !== 'CIRCLE_NOTES') {
      return res.status(400).json({ error: 'This endpoint is only for Circle Notes events' });
    }

    if (session.event.status === 'CLOSED') {
      return res.status(410).json({ error: 'This event has been closed' });
    }

    // Check if this email is already registered for this event
    const existingRecipient = await prisma.recipient.findFirst({
      where: {
        eventId,
        email
      }
    });

    if (existingRecipient) {
      return res.status(400).json({ error: 'This email is already registered for this event' });
    }

    // Check if user already exists, if not create account
    let user = await prisma.user.findUnique({
      where: { email: email.trim() }
    });

    if (user) {
      // User exists - verify password to prevent impersonation
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(409).json({ 
          error: 'An account with this email already exists. Please use the correct password or try a different email.' 
        });
      }
      // Password is valid - user can proceed with existing account
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user account
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword
        }
      });
    }

    // Create recipient for the new participant
    const recipient = await prisma.recipient.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        accessToken: uuidv4(),
        userId: user.id, // Link to user account
        eventId
      }
    });

    // Create a new contributor session for this person, linked to their user account
    const contributorToken = uuidv4();
    await prisma.contributorSession.create({
      data: {
        token: contributorToken,
        eventId,
        userId: user.id, // Link to user account
        expiresAt: session.expiresAt,
        completedRecipients: [] // Will track which people this person has written for
      }
    });

    res.status(201).json({
      message: 'Successfully joined circle notes event',
      contributorToken,
      participant: {
        id: recipient.id,
        name: recipient.name,
        email: recipient.email,
        userId: user.id
      }
    });
  } catch (error) {
    console.error('Join circle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 