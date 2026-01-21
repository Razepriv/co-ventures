import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Email Notification API
 * Sends email notifications for various events
 * 
 * In production, integrate with:
 * - SendGrid
 * - AWS SES
 * - Resend
 * - Postmark
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, to, data } = body

    // Validate inputs
    if (!type || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate email content based on type
    let subject = ''
    let html = ''
    let text = ''

    switch (type) {
      case 'new_enquiry':
        subject = `New Enquiry from ${data.full_name}`
        html = generateNewEnquiryEmail(data)
        text = `New enquiry received from ${data.full_name} (${data.email})`
        break

      case 'enquiry_status':
        subject = `Your Enquiry Status: ${data.status}`
        html = generateEnquiryStatusEmail(data)
        text = `Your enquiry status has been updated to ${data.status}`
        break

      case 'new_property':
        subject = 'New Property Listed'
        html = generateNewPropertyEmail(data)
        text = `A new property has been listed: ${data.title}`
        break

      case 'property_update':
        subject = `Property Update: ${data.title}`
        html = generatePropertyUpdateEmail(data)
        text = `Property ${data.title} has been updated`
        break

      case 'subscription_reminder':
        subject = 'Subscription Reminder'
        html = generateSubscriptionReminderEmail(data)
        text = 'Your subscription is expiring soon'
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Store notification in database (table needs to be created first)
    // Uncomment after creating email_notifications table
    /*
    const { error: insertError } = await supabase
      .from('email_notifications')
      .insert({
        type,
        recipient: to,
        subject,
        html_content: html,
        text_content: text,
        metadata: data,
        status: 'pending'
      })

    if (insertError) {
      console.error('Error storing notification:', insertError)
    }
    */

    // In production, send actual email using your email service
    // For now, we'll just log it
    console.log('📧 Email Notification:', { type, to, subject })

    // Example: Using SendGrid (uncomment and configure in production)
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    await sgMail.send({
      to,
      from: process.env.SENDER_EMAIL,
      subject,
      text,
      html,
    })
    */

    // Example: Using AWS SES (uncomment and configure in production)
    /*
    const AWS = require('aws-sdk')
    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    })

    await ses.sendEmail({
      Source: process.env.SENDER_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: text },
          Html: { Data: html },
        },
      },
    }).promise()
    */

    return NextResponse.json({ 
      success: true,
      message: 'Email notification queued successfully',
      data: { type, to, subject }
    })

  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}

// Email Templates

function generateNewEnquiryEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        .detail { margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #FF6B6B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Enquiry Received</h1>
        </div>
        <div class="content">
          <p>You have received a new enquiry:</p>
          <div class="detail">
            <strong>Name:</strong> ${data.full_name}
          </div>
          <div class="detail">
            <strong>Email:</strong> ${data.email}
          </div>
          <div class="detail">
            <strong>Phone:</strong> ${data.phone || 'Not provided'}
          </div>
          <div class="detail">
            <strong>Message:</strong><br>${data.message}
          </div>
          ${data.property ? `<div class="detail"><strong>Property:</strong> ${data.property.title}</div>` : ''}
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries" 
               style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Dashboard
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Co-Housing Ventures Admin Panel</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateEnquiryStatusEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .status-new { background: #e3f2fd; color: #1976d2; }
        .status-in-progress { background: #fff3e0; color: #f57c00; }
        .status-completed { background: #e8f5e9; color: #388e3c; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 Enquiry Status Update</h1>
        </div>
        <div class="content">
          <p>Dear ${data.full_name},</p>
          <p>Your enquiry status has been updated:</p>
          <p>
            <span class="status-badge status-${data.status}">
              ${data.status.toUpperCase()}
            </span>
          </p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          <p>Thank you for your interest in Co-Housing Ventures.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
          <p>Co-Housing Ventures | ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateNewPropertyEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .property-image { width: 100%; height: 250px; object-fit: cover; border-radius: 10px; margin: 20px 0; }
        .price { font-size: 28px; color: #FF6B6B; font-weight: bold; margin: 15px 0; }
        .features { display: flex; gap: 20px; margin: 20px 0; }
        .feature { text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 New Property Listed</h1>
        </div>
        <div class="content">
          <h2>${data.title}</h2>
          ${data.image ? `<img src="${data.image}" alt="${data.title}" class="property-image" />` : ''}
          <p class="price">₹${(data.price / 100000).toFixed(2)}L</p>
          <p>📍 ${data.location}, ${data.city}</p>
          <div class="features">
            <div class="feature">
              <strong>${data.bedrooms}</strong><br>Bedrooms
            </div>
            <div class="feature">
              <strong>${data.bathrooms}</strong><br>Bathrooms
            </div>
            <div class="feature">
              <strong>${data.area_sqft}</strong><br>Sq. Ft
            </div>
          </div>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/properties/${data.slug}" 
               style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Property
            </a>
          </p>
        </div>
        <div class="footer" style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px;">
          <p>Co-Housing Ventures | ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generatePropertyUpdateEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Property Updated</h1>
        </div>
        <div class="content">
          <p>The property you're interested in has been updated:</p>
          <h2>${data.title}</h2>
          <p>📍 ${data.location}, ${data.city}</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/properties/${data.slug}" 
               style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Updated Details
            </a>
          </p>
        </div>
        <div class="footer" style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px;">
          <p>Co-Housing Ventures | ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateSubscriptionReminderEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Subscription Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Your subscription is expiring soon. Renew now to continue enjoying premium features.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/settings" 
               style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Renew Subscription
            </a>
          </p>
        </div>
        <div class="footer" style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px;">
          <p>Co-Housing Ventures | ${process.env.NEXT_PUBLIC_SITE_URL}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
