# 📧 Email Setup Instructions

## **Setting up Automated Parent Email Updates**

### **1. Get a Resend API Key**

1. Go to [Resend.com](https://resend.com) and create an account
2. Navigate to API Keys in your dashboard
3. Create a new API key for your TeachAI application
4. Copy the API key (starts with `re_`)

### **2. Configure Environment Variables**

Create a `.env.local` file in your project root and add:

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

**Important:** Never commit your API key to version control!

### **3. Domain Setup (Optional for Production)**

For production use, you should:
1. Add your domain to Resend
2. Set up DNS records for better deliverability
3. Update the "from" email in `convex/emails.ts` to use your domain

### **4. Features Included**

✅ **Automatic Lesson Summary Emails**
- Sent automatically when lessons are completed
- Includes skills assessment, topics covered, notes, and homework
- Professional HTML email template

✅ **Weekly Progress Reports**
- Manual sending of comprehensive weekly summaries
- Shows progress trends and recommendations
- Accessible via "Send Email" button on student cards

✅ **Email Management UI**
- Preview email content before sending
- Parent email validation
- Success/error feedback

### **5. Testing the Email System**

1. Ensure you have students with parent email addresses
2. Complete a lesson to trigger automatic email
3. Use "Send Email" button to send weekly reports manually
4. Check email delivery in your Resend dashboard

### **6. Email Templates**

The system includes two professional email templates:

**Lesson Summary Template:**
- Skills grid with scores and descriptions
- Topics covered section
- Teacher's notes
- Homework assignments
- Next steps recommendations

**Weekly Progress Report:**
- Statistics summary (lessons, average scores)
- Skills progress bars
- Lesson history
- Overall recommendations

### **7. Error Handling**

The system handles:
- Missing parent email addresses
- Email service failures
- Network connectivity issues
- Invalid email formats

### **8. Future Enhancements**

Planned features:
- Scheduled weekly email automation
- Email templates customization
- Email analytics and tracking
- Parent email preferences
- Bulk email capabilities

### **9. Support**

If you encounter issues:
1. Check your Resend API key is correct
2. Verify internet connectivity
3. Check the browser console for error messages
4. Ensure parent email addresses are properly formatted

---

**Ready to send professional lesson summaries to parents! 🎉** 