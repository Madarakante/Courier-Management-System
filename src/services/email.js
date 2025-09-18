const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Status descriptions for email content
const statusDescriptions = {
    pending: 'Your shipment has been registered and is awaiting processing.',
    picked_up: 'Your shipment has been collected from the origin location.',
    in_transit: 'Your shipment is currently in transit to its destination.',
    out_for_delivery: 'Your shipment is out for delivery to the destination address.',
    delivered: 'Your shipment has been successfully delivered.',
    on_hold: 'Your shipment is temporarily on hold.',
    exception: 'There has been an unexpected delay with your shipment.'
};

// Email templates
const templates = {
    statusUpdate: (shipment, status, location) => {
        const statusDescription = statusDescriptions[status] || 'Status has been updated.';
        const estimatedDelivery = shipment.estimatedDelivery ? 
            new Date(shipment.estimatedDelivery).toLocaleDateString('pt-BR') : 
            'To be determined';

        return {
            subject: `Shipment ${shipment.trackingNumber} - ${status.toUpperCase()}`,
            text: `
Dear ${shipment.customerName},

Your shipment ${shipment.trackingNumber} has been updated:

Current Status: ${status.toUpperCase()}
Current Location: ${location}
Last Updated: ${new Date().toLocaleDateString('pt-BR')}

Status Details: ${statusDescription}

Shipment Information:
- Origin: ${shipment.originLocation}
- Destination: ${shipment.destinationLocation}
- Estimated Delivery: ${estimatedDelivery}

Track your shipment at: https://atlanticshipping.com.br/track/${shipment.trackingNumber}

If you have any questions or concerns, please don't hesitate to contact us:
Email: operations@atlanticshippings.com
Phone: +55 (27) 3324-2022

Thank you for choosing Atlantic Shipping.
            `,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://atlanticshipping.com.br/wp-content/uploads/2025/04/logo-atlantic.png" alt="Atlantic Shipping" style="max-width: 200px;">
                    </div>

                    <h2 style="color: #2c3e50; margin-bottom: 20px;">Shipment Status Update</h2>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Status Update Details</h3>
                        <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
                        <p style="margin: 5px 0;"><strong>Current Status:</strong> <span style="color: #3498db;">${status.toUpperCase()}</span></p>
                        <p style="margin: 5px 0;"><strong>Current Location:</strong> ${location}</p>
                        <p style="margin: 5px 0;"><strong>Last Updated:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div style="margin: 20px 0;">
                        <p style="color: #34495e; font-style: italic;">${statusDescription}</p>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Shipment Information</h3>
                        <p style="margin: 5px 0;"><strong>Origin:</strong> ${shipment.originLocation}</p>
                        <p style="margin: 5px 0;"><strong>Destination:</strong> ${shipment.destinationLocation}</p>
                        <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
                    </div>

                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://atlanticshipping.com.br/track/${shipment.trackingNumber}" 
                           style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Track Your Shipment
                        </a>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <h4 style="color: #2c3e50;">Need Assistance?</h4>
                        <p>Contact our customer service team:</p>
                        <ul style="list-style: none; padding: 0;">
                            <li>📧 Email: operations@atlanticshippings.com</li>
                            <li>📞 Phone: +55 (27) 3324-2022</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
                        <p>Thank you for choosing Atlantic Shipping.</p>
                        <p style="font-size: 0.8em;">This is an automated message, please do not reply directly to this email.</p>
                    </div>
                </div>
            `
        };
    },

    shipmentCreated: (shipment) => ({
        subject: `Shipment Confirmation - ${shipment.trackingNumber}`,
        text: `
Dear ${shipment.customerName},

Thank you for choosing Atlantic Shipping. Your shipment has been successfully registered in our system.

Shipment Details:
- Tracking Number: ${shipment.trackingNumber}
- Origin: ${shipment.originLocation}
- Destination: ${shipment.destinationLocation}
- Status: Registered for Shipping
${shipment.estimatedDelivery ? `- Estimated Delivery: ${new Date(shipment.estimatedDelivery).toLocaleDateString('pt-BR')}` : ''}

Customer Information:
- Name: ${shipment.customerName}
- Email: ${shipment.customerEmail}
- Phone: ${shipment.customerPhone}
- Address: ${shipment.customerAddress}

You can track your shipment at any time by visiting:
https://atlanticshipping.com.br/track/${shipment.trackingNumber}

If you have any questions or concerns, please don't hesitate to contact us:
Email: operations@atlanticshippings.com
Phone: +55 (27) 3324-2022

Thank you for your business!
        `,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://atlanticshipping.com.br/wp-content/uploads/2025/04/logo-atlantic.png" alt="Atlantic Shipping" style="max-width: 200px;">
                </div>

                <h2 style="color: #2c3e50; text-align: center;">Shipment Confirmation</h2>
                <p style="color: #34495e; text-align: center;">Thank you for choosing Atlantic Shipping. Your shipment has been successfully registered in our system.</p>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Shipment Details</h3>
                    <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
                    <p style="margin: 5px 0;"><strong>Origin:</strong> ${shipment.originLocation}</p>
                    <p style="margin: 5px 0;"><strong>Destination:</strong> ${shipment.destinationLocation}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #3498db;">Registered for Shipping</span></p>
                    ${shipment.estimatedDelivery ? 
                        `<p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${new Date(shipment.estimatedDelivery).toLocaleDateString('pt-BR')}</p>` 
                        : ''}
                </div>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Customer Information</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> ${shipment.customerName}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${shipment.customerEmail}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${shipment.customerPhone}</p>
                    <p style="margin: 5px 0;"><strong>Address:</strong> ${shipment.customerAddress}</p>
                </div>

                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://atlanticshipping.com.br/track/${shipment.trackingNumber}" 
                       style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Track Your Shipment
                    </a>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <h4 style="color: #2c3e50;">Need Assistance?</h4>
                    <p>Contact our customer service team:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li>📧 Email: operations@atlanticshippings.com</li>
                        <li>📞 Phone: +55 (27) 3324-2022</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
                    <p>Thank you for choosing Atlantic Shipping.</p>
                    <p style="font-size: 0.8em;">This is an automated message, please do not reply directly to this email.</p>
                </div>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (to, template) => {
    const mailOptions = {
        from: {
            name: 'Atlantic Shipping',
            address: process.env.EMAIL_USER
        },
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}:`, info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Email notification functions
exports.sendStatusUpdateEmail = async (shipment, status, location) => {
    const template = templates.statusUpdate(shipment, status, location);
    return await sendEmail(shipment.customerEmail, template);
};

exports.sendShipmentCreatedEmail = async (shipment) => {
    const template = templates.shipmentCreated(shipment);
    return await sendEmail(shipment.customerEmail, template);
};