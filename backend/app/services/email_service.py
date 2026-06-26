import os
import smtplib
from email.message import EmailMessage
from typing import Optional

def get_smtp_config():
    return {
        "server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
        "port": int(os.getenv("SMTP_PORT", 587)),
        "username": os.getenv("SMTP_USERNAME"),
        "password": os.getenv("SMTP_PASSWORD"),
        "from_email": os.getenv("FROM_EMAIL", os.getenv("SMTP_USERNAME")),
    }

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    config = get_smtp_config()
    
    # If SMTP is not fully configured, log and return False
    if not config["username"] or not config["password"] or config["password"] == "your_16_char_google_app_password":
        print(f"\n--- [EMAIL MOCK] ---")
        print(f"Would send email to {to_email} with subject: {subject}")
        print(f"Content length: {len(html_content)} bytes")
        print(f"--------------------\n")
        return False
        
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = f"Team Collab <{config['from_email']}>"
    msg['To'] = to_email
    
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')
    
    try:
        with smtplib.SMTP(config["server"], config["port"]) as server:
            server.starttls()
            server.login(config["username"], config["password"])
            server.send_message(msg)
        print(f"[EMAIL SUCCESS] Sent email to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {e}")
        return False

def send_password_reset_email(to_email: str, reset_url: str):
    subject = "Password Reset Request - Team Collab"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1;">Password Reset</h2>
            <p>You requested a password reset for your Team Collab account.</p>
            <p>Please click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">{reset_url}</p>
            <p>If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, html_content)

def send_invite_email(to_email: str, inviter_name: str, org_name: str, invite_url: str):
    subject = f"You've been invited to join {org_name} on Team Collab"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #6366f1; margin: 0;">Team Collab</h1>
            </div>
            <h2 style="color: #111;">You're Invited!</h2>
            <p><strong>{inviter_name}</strong> has invited you to collaborate in the workspace <strong>{org_name}</strong>.</p>
            <div style="text-align: center; margin: 35px 0;">
                <a href="{invite_url}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Accept Invitation</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">{invite_url}</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">If you don't know the sender, you can safely ignore this email.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, html_content)
