from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import threading

app = Flask(__name__)
CORS(app, origins=["https://load-sahyog.vercel.app"])

# Email Configuration
SMTP_SERVER    = "smtp.gmail.com"
SMTP_PORT      = 587
SENDER_EMAIL   = "sksrrrk@gmail.com"
SENDER_PASSWORD = "uxql ijhl iiwf tsbd"
TARGET_EMAIL   = "sksrrrk@gmail.com"

def send_email_notification(data):
    """Send email in background thread so it never blocks the worker"""
    try:
        subject = f"New Enquiry from {data.get('name', 'Unknown')} - Load Sahyog"

        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f97316, #fbbf24); color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #f97316; }}
                .value {{ margin-left: 10px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🚛 New Enquiry Received</h2>
                    <p>Load Sahyog - India's Trusted Transport Network</p>
                </div>
                <div class="content">
                    <div class="field"><span class="label">User Type:</span>    <span class="value">{data.get('userType', 'N/A')}</span></div>
                    <div class="field"><span class="label">Name:</span>          <span class="value">{data.get('name', 'N/A')}</span></div>
                    <div class="field"><span class="label">Phone:</span>         <span class="value">{data.get('phone', 'N/A')}</span></div>
                    <div class="field"><span class="label">Email:</span>         <span class="value">{data.get('email', 'N/A')}</span></div>
                    <div class="field"><span class="label">Company:</span>       <span class="value">{data.get('company', 'N/A')}</span></div>
                    <div class="field"><span class="label">Pickup City:</span>   <span class="value">{data.get('pickup', 'N/A')}</span></div>
                    <div class="field"><span class="label">Delivery City:</span> <span class="value">{data.get('delivery', 'N/A')}</span></div>
                    <div class="field"><span class="label">Cargo Type:</span>    <span class="value">{data.get('cargo', 'N/A')}</span></div>
                    <div class="field"><span class="label">Weight:</span>        <span class="value">{data.get('weight', 'N/A')}</span></div>
                    <div class="field"><span class="label">Message:</span>       <span class="value">{data.get('message', 'N/A')}</span></div>
                    <div class="field"><span class="label">Firebase ID:</span>   <span class="value">{data.get('firebaseId', 'N/A')}</span></div>
                    <div class="field"><span class="label">Received At:</span>   <span class="value">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</span></div>
                </div>
                <div class="footer">
                    <p>Please respond to this enquiry within 2 hours.</p>
                    <p>View in Firebase Console: https://console.firebase.google.com</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['From']    = SENDER_EMAIL
        msg['To']      = TARGET_EMAIL
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()

        print(f"✅ Email sent to {TARGET_EMAIL}")

    except Exception as e:
        print(f"❌ Email error: {e}")


def send_feedback_email(data):
    """Send feedback email in background thread"""
    try:
        stars   = '★' * int(data.get('rating', 0)) + '☆' * (5 - int(data.get('rating', 0)))
        subject = f"New Feedback from {data.get('name', 'Anonymous')} - Load Sahyog"

        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #111827, #1a2332); color: white; padding: 20px; text-align: center; }}
                .stars {{ font-size: 28px; color: #fbbf24; letter-spacing: 4px; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #f97316; }}
                .value {{ margin-left: 10px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>⭐ New Feedback Received</h2>
                    <div class="stars">{stars}</div>
                    <p>Load Sahyog - India's Trusted Transport Network</p>
                </div>
                <div class="content">
                    <div class="field"><span class="label">Name:</span>       <span class="value">{data.get('name', 'N/A')}</span></div>
                    <div class="field"><span class="label">Contact:</span>    <span class="value">{data.get('contact', 'N/A')}</span></div>
                    <div class="field"><span class="label">Role:</span>       <span class="value">{data.get('role', 'N/A')}</span></div>
                    <div class="field"><span class="label">Service:</span>    <span class="value">{data.get('service', 'N/A')}</span></div>
                    <div class="field"><span class="label">Rating:</span>     <span class="value">{data.get('rating', 0)} / 5</span></div>
                    <div class="field"><span class="label">Recommend:</span>  <span class="value">{data.get('recommend', 'N/A')}</span></div>
                    <div class="field"><span class="label">Feedback:</span>   <span class="value">{data.get('message', 'N/A')}</span></div>
                    <div class="field"><span class="label">Received At:</span><span class="value">{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</span></div>
                </div>
                <div class="footer">
                    <p>View in Firebase Console: https://console.firebase.google.com</p>
                </div>
            </div>
        </body>
        </html>
        """

        msg = MIMEMultipart('alternative')
        msg['From']    = SENDER_EMAIL
        msg['To']      = TARGET_EMAIL
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()

        print(f"✅ Feedback email sent to {TARGET_EMAIL}")

    except Exception as e:
        print(f"❌ Feedback email error: {e}")


@app.route('/api/contact', methods=['POST'])
def handle_contact():
    try:
        data = request.json
        print(f"📝 Received enquiry from {data.get('name')}")

        # ✅ Send email in background thread — worker never times out
        thread = threading.Thread(target=send_email_notification, args=(data,))
        thread.daemon = True
        thread.start()

        return jsonify({
            'status':   'success',
            'message':  'Enquiry received successfully',
            'data':      data
        }), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/feedback', methods=['POST'])
def handle_feedback():
    try:
        data = request.json
        print(f"📝 Received feedback from {data.get('name')}")

        # ✅ Send email in background thread
        thread = threading.Thread(target=send_feedback_email, args=(data,))
        thread.daemon = True
        thread.start()

        return jsonify({
            'status':  'success',
            'message': 'Feedback recorded successfully',
            'data':     data
        }), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status':    'healthy',
        'timestamp':  datetime.now().isoformat(),
        'service':   'Load Sahyog Backend'
    }), 200


if __name__ == '__main__':
    print("🚛 Load Sahyog Backend Server")
    print("=" * 40)
    print(f"📧 Email notifications → {TARGET_EMAIL}")
    print(f"🌐 Server running at: http://localhost:5000")
    print("=" * 40)
    app.run(debug=True, port=5000)