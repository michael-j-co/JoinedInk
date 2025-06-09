const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');
const { sendKeepsakeBookNotification, sendCircleNotesKeepsakeBookNotification, sendContributorInvitation } = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

// Get all events for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get events created by the user
    const createdEvents = await prisma.event.findMany({
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

    // Get Circle Notes events where user is a participant
    const participatingEvents = await prisma.event.findMany({
      where: {
        AND: [
          { eventType: 'CIRCLE_NOTES' },
          { organizerId: { not: req.user.userId } }, // Not the organizer
          {
            contributorSessions: {
              some: {
                userId: req.user.userId
              }
            }
          }
        ]
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
        },
        organizer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add role metadata to each event
    const eventsWithRoles = [
      ...createdEvents.map(event => ({ ...event, userRole: 'organizer' })),
      ...participatingEvents.map(event => ({ ...event, userRole: 'participant' }))
    ];

    // Sort all events by creation date
    eventsWithRoles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ events: eventsWithRoles });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event details
router.get('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // First, try to find if user is the organizer
    let event = await prisma.event.findFirst({
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
        },
        organizer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    let userRole = 'organizer';

    // If not found as organizer, check if user is a participant
    if (!event) {
      event = await prisma.event.findFirst({
        where: {
          id: eventId,
          contributorSessions: {
            some: {
              userId: req.user.userId
            }
          }
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
          },
          organizer: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      userRole = 'participant';
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found or you do not have access to this event' });
    }

    // Add user's role and participation status
    const responseData = {
      ...event,
      userRole
    };

    // If user is a participant, get their contributor session info
    if (userRole === 'participant') {
      const contributorSession = await prisma.contributorSession.findFirst({
        where: {
          eventId,
          userId: req.user.userId
        }
      });
      
      if (contributorSession) {
        responseData.participantInfo = {
          contributorToken: contributorSession.token,
          completedRecipients: contributorSession.completedRecipients || []
        };
      }
    }

    res.json({ event: responseData });
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

      // Automatically add the creator as a participant in the circle notes
      const creatorUser = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      if (creatorUser) {
        // Create recipient for the creator
        const creatorRecipient = await prisma.recipient.create({
          data: {
            name: creatorUser.name,
            email: creatorUser.email,
            accessToken: uuidv4(),
            userId: creatorUser.id,
            eventId: event.id
          }
        });

        // Create a contributor session for the creator
        const creatorContributorToken = uuidv4();
        await prisma.contributorSession.create({
          data: {
            token: creatorContributorToken,
            eventId: event.id,
            userId: creatorUser.id,
            expiresAt: deadlineDate,
            completedRecipients: []
          }
        });
      }
      
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
      // For Circle Notes, return both the join link and creator's contributor link
      const joinTokenSession = contributorSessions.find(session => !session.userId);
      const creatorSession = contributorSessions.find(session => session.userId === req.user.userId);
      
      if (joinTokenSession) {
        contributorLinks.joinLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-circle/${joinTokenSession.token}`;
      }
      
      if (creatorSession) {
        contributorLinks.creatorContributorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contribute/${creatorSession.token}`;
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
    // Use the user's actual name for existing users, or the provided name for new users
    const recipientName = user.name || name.trim();
    
    const recipient = await prisma.recipient.create({
      data: {
        name: recipientName,
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

// Get all contributions for an event (organizer only)
router.get('/:eventId/contributions', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or you do not have access to this event' });
    }

    // Get all contributions for this event
    const contributions = await prisma.contribution.findMany({
      where: { eventId },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { recipient: { name: 'asc' } },
        { createdAt: 'asc' }
      ]
    });

    // Group contributions by recipient for Circle Notes
    const contributionsByRecipient = {};
    
    contributions.forEach(contribution => {
      const recipientId = contribution.recipient.id;
      if (!contributionsByRecipient[recipientId]) {
        contributionsByRecipient[recipientId] = {
          recipient: contribution.recipient,
          contributions: []
        };
      }
      contributionsByRecipient[recipientId].contributions.push({
        id: contribution.id,
        content: contribution.content,
        contributorName: contribution.contributorName || 'Anonymous',
        fontFamily: contribution.fontFamily,
        backgroundColor: contribution.backgroundColor,
        signature: contribution.signature,
        images: contribution.images,
        stickers: contribution.stickers,
        drawings: contribution.drawings,
        media: contribution.media,
        formatting: contribution.formatting,
        createdAt: contribution.createdAt
      });
    });

    res.json({
      event: {
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        status: event.status
      },
      contributionsByRecipient: Object.values(contributionsByRecipient),
      totalContributions: contributions.length
    });
  } catch (error) {
    console.error('Get event contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an event (organizer only)
router.delete('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or you do not have access to this event' });
    }

    // Delete all related data in a single transaction to ensure atomicity
    await prisma.$transaction([
      // 1. Delete contributions
      prisma.contribution.deleteMany({
        where: { eventId }
      }),

      // 2. Delete contributor sessions
      prisma.contributorSession.deleteMany({
        where: { eventId }
      }),

      // 3. Delete recipients
      prisma.recipient.deleteMany({
        where: { eventId }
      }),

      // 4. Delete the event itself
      prisma.event.delete({
        where: { id: eventId }
      })
    ]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send out compiled keepsake books (end event)
router.post('/:eventId/send-keepsake-books', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: req.user.userId
      },
      include: {
        recipients: {
          include: {
            contributions: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or you do not have access to this event' });
    }

    if (event.status === 'CLOSED') {
      return res.status(400).json({ error: 'Event is already closed and keepsake books have been sent' });
    }

    // Check if there are any contributions
    const totalContributions = event.recipients.reduce((sum, recipient) => sum + recipient.contributions.length, 0);
    
    if (totalContributions === 0) {
      return res.status(400).json({ error: 'Cannot send keepsake books - no contributions have been submitted yet' });
    }

    // Send keepsake book notifications to recipients concurrently
    // Only close the event if ALL emails are sent successfully
    
    // Create concurrent email sending promises for all recipients
    const emailPromises = event.recipients.map(async (recipient) => {
      if (recipient.contributions.length > 0) {
        try {
          // Send keepsake book notification email using appropriate template
          const emailResult = event.eventType === 'CIRCLE_NOTES'
            ? await sendCircleNotesKeepsakeBookNotification(
                recipient.email,
                recipient.name,
                event.title,
                recipient.accessToken,
                recipient.contributions.length
              )
            : await sendKeepsakeBookNotification(
                recipient.email,
                recipient.name,
                event.title,
                recipient.accessToken
              );
          
          return {
            recipient,
            result: emailResult,
            type: 'email'
          };
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          return {
            recipient,
            error: error.message,
            type: 'email'
          };
        }
      } else {
        // Skip recipients with no contributions
        return {
          recipient,
          type: 'skip'
        };
      }
    });

    // Wait for all email operations to complete concurrently
    const emailPromiseResults = await Promise.allSettled(emailPromises);
    
    // Process results and populate emailResults and emailErrors arrays
    let emailsSent = 0;
    const emailResults = [];
    const emailErrors = [];

    emailPromiseResults.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        const { recipient, result, error, type } = promiseResult.value;
        
        if (type === 'skip') {
          // Skip recipients with no contributions
          emailResults.push({
            recipient: recipient.name,
            email: recipient.email,
            contributionsCount: 0,
            status: 'skipped',
            reason: 'No contributions received'
          });
        } else if (type === 'email') {
          if (error) {
            // Email sending threw an exception
            emailErrors.push({
              recipient: recipient.name,
              email: recipient.email,
              error,
              status: 'failed'
            });
          } else if (result.success) {
            // Email sent successfully
            emailResults.push({
              recipient: recipient.name,
              email: recipient.email,
              contributionsCount: recipient.contributions.length,
              status: 'sent',
              messageId: result.messageId
            });
            emailsSent++;
          } else {
            // Email service returned failure
            emailErrors.push({
              recipient: recipient.name,
              email: recipient.email,
              error: result.error,
              status: 'failed'
            });
          }
        }
      } else {
        // Promise itself was rejected (unexpected error)
        const recipient = event.recipients[index];
        emailErrors.push({
          recipient: recipient.name,
          email: recipient.email,
          error: promiseResult.reason?.message || 'Unexpected error',
          status: 'failed'
        });
      }
    });

    // Only close the event if all emails were sent successfully
    let eventClosed = false;
    if (emailErrors.length === 0 && emailsSent > 0) {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'CLOSED' }
      });
      eventClosed = true;
    }

    res.json({
      message: emailErrors.length > 0 
        ? `${emailsSent} emails sent successfully, ${emailErrors.length} failed. Event remains open for retry.`
        : 'Event ended successfully - all keepsake book emails sent!',
      eventClosed,
      emailsSent,
      totalRecipients: event.recipients.length,
      results: emailResults,
      errors: emailErrors.length > 0 ? emailErrors : undefined
    });
  } catch (error) {
    console.error('Send keepsake books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch extend deadlines for multiple events
router.post('/batch/extend-deadline', authenticateToken, async (req, res) => {
  try {
    const { eventIds, newDeadline } = req.body;

    // Validate input
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ error: 'Event IDs array is required' });
    }

    if (!newDeadline) {
      return res.status(400).json({ error: 'New deadline is required' });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(newDeadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ error: 'New deadline must be in the future' });
    }

    // Get events and verify ownership
    const events = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        organizerId: req.user.userId,
        status: 'OPEN' // Only allow extending open events
      },
      select: {
        id: true,
        title: true,
        deadline: true
      }
    });

    if (events.length === 0) {
      return res.status(404).json({ error: 'No valid open events found for the provided IDs' });
    }

    // Update deadlines for all valid events
    const updatePromises = events.map(async (event) => {
      try {
        await prisma.event.update({
          where: { id: event.id },
          data: { deadline: deadlineDate }
        });

        // Also update expiry dates for related contributor sessions
        await prisma.contributorSession.updateMany({
          where: { eventId: event.id },
          data: { expiresAt: deadlineDate }
        });

        return {
          eventId: event.id,
          title: event.title,
          oldDeadline: event.deadline,
          newDeadline: deadlineDate,
          status: 'success'
        };
      } catch (error) {
        return {
          eventId: event.id,
          title: event.title,
          status: 'failed',
          error: error.message
        };
      }
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');

    res.json({
      message: `Successfully extended deadline for ${successful.length} event(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
      successful,
      failed: failed.length > 0 ? failed : undefined,
      newDeadline: deadlineDate
    });
  } catch (error) {
    console.error('Batch extend deadline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch send reminder emails for multiple events
router.post('/batch/send-reminders', authenticateToken, async (req, res) => {
  try {
    const { eventIds, reminderMessage } = req.body;

    // Validate input
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ error: 'Event IDs array is required' });
    }

    // Get events and verify ownership
    const events = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        organizerId: req.user.userId,
        status: 'OPEN' // Only allow reminders for open events
      },
      include: {
        contributorSessions: {
          where: {
            user: {
              isNot: null // Only get sessions for registered users
            }
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        organizer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (events.length === 0) {
      return res.status(404).json({ error: 'No valid open events found for the provided IDs' });
    }

    // Send reminder emails for each event
    const emailPromises = events.map(async (event) => {
      try {
        const contributorEmails = [];
        
        if (event.eventType === 'INDIVIDUAL_TRIBUTE') {
          // For individual tribute, we need to send to people who haven't contributed yet
          // We can't easily track individual contributors without sessions, so we'll send to the organizer
          // to ask them to manually reach out
          return {
            eventId: event.id,
            title: event.title,
            status: 'skipped',
            reason: 'Individual Tribute events require manual contributor outreach'
          };
        } else if (event.eventType === 'CIRCLE_NOTES') {
          // For Circle Notes, send reminders to all participants
          const participantEmails = [];
          
          for (const session of event.contributorSessions) {
            if (session.user) {
              const contributorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contribute/${session.token}`;
              
              try {
                await sendContributorInvitation(
                  session.user.email,
                  event.title,
                  contributorUrl,
                  event.organizer.name,
                  event.deadline
                );
                participantEmails.push(session.user.email);
              } catch (emailError) {
                console.error(`Failed to send reminder to ${session.user.email}:`, emailError);
              }
            }
          }
          
          return {
            eventId: event.id,
            title: event.title,
            status: 'success',
            remindersSent: participantEmails.length,
            recipients: participantEmails
          };
        }
      } catch (error) {
        return {
          eventId: event.id,
          title: event.title,
          status: 'failed',
          error: error.message
        };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    const skipped = results.filter(r => r.status === 'skipped');
    
    const totalReminders = successful.reduce((sum, result) => sum + (result.remindersSent || 0), 0);

    res.json({
      message: `Sent ${totalReminders} reminder emails across ${successful.length} event(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}`,
      successful,
      failed: failed.length > 0 ? failed : undefined,
      skipped: skipped.length > 0 ? skipped : undefined,
      totalReminders
    });
  } catch (error) {
    console.error('Batch send reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 