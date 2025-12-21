"""
Email Service for Authentication
Handles password reset, email verification, etc.
"""
import aiosmtplib
from email.message import EmailMessage
from jinja2 import Template
from typing import Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending authentication-related emails"""

    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email using SMTP.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text fallback (optional)

        Returns:
            True if email sent successfully, False otherwise
        """
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            logger.warning("SMTP not configured - email not sent")
            logger.info(f"Would send email to {to_email}: {subject}")
            return False

        try:
            message = EmailMessage()
            message["From"] = settings.SMTP_FROM or settings.SMTP_USER
            message["To"] = to_email
            message["Subject"] = subject

            if text_content:
                message.set_content(text_content)
                message.add_alternative(html_content, subtype="html")
            else:
                message.set_content(html_content, subtype="html")

            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=settings.SMTP_TLS
            )

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    async def send_password_reset_email(
        to_email: str,
        reset_token: str,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Send password reset email with token link.

        Args:
            to_email: User's email address
            reset_token: Password reset token
            user_name: User's full name (optional)

        Returns:
            True if email sent successfully
        """
        # Construct reset URL (adjust based on your frontend URL)
        frontend_url = settings.CORS_ORIGINS.split(",")[0]  # Use first CORS origin
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        subject = "Password Reset Request - Job Marketplace"

        html_template = Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            {% if user_name %}<p>Hi {{ user_name }},</p>{% else %}<p>Hi there,</p>{% endif %}

            <p>We received a request to reset your password for your Job Marketplace account.</p>

            <p>Click the button below to reset your password:</p>

            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">Reset Password</a>
            </p>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{ reset_url }}</p>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link expires in 1 hour</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>

            <p>If you continue to have problems, please contact support.</p>

            <p>Best regards,<br>Job Marketplace Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        """)

        text_content = f"""
Password Reset Request

Hi {user_name or 'there'},

We received a request to reset your password for your Job Marketplace account.

Please click the link below to reset your password:
{reset_url}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Job Marketplace Team
        """

        html_content = html_template.render(
            user_name=user_name,
            reset_url=reset_url
        )

        return await EmailService.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )

    @staticmethod
    async def send_verification_email(
        to_email: str,
        verification_token: str,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Send email verification link.

        Args:
            to_email: User's email address
            verification_token: Email verification token
            user_name: User's full name (optional)

        Returns:
            True if email sent successfully
        """
        frontend_url = settings.CORS_ORIGINS.split(",")[0]
        verification_url = f"{frontend_url}/verify-email?token={verification_token}"

        subject = "Verify Your Email - Job Marketplace"

        html_template = Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Job Marketplace!</h1>
        </div>
        <div class="content">
            {% if user_name %}<p>Hi {{ user_name }},</p>{% else %}<p>Hi there,</p>{% endif %}

            <p>Thank you for registering! Please verify your email address to activate your account.</p>

            <p style="text-align: center;">
                <a href="{{ verification_url }}" class="button">Verify Email</a>
            </p>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{ verification_url }}</p>

            <p>This link expires in 24 hours.</p>

            <p>Best regards,<br>Job Marketplace Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        """)

        html_content = html_template.render(
            user_name=user_name,
            verification_url=verification_url
        )

        return await EmailService.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content
        )
