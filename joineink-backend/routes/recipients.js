const express = require('express');
const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Get keepsake book for recipient
router.get('/keepsake/:accessToken', async (req, res) => {
  try {
    const { accessToken } = req.params;

    const recipient = await prisma.recipient.findUnique({
      where: { accessToken },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            eventType: true,
            status: true
          }
        },
        contributions: {
          select: {
            id: true,
            content: true,
            contributorName: true,
            fontFamily: true,
            backgroundColor: true,
            signature: true,
            images: true,
            stickers: true,
            drawings: true,
            media: true,
            formatting: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Keepsake book not found' });
    }

    // Only show completed keepsake books
    if (recipient.event.status !== 'CLOSED') {
      return res.status(400).json({ 
        error: 'Keepsake book is not ready yet',
        message: 'The organizer hasn\'t closed the event yet. Please check back later.'
      });
    }

    res.json({
      keepsakeBook: {
        recipient: {
          name: recipient.name
        },
        event: recipient.event,
        contributions: recipient.contributions,
        totalContributions: recipient.contributions.length
      }
    });
  } catch (error) {
    console.error('Get keepsake book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate PDF of keepsake book
router.get('/keepsake/:accessToken/pdf', async (req, res) => {
  try {
    const { accessToken } = req.params;

    const recipient = await prisma.recipient.findUnique({
      where: { accessToken },
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
            status: true
          }
        },
        contributions: {
          select: {
            content: true,
            contributorName: true,
            fontFamily: true,
            backgroundColor: true,
            signature: true,
            images: true,
            stickers: true,
            drawings: true,
            media: true,
            formatting: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Keepsake book not found' });
    }

    if (recipient.event.status !== 'CLOSED') {
      return res.status(400).json({ error: 'Keepsake book is not ready yet' });
    }

    // Generate HTML for PDF
    const html = generateKeepsakeBookHTML(recipient);

    // Create PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      }
    });

    await browser.close();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="keepsake-book-${recipient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Download raw content as ZIP
router.get('/keepsake/:accessToken/download', async (req, res) => {
  try {
    const { accessToken } = req.params;

    const recipient = await prisma.recipient.findUnique({
      where: { accessToken },
      include: {
        event: {
          select: {
            title: true,
            status: true
          }
        },
        contributions: {
          select: {
            id: true,
            content: true,
            contributorName: true,
            images: true,
            drawings: true,
            signature: true,
            media: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Keepsake book not found' });
    }

    if (recipient.event.status !== 'CLOSED') {
      return res.status(400).json({ error: 'Keepsake book is not ready yet' });
    }

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="keepsake-content-${recipient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip"`);

    archive.pipe(res);

    // Add text content for each contribution
    recipient.contributions.forEach((contribution, index) => {
      const contributorLabel = contribution.contributorName || `Anonymous_${index + 1}`;
      const filename = `${String(index + 1).padStart(2, '0')}_${contributorLabel.replace(/[^a-z0-9]/gi, '_')}.txt`;
      
      let content = `Contribution ${index + 1}\n`;
      content += `Contributor: ${contribution.contributorName || 'Anonymous'}\n`;
      content += `Date: ${new Date(contribution.createdAt).toLocaleDateString()}\n`;
      content += `\n${'-'.repeat(50)}\n\n`;
      content += contribution.content || '';
      
      archive.append(content, { name: filename });
    });

    // Add a README file
    const readmeContent = `Keepsake Book Raw Content
========================

Event: ${recipient.event.title}
Recipient: ${recipient.name}
Total Contributions: ${recipient.contributions.length}
Downloaded: ${new Date().toLocaleString()}

This archive contains the raw text content of all contributions.
Images, drawings, and signatures are not included in this download.
For the complete keepsake book with media, please download the PDF version.

Contributions are numbered and named by contributor (or "Anonymous" if no name was provided).
`;

    archive.append(readmeContent, { name: 'README.txt' });

    await archive.finalize();
  } catch (error) {
    console.error('Download raw content error:', error);
    res.status(500).json({ error: 'Failed to generate download' });
  }
});

// Generate shareable link for keepsake book
router.post('/keepsake/:accessToken/share', async (req, res) => {
  try {
    const { accessToken } = req.params;

    const recipient = await prisma.recipient.findUnique({
      where: { accessToken },
      include: {
        event: {
          select: {
            status: true
          }
        }
      }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Keepsake book not found' });
    }

    if (recipient.event.status !== 'CLOSED') {
      return res.status(400).json({ error: 'Keepsake book is not ready yet' });
    }

    // For now, we'll just return the same access token as the shareable link
    // In a production environment, you might want to create a separate sharing token
    const shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/keepsake/${accessToken}?shared=true`;

    res.json({
      shareableLink,
      message: 'Shareable link generated successfully'
    });
  } catch (error) {
    console.error('Generate shareable link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate HTML for PDF
function generateKeepsakeBookHTML(recipient) {
  const { name } = recipient;
  const { title, eventType } = recipient.event;
  const { contributions } = recipient;

  let contributionsHTML = contributions.map((contribution, index) => {
    const backgroundColor = contribution.backgroundColor || '#ffffff';
    const fontFamily = contribution.fontFamily || 'Arial, sans-serif';
    
    let imagesHTML = '';
    
    // Handle legacy images
    if (contribution.images && contribution.images.length > 0) {
      imagesHTML += contribution.images.map(img => 
        `<img src="${img}" style="max-width: 100%; margin: 10px 0; border-radius: 8px;" alt="Contribution image" />`
      ).join('');
    }
    
    // Handle new media format
    if (contribution.media && contribution.media.length > 0) {
      imagesHTML += contribution.media.map(mediaItem => {
        if (mediaItem.type === 'sticker') {
          return `<img src="${mediaItem.url}" style="max-width: 100px; margin: 5px; display: inline-block;" alt="${mediaItem.alt || 'Sticker'}" />`;
        } else {
          return `<img src="${mediaItem.url}" style="max-width: 100%; margin: 10px 0; border-radius: 8px;" alt="${mediaItem.alt || 'Media'}" />`;
        }
      }).join('');
    }

    let signatureHTML = '';
    if (contribution.signature) {
      signatureHTML = `
        <div style="margin-top: 20px; text-align: right;">
          <img src="${contribution.signature}" style="max-width: 200px; height: auto;" alt="Signature" />
        </div>
      `;
    }

    return `
      <div style="
        background-color: ${backgroundColor};
        padding: 30px;
        margin: 20px 0;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-family: ${fontFamily};
        page-break-inside: avoid;
      ">
        ${contribution.content ? `
          <div style="
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 15px;
            white-space: pre-wrap;
          ">
            ${contribution.content}
          </div>
        ` : ''}
        
        ${imagesHTML}
        
        ${signatureHTML}
        
        ${contribution.contributorName ? `
          <div style="
            margin-top: 20px;
            font-style: italic;
            color: #666;
            text-align: right;
          ">
            — ${contribution.contributorName}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Keepsake Book for ${name}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          margin: 0;
          padding: 40px;
          background-color: #f9f9f9;
        }
        
        .header {
          text-align: center;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .title {
          font-size: 32px;
          color: #2c3e50;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .subtitle {
          font-size: 18px;
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        
        .recipient-name {
          font-size: 24px;
          color: #8e44ad;
          font-style: italic;
        }
        
        .contributions-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #95a5a6;
          font-size: 14px;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${title}</h1>
        <p class="subtitle">A Special Keepsake Book</p>
        <p class="recipient-name">For ${name}</p>
      </div>
      
      <div class="contributions-container">
        ${contributionsHTML}
      </div>
      
      <div class="footer">
        <p>Created with ♥ using JoinedInk</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = router; 